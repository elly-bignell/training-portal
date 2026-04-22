// app/api/checklist/route.ts
//
// GET  /api/checklist?booker=<slug>&week=<YYYY-MM-DD>
//        → returns the week record for that booker + week start (Monday ISO).
//          If no record exists yet, returns { exists: false } and the caller
//          starts from an empty state.
//        → omit `week` to get the current week (Sunday-rollover rule applied).
//
// GET  /api/checklist?booker=<slug>&list=1
//        → returns a list of existing week_start dates for that booker (for
//          the admin week-picker). Newest first.
//
// POST /api/checklist
//        body: { booker_slug, booker_name, week_start, data }
//        → upserts the record for (booker_slug, week_start). Stores `data`
//          as a JSON string in the Airtable long-text column.

import { NextRequest, NextResponse } from "next/server";
import { BOOKERS } from "@/data/checklistTemplate";
import { getCurrentWeekStart } from "@/lib/week";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Checklists";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

function isValidBooker(slug: string): boolean {
  return BOOKERS.some((b) => b.slug === slug);
}

function bookerName(slug: string): string {
  return BOOKERS.find((b) => b.slug === slug)?.name || slug;
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const booker = searchParams.get("booker");
  const list = searchParams.get("list");
  const weekParam = searchParams.get("week");

  if (!booker) {
    return NextResponse.json({ error: "booker is required" }, { status: 400 });
  }
  if (!isValidBooker(booker)) {
    return NextResponse.json({ error: "unknown booker" }, { status: 400 });
  }

  try {
    // --- list mode: return available week_start values for this booker ----
    if (list) {
      const filter = `{booker_slug} = "${booker}"`;
      const res = await fetch(
        `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filter)}&fields%5B%5D=week_start&sort%5B0%5D%5Bfield%5D=week_start&sort%5B0%5D%5Bdirection%5D=desc&pageSize=100`,
        {
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
      const data = await res.json();
      const weeks: string[] = (data.records || [])
        .map((r: any) => r.fields?.week_start)
        .filter(Boolean);
      return NextResponse.json({ weeks });
    }

    // --- single-week mode ---
    // Sort by last_updated DESC so that if duplicate rows still exist from
    // before the dedupe code landed, we always return the freshest one.
    // Use DATETIME_FORMAT for the date comparison — Airtable's direct string
    // equality on Date fields is fragile.
    const weekStart = weekParam || getCurrentWeekStart();
    const filter = `AND({booker_slug} = "${booker}", DATETIME_FORMAT({week_start}, 'YYYY-MM-DD') = "${weekStart}")`;
    const res = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filter)}&sort%5B0%5D%5Bfield%5D=last_updated&sort%5B0%5D%5Bdirection%5D=desc`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
    const data = await res.json();

    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      let parsed: any = {};
      try {
        parsed = record.fields.data ? JSON.parse(record.fields.data) : {};
      } catch {
        parsed = {};
      }
      return NextResponse.json({
        exists: true,
        id: record.id,
        booker_slug: record.fields.booker_slug,
        booker_name: record.fields.booker_name,
        week_start: record.fields.week_start,
        data: parsed,
        last_updated: record.fields.last_updated,
      });
    }

    return NextResponse.json({
      exists: false,
      booker_slug: booker,
      booker_name: bookerName(booker),
      week_start: weekStart,
      data: {},
    });
  } catch (err) {
    console.error("Checklist GET error:", err);
    return NextResponse.json({ error: "Failed to fetch checklist" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — save a week's data with self-healing dedupe
//
// Airtable has no unique constraints, and `performUpsert` isn't atomic
// across concurrent HTTP requests. To handle both existing duplicates
// and future races, every save does:
//   1. Query all rows matching (booker_slug, week_start).
//   2. If 0 rows → create one.
//   3. If ≥1 row → keep the newest, delete the rest, update the survivor.
// This guarantees exactly one row per booker per week after any save.
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booker_slug, booker_name, week_start, data } = body as {
      booker_slug: string;
      booker_name?: string;
      week_start: string;
      data: Record<string, Record<string, unknown>> | undefined;
    };

    if (!booker_slug || !week_start) {
      return NextResponse.json(
        { error: "booker_slug and week_start are required" },
        { status: 400 }
      );
    }
    if (!isValidBooker(booker_slug)) {
      return NextResponse.json({ error: "unknown booker" }, { status: 400 });
    }

    // Skip writes when there's nothing meaningful to save. This prevents
    // an empty row being created if a user merely opens the page without
    // ticking anything, or cycles every item back to Not Complete.
    const hasRealData =
      data &&
      Object.values(data).some(
        (day) => day && typeof day === "object" && Object.keys(day).length > 0
      );
    if (!hasRealData) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const fields = {
      booker_slug,
      booker_name: booker_name || bookerName(booker_slug),
      week_start,
      data: JSON.stringify(data),
      last_updated: new Date().toISOString(),
    };

    const authHeader = { Authorization: `Bearer ${AIRTABLE_API_KEY}` };
    const jsonHeader = { ...authHeader, "Content-Type": "application/json" };

    // 1) Find all matching rows, sorted newest-first.
    // IMPORTANT: week_start is a Date field in Airtable — direct string equality
    // is unreliable (Airtable may stringify it with a time/timezone component),
    // so we use DATETIME_FORMAT to compare on the YYYY-MM-DD portion only.
    // This MUST match the filter used in GET, otherwise the dedupe check returns
    // zero matches and a new duplicate row is created on every save.
    const filter = `AND({booker_slug} = "${booker_slug}", DATETIME_FORMAT({week_start}, 'YYYY-MM-DD') = "${week_start}")`;
    const checkRes = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filter)}&sort%5B0%5D%5Bfield%5D=last_updated&sort%5B0%5D%5Bdirection%5D=desc`,
      { headers: authHeader, cache: "no-store" }
    );
    if (!checkRes.ok) {
      const errorData = await checkRes.json().catch(() => ({}));
      console.error("Airtable read error:", errorData);
      return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 });
    }
    const checkData = await checkRes.json();
    const existing: { id: string }[] = checkData.records || [];

    // 2) No existing row → create.
    if (existing.length === 0) {
      const createRes = await fetch(AIRTABLE_URL, {
        method: "POST",
        headers: jsonHeader,
        body: JSON.stringify({ fields }),
      });
      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => ({}));
        console.error("Airtable create error:", errorData);
        return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: "created" });
    }

    // 3) ≥1 existing row → keep the newest, delete the rest, update the survivor.
    const [keep, ...duplicates] = existing;

    // Delete duplicates (Airtable DELETE allows up to 10 ids per call)
    if (duplicates.length > 0) {
      const idsInBatches: string[][] = [];
      for (let i = 0; i < duplicates.length; i += 10) {
        idsInBatches.push(duplicates.slice(i, i + 10).map((r) => r.id));
      }
      for (const batch of idsInBatches) {
        const qs = batch.map((id) => `records[]=${encodeURIComponent(id)}`).join("&");
        await fetch(`${AIRTABLE_URL}?${qs}`, {
          method: "DELETE",
          headers: authHeader,
        });
      }
    }

    // Update the survivor
    const updateRes = await fetch(`${AIRTABLE_URL}/${keep.id}`, {
      method: "PATCH",
      headers: jsonHeader,
      body: JSON.stringify({ fields }),
    });
    if (!updateRes.ok) {
      const errorData = await updateRes.json().catch(() => ({}));
      console.error("Airtable update error:", errorData);
      return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action: "updated",
      deduped: duplicates.length,
    });
  } catch (err) {
    console.error("Checklist POST error:", err);
    return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 });
  }
}
