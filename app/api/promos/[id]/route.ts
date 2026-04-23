// app/api/promos/[id]/route.ts
//
// PATCH /api/promos/<id>
//        body: { submitted_by?, audience?, month?, notes?, status?, decided_by? }
//        — Any subset of fields may be patched. Passing `status` to
//          "approved" or "rejected" stamps `decided_by` + `decided_at`.
//          Passing `status` back to "to_discuss" clears those stamps.
//
// DELETE /api/promos/<id>
//        — Permanently remove the row. Admin-only cleanup.

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Promos";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

const VALID_MONTHS = new Set([
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]);

const VALID_SUBMITTERS = new Set([
  "Corie",
  "Lucas",
  "Felipe",
  "Dylan",
  "Nick",
  "Elly",
  "Trent",
  "Taylor",
]);

const VALID_STATUSES = new Set(["to_discuss", "approved", "rejected"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      submitted_by,
      audience,
      month,
      notes,
      status,
      decided_by,
    } = body as {
      submitted_by?: string;
      audience?: string;
      month?: string;
      notes?: string;
      status?: string;
      decided_by?: string;
    };

    const fields: Record<string, unknown> = {};

    if (typeof submitted_by === "string") {
      if (!VALID_SUBMITTERS.has(submitted_by)) {
        return NextResponse.json({ error: "Invalid submitted_by" }, { status: 400 });
      }
      fields.submitted_by = submitted_by;
    }

    if (typeof audience === "string") {
      if (audience !== "Inbound" && audience !== "External") {
        return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
      }
      fields.audience = audience;
    }

    if (typeof month === "string") {
      if (!VALID_MONTHS.has(month)) {
        return NextResponse.json({ error: "Invalid month" }, { status: 400 });
      }
      fields.month = month;
    }

    if (typeof notes === "string") {
      const trimmed = notes.trim();
      if (trimmed.length === 0) {
        return NextResponse.json({ error: "Notes cannot be empty" }, { status: 400 });
      }
      if (trimmed.length > 5000) {
        return NextResponse.json(
          { error: "Notes are too long (max 5000 characters)" },
          { status: 400 }
        );
      }
      fields.notes = trimmed;
    }

    if (typeof status === "string") {
      if (!VALID_STATUSES.has(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      fields.status = status;
      if (status === "approved" || status === "rejected") {
        fields.decided_by = (decided_by || "Admin").trim() || "Admin";
        fields.decided_at = new Date().toISOString();
      } else {
        // status === "to_discuss" — clear any prior decision.
        fields.decided_by = "";
        fields.decided_at = null;
      }
    }

    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    fields.updated_at = new Date().toISOString();

    const res = await fetch(`${AIRTABLE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Airtable PATCH error:", errData);
      return NextResponse.json({ error: "Failed to update promo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Promos PATCH error:", err);
    return NextResponse.json({ error: "Failed to update promo" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${AIRTABLE_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Airtable DELETE error:", errData);
      return NextResponse.json({ error: "Failed to delete promo" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Promos DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete promo" }, { status: 500 });
  }
}
