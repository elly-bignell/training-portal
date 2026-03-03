// app/api/easter-promo/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "EasterPromo";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

// Easter promo date range
const PROMO_START = "2026-03-03";
const PROMO_END = "2026-04-01";
const EXTENSION_START = "2026-04-09";
const EXTENSION_END = "2026-04-17";

function getAdelaideDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
}

// GET - Fetch easter promo data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const traineeSlug = searchParams.get("trainee_slug");
  const all = searchParams.get("all");
  const allTeam = searchParams.get("all_team");
  const date = searchParams.get("date") || getAdelaideDate();

  try {
    // Fetch ALL team data (for admin summary)
    if (allTeam) {
      const filterFormula = `OR(AND({date} >= "${PROMO_START}", {date} <= "${PROMO_END}"), AND({date} >= "${EXTENSION_START}", {date} <= "${EXTENSION_END}"))`;

      const response = await fetch(
        `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filterFormula)}`,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
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
        pitches: r.fields.pitches || 0,
        promo_closes_own: r.fields.promo_closes_own || 0,
        promo_closes_buddy: r.fields.promo_closes_buddy || 0,
        quodo_bookings: r.fields.quodo_bookings || 0,
      }));

      return NextResponse.json({ records });
    }

    if (!traineeSlug) {
      return NextResponse.json({ error: "trainee_slug is required" }, { status: 400 });
    }

    let filterFormula: string;

    if (all) {
      filterFormula = `AND({trainee_slug} = "${traineeSlug}", OR(AND({date} >= "${PROMO_START}", {date} <= "${PROMO_END}"), AND({date} >= "${EXTENSION_START}", {date} <= "${EXTENSION_END}")))`;
    } else {
      filterFormula = `AND({trainee_slug} = "${traineeSlug}", {date} = "${date}")`;
    }

    const response = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filterFormula)}&sort%5B0%5D%5Bfield%5D=date&sort%5B0%5D%5Bdirection%5D=asc`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) throw new Error(`Airtable error: ${response.status}`);
    const data = await response.json();

    if (all) {
      const records = data.records.map((r: any) => ({
        id: r.id,
        date: r.fields.date,
        pitches: r.fields.pitches || 0,
        promo_closes_own: r.fields.promo_closes_own || 0,
        promo_closes_buddy: r.fields.promo_closes_buddy || 0,
        quodo_bookings: r.fields.quodo_bookings || 0,
      }));

      const totals = records.reduce(
        (acc: any, r: any) => ({
          pitches: acc.pitches + r.pitches,
          promo_closes_own: acc.promo_closes_own + r.promo_closes_own,
          promo_closes_buddy: acc.promo_closes_buddy + r.promo_closes_buddy,
          quodo_bookings: acc.quodo_bookings + r.quodo_bookings,
        }),
        { pitches: 0, promo_closes_own: 0, promo_closes_buddy: 0, quodo_bookings: 0 }
      );

      return NextResponse.json({ records, totals });
    }

    // Single day
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      return NextResponse.json({
        id: record.id,
        date: record.fields.date,
        pitches: record.fields.pitches || 0,
        promo_closes_own: record.fields.promo_closes_own || 0,
        promo_closes_buddy: record.fields.promo_closes_buddy || 0,
        quodo_bookings: record.fields.quodo_bookings || 0,
      });
    }

    return NextResponse.json({
      exists: false,
      date,
      pitches: 0,
      promo_closes_own: 0,
      promo_closes_buddy: 0,
      quodo_bookings: 0,
    });
  } catch (error) {
    console.error("Error fetching easter promo data:", error);
    return NextResponse.json({ error: "Failed to fetch easter promo data" }, { status: 500 });
  }
}

// POST - Create or update easter promo daily record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainee_slug, trainee_name, pitches, promo_closes_own, promo_closes_buddy, quodo_bookings } = body;
    const date = body.date || getAdelaideDate();

    if (!trainee_slug) {
      return NextResponse.json({ error: "trainee_slug is required" }, { status: 400 });
    }

    // Check if record exists
    const filterFormula = `AND({trainee_slug} = "${trainee_slug}", {date} = "${date}")`;
    const checkResponse = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filterFormula)}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const checkData = await checkResponse.json();
    const existingRecord = checkData.records?.[0];

    const fields = {
      trainee_slug,
      trainee_name: trainee_name || trainee_slug,
      date,
      pitches: pitches || 0,
      promo_closes_own: promo_closes_own || 0,
      promo_closes_buddy: promo_closes_buddy || 0,
      quodo_bookings: quodo_bookings || 0,
      last_updated: new Date().toISOString(),
    };

    let response;

    if (existingRecord) {
      response = await fetch(`${AIRTABLE_URL}/${existingRecord.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });
    } else {
      response = await fetch(AIRTABLE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
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
