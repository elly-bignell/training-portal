// data/buddyPairs.ts
//
// DEPRECATED — Airtable is now the source of truth for buddy relationships
// via useTraineeContext(). The Portal Users table's `Buddy` single-select
// (Lucas Tirri / Dylan Munro / Felipe Garcia) drives:
//   • isSenior(), isJunior(), getBuddySlug(), getBuddyName() from
//     hooks/useTraineeContext.ts
//   • buddyBySlug, seniorSlugByJuniorSlug, juniorSlugsBySeniorSlug maps
//     from lib/airtable-trainees.ts
//
// This file is retained only as a reference for the pre-migration mapping;
// no application code imports from it any more. Delete once we're
// confident the Airtable-driven path is stable.

// Senior (sales) → primary Junior (lead gen) buddy pairs
export const buddyPairs: Record<string, string> = {
  "lucas-tirri": "cindy-rose-rondez-manrique",
  "felipe-garcia": "sydney-arnold",
  "dylan-munro": "krishna-patel",
};

// Reverse lookup: Junior → Senior
// Riley is also paired with Lucas (two juniors, one senior)
export const reverseBuddyPairs: Record<string, string> = {
  ...Object.fromEntries(Object.entries(buddyPairs).map(([senior, junior]) => [junior, senior])),
  "riley-kerrison": "lucas-tirri",
  "jade-bautista": "dylan-munro",
};

// Friendly names for display
export const buddyNames: Record<string, string> = {
  "lucas-tirri": "Lucas",
  "felipe-garcia": "Felipe",
  "dylan-munro": "Dylan",
  "cindy-rose-rondez-manrique": "Cindy",
  "sydney-arnold": "Sydney",
  "krishna-patel": "Krishna",
  "riley-kerrison": "Riley",
  "jade-bautista": "Jade",
};

export function isSenior(slug: string): boolean {
  return slug in buddyPairs;
}

export function isJunior(slug: string): boolean {
  return slug in reverseBuddyPairs;
}

export function getBuddySlug(slug: string): string | undefined {
  return buddyPairs[slug] || reverseBuddyPairs[slug];
}

export function getBuddyName(slug: string): string {
  const buddySlug = getBuddySlug(slug);
  return buddySlug ? buddyNames[buddySlug] || buddySlug : "Buddy";
}
