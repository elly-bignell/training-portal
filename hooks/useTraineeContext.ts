// hooks/useTraineeContext.ts
//
// Client-side hook that fetches the current trainee context from
// /api/trainees (which in turn reads from Airtable). Provides the trainee
// list + team allowlists + the isCustomerService / isLeadGen /
// usesLeadGenTrack membership checks that all the sessions pages use.
//
// Behaviour:
//   • On mount, hydrates synchronously from the localStorage cache (so the
//     UI renders instantly on subsequent loads without a network round-trip).
//   • Fires a background fetch to /api/trainees to refresh. The endpoint is
//     edge-cached for 60 seconds, so this is cheap.
//   • Writes the fresh response back to localStorage.
//   • If both the cache and the network fetch fail, uses the FALLBACK_*
//     arrays bundled into the app so the portal keeps working offline.
//
// New Airtable rows appear here within: (60s edge cache) + (browser cache) —
// so realistically 1-2 minutes after a colleague adds someone in Airtable,
// they'll be in the RepPicker. Force-refresh (Cmd/Ctrl+Shift+R) if you need
// it immediately.

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FALLBACK_TRAINEES,
  FALLBACK_SALES_TEAM_SLUGS,
  FALLBACK_LEAD_GEN_SLUGS,
  FALLBACK_CUSTOMER_SERVICE_SLUGS,
} from "@/data/trainees";
import { Trainee } from "@/types";

export interface TraineeContext {
  trainees: Trainee[];
  salesTeamSlugs: string[];
  leadGenSlugs: string[];
  customerServiceSlugs: string[];
  sessionsAllowedSlugs: string[];
  source: "airtable" | "fallback" | "cache";
  fetchedAt: string;
}

const CACHE_KEY = "trainee-context-v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function fallbackContext(): TraineeContext {
  return {
    trainees: FALLBACK_TRAINEES,
    salesTeamSlugs: FALLBACK_SALES_TEAM_SLUGS,
    leadGenSlugs: FALLBACK_LEAD_GEN_SLUGS,
    customerServiceSlugs: FALLBACK_CUSTOMER_SERVICE_SLUGS,
    sessionsAllowedSlugs: [
      ...FALLBACK_SALES_TEAM_SLUGS,
      ...FALLBACK_LEAD_GEN_SLUGS,
      ...FALLBACK_CUSTOMER_SERVICE_SLUGS,
    ],
    source: "fallback",
    fetchedAt: new Date().toISOString(),
  };
}

function readCache(): TraineeContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      value: TraineeContext;
      ts: number;
    };
    if (!parsed.value || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return { ...parsed.value, source: "cache" };
  } catch {
    return null;
  }
}

function writeCache(value: TraineeContext) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ value, ts: Date.now() })
    );
  } catch {
    // Storage might be full or disabled — silently ignore, we still have
    // the in-memory state.
  }
}

/** Returns the current trainee context, plus membership check functions
 *  keyed to the current (live) team allowlists. */
export function useTraineeContext() {
  // Seed synchronously with cache or fallback so the first render has
  // something to work with — avoids a "empty dropdown" flash.
  const [context, setContext] = useState<TraineeContext>(
    () => readCache() ?? fallbackContext()
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/trainees", { cache: "no-store" });
        if (!res.ok) return;
        const fresh = (await res.json()) as TraineeContext;
        if (cancelled) return;
        setContext(fresh);
        writeCache(fresh);
      } catch {
        // Network failure — keep the seeded context. The next successful
        // page load will refresh from the API.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isCustomerService = useCallback(
    (slug: string | null | undefined) =>
      !!slug && context.customerServiceSlugs.includes(slug),
    [context.customerServiceSlugs]
  );

  const isLeadGen = useCallback(
    (slug: string | null | undefined) =>
      !!slug && context.leadGenSlugs.includes(slug),
    [context.leadGenSlugs]
  );

  const usesLeadGenTrack = useCallback(
    (slug: string | null | undefined) =>
      !!slug &&
      (context.leadGenSlugs.includes(slug) ||
        context.customerServiceSlugs.includes(slug)),
    [context.leadGenSlugs, context.customerServiceSlugs]
  );

  return {
    ...context,
    isCustomerService,
    isLeadGen,
    usesLeadGenTrack,
  };
}
