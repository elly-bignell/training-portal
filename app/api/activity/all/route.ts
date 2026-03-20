// app/api/activity/all/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "DailyActivity";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

// GET - Fetch all activity for a trainee (or all trainees)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const traineeSlug = searchParams.get("trainee_slug");

  try {
    let filterFormula = "";
    if (traineeSlug) {
      filterFormula = `?filterByFormula=${encodeURIComponent(`{trainee_slug} = "${traineeSlug}"`)}`;
    }

    // Paginate through all Airtable records
    let allRawRecords: any[] = [];
    let offset: string | undefined;

    do {
      const offsetParam: string = offset ? `&offset=${offset}` : "";
      const response = await fetch(
        `${AIRTABLE_URL}${filterFormula}&sort%5B0%5D%5Bfield%5D=date&sort%5B0%5D%5Bdirection%5D=desc&pageSize=100${offsetParam}`,
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
      allRawRecords = allRawRecords.concat(data.records || []);
      offset = data.offset;
    } while (offset);

    const records = allRawRecords.map((record: any) => ({
      id: record.id,
      trainee_slug: record.fields.trainee_slug,
      trainee_name: record.fields.trainee_name,
      date: record.fields.date,
      calls_made: record.fields.calls_made || 0,
      calls: record.fields.calls || 0,
      bookings: record.fields.bookings || 0,
      meetings: record.fields.meetings || 0,
      units: record.fields.units || 0,
      revenue: record.fields.revenue || 0,
      last_updated: record.fields.last_updated,
    }));

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching all activity from Airtable:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
