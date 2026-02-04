// app/api/progress/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Progress";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

// GET - Fetch progress for a trainee
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const traineeSlug = searchParams.get("trainee_slug");

  if (!traineeSlug) {
    return NextResponse.json({ error: "trainee_slug is required" }, { status: 400 });
  }

  try {
    const filterFormula = `{trainee_slug} = "${traineeSlug}"`;
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

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      return NextResponse.json({
        id: record.id,
        trainee_slug: record.fields.trainee_slug,
        trainee_name: record.fields.trainee_name,
        checked_items: record.fields.checked_items ? JSON.parse(record.fields.checked_items) : {},
        notes: record.fields.notes ? JSON.parse(record.fields.notes) : {},
        overall_progress: record.fields.overall_progress || 0,
        last_updated: record.fields.last_updated,
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Error fetching from Airtable:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

// POST - Create or update progress for a trainee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainee_slug, trainee_name, checked_items, notes, overall_progress } = body;

    if (!trainee_slug) {
      return NextResponse.json({ error: "trainee_slug is required" }, { status: 400 });
    }

    // First, check if record exists
    const filterFormula = `{trainee_slug} = "${trainee_slug}"`;
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
      checked_items: JSON.stringify(checked_items || {}),
      notes: JSON.stringify(notes || {}),
      overall_progress: overall_progress || 0,
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
    console.error("Error saving to Airtable:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
