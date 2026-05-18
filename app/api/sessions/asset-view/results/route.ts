// app/api/sessions/asset-view/results/route.ts
//
// Fetches asset-view events from the "Asset Views" Airtable table for a
// given rep. Used by useSessionsProgress on mount to merge server-truth
// asset progress into the local view so the same rep sees their full
// history regardless of which browser they open the portal in.

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
// Single combined table — see /api/sessions/asset-view/submit for context.
const AIRTABLE_TABLE_NAME = "Quiz Submissions";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  AIRTABLE_TABLE_NAME
)}`;

export interface AssetViewRecord {
  id: string;
  repSlug: string;
  sessionId: string;
  assetKind: string;
  viewedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repSlug = searchParams.get("rep_slug");

  try {
    // Filter to only asset_view rows (skip quiz_attempt rows in same table).
    const filters: string[] = [`{event_type} = "asset_view"`];
    if (repSlug) filters.push(`{rep_slug} = "${repSlug}"`);
    const filterFormula = `filterByFormula=${encodeURIComponent(
      filters.length === 1 ? filters[0] : `AND(${filters.join(", ")})`
    )}`;
    const sortParams =
      "sort%5B0%5D%5Bfield%5D=submitted_at&sort%5B0%5D%5Bdirection%5D=asc";
    const qs = [filterFormula, sortParams].join("&");

    const response = await fetch(`${AIRTABLE_URL}?${qs}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // 404 is expected if the table hasn't been created yet — fail-silent.
      if (response.status === 404) {
        return NextResponse.json({ views: [] });
      }
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();
    const views: AssetViewRecord[] = (data.records || [])
      .filter(
        (r: any) =>
          r.fields?.rep_slug && r.fields?.session_id && r.fields?.asset_kind
      )
      .map((r: any) => ({
        id: r.id,
        repSlug: r.fields.rep_slug,
        sessionId: r.fields.session_id,
        assetKind: r.fields.asset_kind,
        viewedAt: r.fields.submitted_at ?? "",
      }));

    return NextResponse.json({ views });
  } catch (error) {
    console.error("[asset-view/results] fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset views", views: [] },
      { status: 500 }
    );
  }
}
