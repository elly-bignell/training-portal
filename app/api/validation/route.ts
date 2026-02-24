// app/api/validation/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE = "Bookings";
const URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE)}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
};

// GET — fetch all bookings (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staff = searchParams.get("staff");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filters: string[] = [];
    if (staff) filters.push(`{staff_member} = "${staff}"`);
    if (status) filters.push(`{status} = "${status}"`);
    if (from) filters.push(`IS_AFTER({booking_date}, "${from}")`);
    if (to) filters.push(`IS_BEFORE({booking_date}, "${to}")`);

    let filterFormula = "";
    if (filters.length === 1) filterFormula = filters[0];
    else if (filters.length > 1) filterFormula = `AND(${filters.join(",")})`;

    let allRecords: any[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams();
      if (filterFormula) params.set("filterByFormula", filterFormula);
      params.set("sort[0][field]", "booking_date");
      params.set("sort[0][direction]", "desc");
      if (offset) params.set("offset", offset);

      const res = await fetch(`${URL}?${params.toString()}`, {
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Airtable GET error:", err);
        throw new Error(`Airtable error: ${res.status}`);
      }

      const data = await res.json();
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset;
    } while (offset);

    const bookings = allRecords.map((r: any) => ({
      id: r.id,
      booking_date: r.fields.booking_date || "",
      business_name: r.fields.business_name || "",
      contact_name: r.fields.contact_name || "",
      contact_phone: r.fields.contact_phone || "",
      meeting_datetime: r.fields.meeting_datetime || "",
      lead_source: r.fields.lead_source || "",
      staff_member: r.fields.staff_member || "",
      buddy: r.fields.buddy || "",
      status: r.fields.status || "pending",
      validation_date: r.fields.validation_date || "",
      validation_note: r.fields.validation_note || "",
      observation_date: r.fields.observation_date || "",
      created_at: r.fields.created_at || "",
    }));

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST — create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_date, business_name, contact_name, contact_phone, meeting_datetime, lead_source, staff_member, buddy } = body;

    if (!business_name || !staff_member || !booking_date) {
      return NextResponse.json({ error: "business_name, staff_member, and booking_date are required" }, { status: 400 });
    }

    const fields: Record<string, any> = {
      booking_date,
      business_name,
      staff_member,
      buddy: buddy || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };
    if (contact_name) fields.contact_name = contact_name;
    if (contact_phone) fields.contact_phone = contact_phone;
    if (meeting_datetime) fields.meeting_datetime = meeting_datetime;
    if (lead_source) fields.lead_source = lead_source;

    const res = await fetch(URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Airtable POST error:", err);
      throw new Error(`Airtable error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
