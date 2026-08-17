// app/api/pbs/route.ts
//
// POST /api/pbs — updates a trainee's personal best (bookings) fields
// on the Airtable Portal Users row. Called inline from the Calls &
// Bookings section of the home page when someone edits the PB Day or
// PB Week input.
//
// Auth: any active Portal Users password. We're inside the portal at
// this point — anyone logged in is a trusted teammate. No per-user
// restriction (Elly can vet after the fact).
//
// Body: { slug: string, kind: "day" | "week", value: number | null }
//   value = null clears the field.
//
// Response: { ok: boolean, error?: string }

import { NextResponse } from "next/server";

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY = process.env.AIRTABLE_API_KEY!;
const TABLE = "Portal Users";
const FIELD_DAY = "fldOjPeikhlQmhwFy"; // PBBookingsDay
const FIELD_WEEK = "fld1Wmq0Is2JpSiAe"; // PBBookingsWeek
const SLUG_FIELD = "Slug";

export const runtime = "nodejs";

interface Body {
  slug?: string;
  kind?: "day" | "week";
  value?: number | null;
}

export async function POST(req: Request) {
  try {
    if (!BASE_ID || !API_KEY) {
      return NextResponse.json(
        { ok: false, error: "Server config missing (AIRTABLE_*)." },
        { status: 500 }
      );
    }

    let body: Body;
    try {
      body = (await req.json()) as Body;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Body must be JSON." },
        { status: 400 }
      );
    }

    const { slug, kind, value } = body;
    if (!slug || (kind !== "day" && kind !== "week")) {
      return NextResponse.json(
        { ok: false, error: "Missing slug or kind (must be 'day' or 'week')." },
        { status: 400 }
      );
    }
    if (value !== null && typeof value !== "number") {
      return NextResponse.json(
        { ok: false, error: "value must be a number or null." },
        { status: 400 }
      );
    }
    if (typeof value === "number" && (value < 0 || value > 999)) {
      return NextResponse.json(
        { ok: false, error: "value out of range (0-999)." },
        { status: 400 }
      );
    }

    // Find the record by slug. filterByFormula matches on the Slug field.
    const encodedFormula = encodeURIComponent(`{${SLUG_FIELD}}='${slug.replace(/'/g, "\\'")}'`);
    const findRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?filterByFormula=${encodedFormula}&maxRecords=1`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        cache: "no-store",
      }
    );
    if (!findRes.ok) {
      const t = await findRes.text();
      return NextResponse.json(
        {
          ok: false,
          error: `Airtable find failed (${findRes.status}): ${t.slice(0, 200)}`,
        },
        { status: 500 }
      );
    }
    const found = (await findRes.json()) as { records: { id: string }[] };
    const recordId = found.records[0]?.id;
    if (!recordId) {
      return NextResponse.json(
        { ok: false, error: `No Portal Users row found for slug '${slug}'.` },
        { status: 404 }
      );
    }

    // Patch the field. Airtable accepts null to clear a number field.
    const fieldId = kind === "day" ? FIELD_DAY : FIELD_WEEK;
    const patchRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}/${recordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: { [fieldId]: value } }),
      }
    );
    if (!patchRes.ok) {
      const t = await patchRes.text();
      return NextResponse.json(
        {
          ok: false,
          error: `Airtable patch failed (${patchRes.status}): ${t.slice(0, 200)}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/pbs] uncaught:", err);
    return NextResponse.json(
      { ok: false, error: `Server error: ${String(err).slice(0, 200)}` },
      { status: 500 }
    );
  }
}
