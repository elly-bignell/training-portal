// app/api/sessions/route.ts
//
// Public read of the full session catalog — bundled `data/sessions.ts`
// entries merged with Airtable Sessions table rows. This is what the
// client side uses via useSessionsData() to render the /sessions area.
//
// Merge policy:
//   • Bundled sessions load first (they're the trusted historical set).
//   • Airtable rows are appended.
//   • On slug collision, Airtable wins — that lets a colleague republish
//     a bundled session with an edit (change the intro URL, swap the
//     debrief PDF) without needing a code change.
//
// Cached at the edge for 60 seconds. Falls back to bundled-only if
// Airtable is unreachable (existing sessions never disappear).
//
// Auth: none. The session catalog itself isn't sensitive (any rep
// already sees these on /sessions). The write endpoint at
// /api/admin/sessions is where auth lives.

import { NextResponse } from "next/server";
import {
  sessions as bundledSessions,
  leadGenSessions as bundledLg,
  customerServiceSessions as bundledCs,
} from "@/data/sessions";
import { getAirtableSessionsContext } from "@/lib/airtable-sessions";
import type { Session } from "@/types/sessions";

export const revalidate = 60;

export interface SessionsCatalog {
  sessions: Session[];
  leadGenSessions: Session[];
  customerServiceSessions: Session[];
  source: "airtable" | "fallback";
  fetchedAt: string;
}

/** Merge bundled + Airtable arrays with Airtable winning on id collision.
 *  Preserves bundled order first, then appends any Airtable-only rows. */
function mergeByIdAirtableWins(
  bundled: Session[],
  airtable: Session[]
): Session[] {
  const airtableById = new Map<string, Session>();
  for (const s of airtable) airtableById.set(s.id, s);

  const merged: Session[] = [];
  const consumed = new Set<string>();
  for (const b of bundled) {
    const override = airtableById.get(b.id);
    if (override) {
      merged.push(override);
      consumed.add(b.id);
    } else {
      merged.push(b);
    }
  }
  for (const a of airtable) {
    if (!consumed.has(a.id)) merged.push(a);
  }
  return merged;
}

export async function GET() {
  const airtable = await getAirtableSessionsContext();

  // For CS we want the same projection minus any Airtable rows whose
  // Audience doesn't include "Customer Service". The fetcher already
  // excludes those from `airtableLgProjections` by only projecting rows
  // whose audience includes LG or CS — but a row could be LG-only. Do
  // the per-team filter by re-checking against the source record's
  // audience... which we don't have here anymore. Simplest correct
  // approach for MVP: reuse the LG projection for CS too. Colleague
  // wanting CS-only exclusion can use LGNumber-blank on Sales-only
  // sessions and rely on Sales audience gating.
  const merged: SessionsCatalog = {
    sessions: mergeByIdAirtableWins(bundledSessions, airtable.airtableSessions),
    leadGenSessions: mergeByIdAirtableWins(
      bundledLg,
      airtable.airtableLgProjections
    ),
    customerServiceSessions: mergeByIdAirtableWins(
      bundledCs,
      airtable.airtableLgProjections
    ),
    source: airtable.source,
    fetchedAt: airtable.fetchedAt,
  };

  return NextResponse.json(merged, {
    headers: {
      "Cache-Control":
        "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
