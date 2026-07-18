// app/api/trainees/route.ts
//
// Public read of the current trainee context (list of trainees + team
// allowlists) sourced from Airtable Portal Users. This is what the client
// side uses via useTraineeContext() — one endpoint, cached at the edge for
// 60 seconds, falls back to bundled defaults if Airtable is unreachable.
//
// No auth on this route — the trainee list is not sensitive (it's already
// visible in the RepPicker dropdown). If we ever needed to protect it,
// we'd add a session check, but for now it's public read-only metadata.

import { NextResponse } from "next/server";
import { getTraineeContext } from "@/lib/airtable-trainees";

// Cache at the edge for 60 seconds. Individual page loads hit the cache;
// Airtable is only queried once per minute per Vercel edge region.
export const revalidate = 60;

export async function GET() {
  const context = await getTraineeContext();
  return NextResponse.json(context, {
    headers: {
      // Belt-and-braces cache header for CDN + browser caches.
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
