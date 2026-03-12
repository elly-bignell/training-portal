// app/api/easter-promo/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "EasterPromo";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

const PROMO_START = "2026-03-03";
const PROMO_END = "2026-04-01";
const EXTENSION_START = "2026-04-09";
const EXTENSION_END = "2026-04-17";

const PROMO_FIELDS = [
  "pitches",
  "pipe_own",
  "pipe_buddy",
  "express_closes_own",
  "express_closes_buddy",
  "standard_closes_own",
  "standard_closes_buddy",
  "quodo_bookings",
] as const;

function getAdelaideDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
}

function extractFields(fields: any) {
  const result: Record<string, number> = {};
  for (const f of PROMO_FIELDS) {
    result[f] = fields[f] || 0;
  }
  return result;
}

// GET
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const traineeSlug = searchParams.get("trainee_slug");
  const all = searchParams.get("all");
  const totalsOnly = searchParams.get("totals");
  const allTeam = searchParams.get("all_team");
  const date = searchParams.get("date") || getAdelaideDate();

  try {
    if (allTeam) {
      const filterFormula = `OR(AND({date} >= "${PROMO_START}", {date} <= "${PROMO_END}"), AND({date} >= "${EXTENSION_START}", {date} <= "${EXTENSION_END}"))`;
      const response = await fetch(
        `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filterFormula)}`,
        {
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
          cache: "no-store",
        }
      );
      if (!response.ok) throw new Error(`Airtable error: ${response.status}`);
      const data = await response.json();
      const records = data.records.map((r: any) => ({
        id: r.id,
        trainee_slug: r.fields.trainee_slug,
        trainee_name: r.fields.trainee_name,
        date: r.fields.date,
        ...extractFields(r.fields),
      }));
      return NextResponse.json({ records });
    }

    if (!traineeSlug) {
      return NextResponse.json({ error: "trainee_slug is required" }, { status: 400 });
    }

    let filterFormula: string;
    if (all || totalsOnly) {
      filterFormula = `AND({trainee_slug} = "${traineeSlug}", OR(AND({date} >= "${PROMO_START}", {date} <= "${PROMO_END}"), AND({date} >= "${EXTENSION_START}", {date} <= "${EXTENSION_END}")))`;
    } else {
      filterFormula = `AND({trainee_slug} = "${traineeSlug}", {date} = "${date}")`;
    }

    const response = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filterFormula)}&sort%5B0%5D%5Bfield%5D=date&sort%5B0%5D%5Bdirection%5D=asc`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error(`Airtable error: ${response.status}`);
    const data = await response.json();

    if (all || totalsOnly) {
      const records = data.records.map((r: any) => ({
        id: r.id,
        date: r.fields.date,
        ...extractFields(r.fields),
      }));
      const totals: Record<string, number> = {};
      for (const f of PROMO_FIELDS) { totals[f] = 0; }
      for (const r of records) {
        for (const f of PROMO_FIELDS) { totals[f] += r[f] || 0; }
      }
      return NextResponse.json({ records, totals });
    }

    // Single day
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      return NextResponse.json({
        id: record.id,
        date: record.fields.date,
        ...extractFields(record.fields),
      });
    }

    const empty: Record<string, any> = { exists: false, date };
    for (const f of PROMO_FIELDS) { empty[f] = 0; }
    return NextResponse.json(empty);
  } catch (error) {
    console.error("Error fetching easter promo data:", error);
    return NextResponse.json({ error: "Failed to fetch easter promo data" }, { status: 500 });
  }
}

// POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainee_slug, trainee_name } = body;
    const date = body.date || getAdelaideDate();

    if (!trainee_slug) {
      return NextResponse.json({ error: "trainee_slug is required" }, { status: 400 });
    }

    const filterFormula = `AND({trainee_slug} = "${trainee_slug}", {date} = "${date}")`;
    const checkResponse = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filterFormula)}`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    const checkData = await checkResponse.json();
    const existingRecord = checkData.records?.[0];

    const fields: Record<string, any> = {
      trainee_slug,
      trainee_name: trainee_name || trainee_slug,
      date,
    };
    for (const f of PROMO_FIELDS) {
      fields[f] = body[f] || 0;
    }

    let response;
    if (existingRecord) {
      response = await fetch(`${AIRTABLE_URL}/${existingRecord.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
    } else {
      response = await fetch(AIRTABLE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Airtable error:", errorData);
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, record: data });
  } catch (error) {
    console.error("Error saving easter promo data:", error);
    return NextResponse.json({ error: "Failed to save easter promo data" }, { status: 500 });
  }
}
