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
    const weekStart = weekParam || getCurrentWeekStart();
    const filter = `AND({booker_slug} = "${booker}", {week_start} = "${weekStart}")`;
    const res = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filter)}`,
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
// POST — upsert a week's data
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booker_slug, booker_name, week_start, data } = body as {
      booker_slug: string;
      booker_name?: string;
      week_start: string;
      data: unknown;
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

    // Look up existing record for (booker, week)
    const filter = `AND({booker_slug} = "${booker_slug}", {week_start} = "${week_start}")`;
    const checkRes = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filter)}`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        cache: "no-store",
      }
    );
    const checkData = await checkRes.json();
    const existing = checkData.records?.[0];

    const fields = {
      booker_slug,
      booker_name: booker_name || bookerName(booker_slug),
      week_start,
      data: JSON.stringify(data || {}),
      last_updated: new Date().toISOString(),
    };

    let res: Response;
    if (existing) {
      res = await fetch(`${AIRTABLE_URL}/${existing.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });
    } else {
      res = await fetch(AIRTABLE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Airtable write error:", errorData);
      return NextResponse.json(
        { error: "Failed to save checklist" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Checklist POST error:", err);
    return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 });
  }
}
