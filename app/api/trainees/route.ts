// app/api/trainees/route.ts
//
// Public read of the current trainee context (list of trainees + team
// allowlists + PB bookings) sourced from Airtable Portal Users. Client
// consumes via useTraineeContext().
//
// Dynamic (no cache): edge-cached responses caused stale reads after
// inline edits (e.g. PB Day/Week inputs) — different regions could hold
// different snapshots, so a refresh appeared to "lose" the number the
// user just typed. Fetching Airtable fresh on every request costs
// ~200ms per page load but keeps writes visible immediately.
//
// No auth on this route — the trainee list is not sensitive (it's
// already visible in the RepPicker dropdown).

import { NextResponse } from "next/server";
import { getTraineeContext } from "@/lib/airtable-trainees";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const context = await getTraineeContext();
  return NextResponse.json(context, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
