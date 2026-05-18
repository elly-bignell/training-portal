// app/api/sessions/asset-view/submit/route.ts
//
// Records an "asset viewed" event in the "Asset Views" Airtable table so
// trainers (Corie/Elly) can verify reps have actually consumed each asset
// before sitting the quiz — not just relying on per-browser localStorage.
//
// Fire-and-forget from the client. The localStorage write on the rep's
// device remains the authoritative source for what the rep sees in their
// own UI; this is a mirror for trainer visibility.

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Asset Views";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  AIRTABLE_TABLE_NAME
)}`;

interface SubmitBody {
  repSlug?: string;
  repName?: string;
  sessionId?: string;
  sessionNumber?: string;
  sessionTitle?: string;
  assetKind?: string;
  viewedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitBody;
    const {
      repSlug,
      repName,
      sessionId,
      sessionNumber,
      sessionTitle,
      assetKind,
      viewedAt,
    } = body;

    if (!repSlug || !sessionId || !assetKind) {
      return NextResponse.json(
        { error: "Missing required fields (repSlug, sessionId, assetKind)." },
        { status: 400 }
      );
    }

    const response = await fetch(AIRTABLE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              rep_slug: repSlug,
              rep_name: repName ?? "",
              session_id: sessionId,
              session_number: sessionNumber ?? "",
              session_title: sessionTitle ?? "",
              asset_kind: assetKind,
              viewed_at: viewedAt ?? new Date().toISOString(),
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[asset-view/submit] airtable error", response.status, errText);
      return NextResponse.json(
        { error: `Airtable error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      recordId: data.records?.[0]?.id ?? null,
    });
  } catch (err) {
    console.error("[asset-view/submit] failed:", err);
    return NextResponse.json(
      { error: "Failed to record asset view." },
      { status: 500 }
    );
  }
}
