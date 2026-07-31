// hooks/useSessionsData.ts
//
// Client-side hook that fetches the current merged session catalog
// (bundled + Airtable) from /api/sessions. Mirrors useTraineeContext:
//   • Hydrates synchronously from bundled data for instant first render
//   • Fires a background fetch to /api/sessions on mount
//   • Replaces state with the merged catalog once it returns
//   • Falls back silently to bundled-only on network failure
//
// Consumers get the same shape (three Session[] arrays) as if they'd
// imported directly from data/sessions.ts, so drop-in replacement is
// straightforward.

"use client";

import { useEffect, useState } from "react";
import {
  sessions as bundledSessions,
  leadGenSessions as bundledLg,
  customerServiceSessions as bundledCs,
} from "@/data/sessions";
import type { Session } from "@/types/sessions";

export interface SessionsCatalog {
  sessions: Session[];
  leadGenSessions: Session[];
  customerServiceSessions: Session[];
  /** "loading" until the first fetch completes; then "airtable" | "fallback". */
  source: "loading" | "airtable" | "fallback";
  /** ISO timestamp of when the current catalog was fetched. */
  fetchedAt: string;
}

function initialCatalog(): SessionsCatalog {
  return {
    sessions: bundledSessions,
    leadGenSessions: bundledLg,
    customerServiceSessions: bundledCs,
    source: "loading",
    fetchedAt: new Date().toISOString(),
  };
}

/** Returns the current merged sessions catalog. Renders synchronously
 *  from bundled data on first mount; swaps to the merged catalog once
 *  the API responds. */
export function useSessionsData(): SessionsCatalog {
  const [catalog, setCatalog] = useState<SessionsCatalog>(() => initialCatalog());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/sessions", { cache: "no-store" });
        if (!res.ok) return;
        const fresh = (await res.json()) as SessionsCatalog;
        if (cancelled) return;
        setCatalog(fresh);
      } catch {
        // Silent — the bundled arrays stay in place.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return catalog;
}
