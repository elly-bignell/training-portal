// app/api/promos/route.ts
//
// Promo ideas — shared team list of promotional ideas. Anyone with admin
// access can submit; the team then decides in the morning whether to
// approve, tweak, or reject each idea.
//
// GET  /api/promos?status=to_discuss|approved|rejected
//        → omit `status` to return everything (newest first)
// POST /api/promos
//        body: { submitted_by, audience, month, notes }

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Promos";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

export type PromoStatus = "to_discuss" | "approved" | "rejected";
export type PromoAudience = "Inbound" | "External";

export interface PromoRecord {
  id: string;
  submitted_by: string;
  audience: PromoAudience;
  month: string; // "", "January", …, "December"
  notes: string;
  status: PromoStatus;
  submitted_at: string;
  updated_at?: string;
  decided_by?: string;
  decided_at?: string;
}

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

function recordToPromo(r: { id: string; fields: Record<string, unknown> }): PromoRecord {
  const f = r.fields;
  const status = (f.status as string) || "to_discuss";
  const audience = (f.audience as string) === "External" ? "External" : "Inbound";
  return {
    id: r.id,
    submitted_by: (f.submitted_by as string) || "",
    audience,
    month: (f.month as string) || "",
    notes: (f.notes as string) || "",
    status:
      status === "approved" || status === "rejected" ? (status as PromoStatus) : "to_discuss",
    submitted_at: (f.submitted_at as string) || "",
    updated_at: (f.updated_at as string) || undefined,
    decided_by: (f.decided_by as string) || undefined,
    decided_at: (f.decided_at as string) || undefined,
  };
}

// ---------------------------------------------------------------------------
// GET — list promos (newest first)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const all: PromoRecord[] = [];
    let offset: string | undefined = undefined;
    const filterParam = status
      ? `&filterByFormula=${encodeURIComponent(`{status} = "${status}"`)}`
      : "";

    do {
      const url: string =
        `${AIRTABLE_URL}?sort%5B0%5D%5Bfield%5D=submitted_at&sort%5B0%5D%5Bdirection%5D=desc&pageSize=100${filterParam}` +
        (offset ? `&offset=${encodeURIComponent(offset)}` : "");
      const res: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
      const data: {
        records?: Array<{ id: string; fields: Record<string, unknown> }>;
        offset?: string;
      } = await res.json();
      for (const r of data.records || []) {
        all.push(recordToPromo(r));
      }
      offset = data.offset;
    } while (offset);

    return NextResponse.json({ promos: all });
  } catch (err) {
    console.error("Promos GET error:", err);
    return NextResponse.json({ error: "Failed to fetch promos" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new promo idea
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submitted_by, audience, month, notes } = body as {
      submitted_by?: string;
      audience?: string;
      month?: string;
      notes?: string;
    };

    const trimmedNotes = (notes || "").trim();
    const normalisedMonth = (month || "").trim();
    const normalisedAudience = audience === "External" ? "External" : "Inbound";

    if (!submitted_by || !VALID_SUBMITTERS.has(submitted_by)) {
      return NextResponse.json(
        { error: "submitted_by must be one of the named team members" },
        { status: 400 }
      );
    }
    if (trimmedNotes.length === 0) {
      return NextResponse.json({ error: "notes are required" }, { status: 400 });
    }
    if (trimmedNotes.length > 5000) {
      return NextResponse.json(
        { error: "Notes are too long (max 5000 characters)" },
        { status: 400 }
      );
    }
    if (!VALID_MONTHS.has(normalisedMonth)) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const fields = {
      submitted_by,
      audience: normalisedAudience,
      month: normalisedMonth,
      notes: trimmedNotes,
      status: "to_discuss",
      submitted_at: now,
      updated_at: now,
    };

    const res = await fetch(AIRTABLE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Airtable create error:", errData);
      return NextResponse.json({ error: "Failed to save promo" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, promo: recordToPromo(data) });
  } catch (err) {
    console.error("Promos POST error:", err);
    return NextResponse.json({ error: "Failed to save promo" }, { status: 500 });
  }
}
