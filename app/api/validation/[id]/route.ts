// app/api/validation/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE = "Bookings";
const URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE)}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const fields: Record<string, any> = {};
    if (body.status) fields.status = body.status;
    if (body.validation_date) fields.validation_date = body.validation_date;
    if (body.validation_note !== undefined) fields.validation_note = body.validation_note;
    if (body.observation_date) fields.observation_date = body.observation_date;

    const res = await fetch(`${URL}/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Airtable PATCH error:", err);
      throw new Error(`Airtable error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ success: true, record: data });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
