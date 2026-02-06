// app/api/activity/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "DailyActivity";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

// Get Adelaide date string (YYYY-MM-DD)
function getAdelaideDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
}

// GET - Fetch activity for a trainee (today or date range)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const traineeSlug = searchParams.get("trainee_slug");
  const date = searchParams.get("date") || getAdelaideDate();
  const weekStart = searchParams.get("week_start");
  const weekEnd = searchParams.get("week_end");

  if (!traineeSlug) {
    return NextResponse.json({ error: "trainee_slug is required" }, { status: 400 });
  }

  try {
    let filterFormula: string;
    
    if (weekStart && weekEnd) {
      // Fetch a date range (for weekly totals)
      filterFormula = `AND({trainee_slug} = "${traineeSlug}", {date} >= "${weekStart}", {date} <= "${weekEnd}")`;
    } else {
      // Fetch single day
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

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();

    if (weekStart && weekEnd) {
      // Return array of daily records for the week
      const records = data.records.map((record: any) => ({
        id: record.id,
        date: record.fields.date,
        calls: record.fields.calls || 0,
        bookings: record.fields.bookings || 0,
        meetings: record.fields.meetings || 0,
        units: record.fields.units || 0,
        revenue: record.fields.revenue || 0,
      }));
      
      // Calculate weekly totals
      const weeklyTotals = records.reduce(
        (acc: any, r: any) => ({
          calls: acc.calls + r.calls,
          bookings: acc.bookings + r.bookings,
          meetings: acc.meetings + r.meetings,
          units: acc.units + r.units,
          revenue: acc.revenue + r.revenue,
        }),
        { calls: 0, bookings: 0, meetings: 0, units: 0, revenue: 0 }
      );

      return NextResponse.json({ records, weeklyTotals });
    }

    // Single day response
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      return NextResponse.json({
        id: record.id,
        trainee_slug: record.fields.trainee_slug,
        date: record.fields.date,
        calls: record.fields.calls || 0,
        bookings: record.fields.bookings || 0,
        meetings: record.fields.meetings || 0,
        units: record.fields.units || 0,
        revenue: record.fields.revenue || 0,
      });
    }

    // No record for today yet
    return NextResponse.json({
      exists: false,
      date,
      calls: 0,
      bookings: 0,
      meetings: 0,
      units: 0,
      revenue: 0,
    });
  } catch (error) {
    console.error("Error fetching activity from Airtable:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

// POST - Create or update daily activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainee_slug, trainee_name, calls, bookings, meetings, units, revenue } = body;
    const date = body.date || getAdelaideDate();

    if (!trainee_slug) {
      return NextResponse.json({ error: "trainee_slug is required" }, { status: 400 });
    }

    // Check if record exists for this trainee + date
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
      calls: calls || 0,
      bookings: bookings || 0,
      meetings: meetings || 0,
      units: units || 0,
      revenue: revenue || 0,
      last_updated: new Date().toISOString(),
    };

    let response;

    if (existingRecord) {
      // Update existing record
      response = await fetch(`${AIRTABLE_URL}/${existingRecord.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });
    } else {
      // Create new record
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
    console.error("Error saving activity to Airtable:", error);
    return NextResponse.json({ error: "Failed to save activity" }, { status: 500 });
  }
}
