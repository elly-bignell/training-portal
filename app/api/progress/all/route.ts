// app/api/progress/all/route.ts

import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Progress";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

// GET - Fetch all trainees' progress (for admin dashboard)
export async function GET() {
  try {
    const response = await fetch(AIRTABLE_URL, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();
    
    const records = data.records.map((record: any) => ({
      id: record.id,
      trainee_slug: record.fields.trainee_slug,
      trainee_name: record.fields.trainee_name,
      checked_items: record.fields.checked_items ? JSON.parse(record.fields.checked_items) : {},
      notes: record.fields.notes ? JSON.parse(record.fields.notes) : {},
      overall_progress: record.fields.overall_progress || 0,
      last_updated: record.fields.last_updated,
    }));

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching from Airtable:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
