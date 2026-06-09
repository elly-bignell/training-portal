// data/leadGen.ts
//
// Single source of truth for who counts as an "active lead-gen trainee".
//
// A lead-gen trainee:
//   - carries the individual booking target (7/day, 35/EOW) on the Calls &
//     Bookings widget in PerformanceSummary.tsx
//   - has a Daily Checklist link on their scorecard, a tab on /checklist,
//     and access to the checklist API (derived in data/checklistTemplate.ts)
//
// Buddies (Lucas, Felipe, Dylan) are NOT included — they pick up the slack
// but don't carry an individual target or fill out the daily checklist.
//
// To add a new lead-gen trainee:
//   1. Add them to data/trainees.ts (so they get a scorecard)
//   2. Add their slug to LEAD_GEN_SLUGS below
//   3. Add them to the right team in components/PerformanceSummary.tsx
//      (`teams` array) so they show up in the Calls & Bookings widget
//
// To take a lead-gen trainee off the active team: remove their slug here.
// (They keep their scorecard; the checklist link just disappears.)

export const LEAD_GEN_SLUGS = [
  "cindy-rose-rondez-manrique",
  "sydney-arnold",
  "riley-kerrison",
  "shian-roux",
  "darren-ravikumar",
] as const;

export type LeadGenSlug = (typeof LEAD_GEN_SLUGS)[number];

export const LEAD_GEN_SLUG_SET: ReadonlySet<string> = new Set(LEAD_GEN_SLUGS);

export function isLeadGen(slug: string): boolean {
  return LEAD_GEN_SLUG_SET.has(slug);
}
