// hooks/useTraineeContext.ts
//
// Client-side hook that fetches the current trainee context from
// /api/trainees (which in turn reads from Airtable). Two scopes:
//   • Active trainees + team allowlists — used by /sessions RepPicker
//   • All trainees + archived/applicant/csOnboarding + buddy — used by
//     the admin dashboard and the onboarding trainee page
//
// Behaviour:
//   • On mount, hydrates synchronously from the localStorage cache (so
//     UI renders instantly on subsequent loads).
//   • Fires a background fetch to /api/trainees to refresh. The endpoint
//     is edge-cached for 60 seconds.
//   • Writes the fresh response back to localStorage.
//   • If both the cache and the network fetch fail, uses the FALLBACK_*
//     arrays bundled into the app.

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FALLBACK_TRAINEES,
  FALLBACK_SALES_TEAM_SLUGS,
  FALLBACK_LEAD_GEN_SLUGS,
  FALLBACK_CUSTOMER_SERVICE_SLUGS,
  FALLBACK_ARCHIVED_SLUGS,
  FALLBACK_APPLICANT_SLUGS,
  FALLBACK_CS_ONBOARDING_SLUGS,
} from "@/data/trainees";
import { Trainee } from "@/types";

/** Trainee with Stage 2 metadata. Extends the base Trainee shape with
 *  team assignment + admin dashboard flags. */
export interface EnrichedTrainee extends Trainee {
  team: "Sales" | "Lead Gen" | "Customer Service" | "Admin" | "Unassigned";
  active: boolean;
  archived: boolean;
  applicant: boolean;
  csOnboarding: boolean;
  buddy?: string;
  pbBookingsDay?: number;
  pbBookingsWeek?: number;
}

export interface TraineeContext {
  trainees: Trainee[];
  salesTeamSlugs: string[];
  leadGenSlugs: string[];
  customerServiceSlugs: string[];
  sessionsAllowedSlugs: string[];
  allTrainees: EnrichedTrainee[];
  archivedSlugs: string[];
  applicantSlugs: string[];
  csOnboardingSlugs: string[];
  buddyBySlug: Record<string, string>;
  seniorSlugByJuniorSlug: Record<string, string>;
  juniorSlugsBySeniorSlug: Record<string, string[]>;
  source: "airtable" | "fallback" | "cache";
  fetchedAt: string;
}

const CACHE_KEY = "trainee-context-v2";
const CACHE_TTL_MS = 10 * 60 * 1000;

function fallbackContext(): TraineeContext {
  const inferTeam = (slug: string): EnrichedTrainee["team"] => {
    if (FALLBACK_SALES_TEAM_SLUGS.includes(slug)) return "Sales";
    if (FALLBACK_LEAD_GEN_SLUGS.includes(slug)) return "Lead Gen";
    if (FALLBACK_CUSTOMER_SERVICE_SLUGS.includes(slug)) return "Customer Service";
    return "Unassigned";
  };
  const allTrainees: EnrichedTrainee[] = FALLBACK_TRAINEES.map((t) => ({
    ...t,
    team: inferTeam(t.slug),
    active: !FALLBACK_ARCHIVED_SLUGS.includes(t.slug),
    archived: FALLBACK_ARCHIVED_SLUGS.includes(t.slug),
    applicant: FALLBACK_APPLICANT_SLUGS.includes(t.slug),
    csOnboarding: FALLBACK_CS_ONBOARDING_SLUGS.includes(t.slug),
  }));
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
    allTrainees,
    archivedSlugs: FALLBACK_ARCHIVED_SLUGS,
    applicantSlugs: FALLBACK_APPLICANT_SLUGS,
    csOnboardingSlugs: FALLBACK_CS_ONBOARDING_SLUGS,
    buddyBySlug: {},
    seniorSlugByJuniorSlug: {},
    juniorSlugsBySeniorSlug: {},
    source: "fallback",
    fetchedAt: new Date().toISOString(),
  };
}

function readCache(): TraineeContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: TraineeContext; ts: number };
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
    localStorage.setItem(CACHE_KEY, JSON.stringify({ value, ts: Date.now() }));
  } catch {
    // Silently ignore — we still have in-memory state.
  }
}

/** Returns the current trainee context + membership check functions
 *  keyed to the current (live) team allowlists. */
export function useTraineeContext() {
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
        // Keep the seeded context; next mount will refresh.
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

  const isArchived = useCallback(
    (slug: string | null | undefined) =>
      !!slug && context.archivedSlugs.includes(slug),
    [context.archivedSlugs]
  );

  const isApplicant = useCallback(
    (slug: string | null | undefined) =>
      !!slug && context.applicantSlugs.includes(slug),
    [context.applicantSlugs]
  );

  const isCSOnboarding = useCallback(
    (slug: string | null | undefined) =>
      !!slug && context.csOnboardingSlugs.includes(slug),
    [context.csOnboardingSlugs]
  );

  // ─── Buddy relationship helpers ──────────────────────────────────────
  // Mirror the API of the deprecated data/buddyPairs.ts module so
  // consumers can drop these in. All lookups derive from Airtable via
  // the seniorSlugByJuniorSlug / juniorSlugsBySeniorSlug maps.

  const isSenior = useCallback(
    (slug: string | null | undefined): boolean => {
      if (!slug) return false;
      const juniors = context.juniorSlugsBySeniorSlug[slug];
      return !!juniors && juniors.length > 0;
    },
    [context.juniorSlugsBySeniorSlug]
  );

  const isJunior = useCallback(
    (slug: string | null | undefined): boolean =>
      !!slug && !!context.seniorSlugByJuniorSlug[slug],
    [context.seniorSlugByJuniorSlug]
  );

  const getBuddySlug = useCallback(
    (slug: string | null | undefined): string | null => {
      if (!slug) return null;
      // Junior → their senior
      const senior = context.seniorSlugByJuniorSlug[slug];
      if (senior) return senior;
      // Senior → first junior (prefer active, alphabetical by slug; fall
      // back to any if all are archived)
      const juniors = context.juniorSlugsBySeniorSlug[slug];
      if (!juniors || juniors.length === 0) return null;
      const activeJuniors = juniors.filter(
        (j) => !context.archivedSlugs.includes(j)
      );
      const pool = activeJuniors.length > 0 ? activeJuniors : juniors;
      return [...pool].sort()[0];
    },
    [
      context.seniorSlugByJuniorSlug,
      context.juniorSlugsBySeniorSlug,
      context.archivedSlugs,
    ]
  );

  const getBuddyName = useCallback(
    (slug: string | null | undefined): string => {
      const buddySlug = getBuddySlug(slug);
      if (!buddySlug) return "Buddy";
      const t = context.allTrainees.find((tr) => tr.slug === buddySlug);
      if (!t) return "Buddy";
      return t.name.split(" ")[0];
    },
    [getBuddySlug, context.allTrainees]
  );

  return {
    ...context,
    isCustomerService,
    isLeadGen,
    usesLeadGenTrack,
    isArchived,
    isApplicant,
    isCSOnboarding,
    isSenior,
    isJunior,
    getBuddySlug,
    getBuddyName,
  };
}
