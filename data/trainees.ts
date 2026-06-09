// data/trainees.ts

import { Trainee } from "@/types";

export const trainees: Trainee[] = [
  {
    id: "trainee-test",
    name: "Trainee Test",
    slug: "trainee-test",
    startDate: "2026-02-09",
  },
  {
    id: "dylan-munro",
    name: "Dylan Munro",
    slug: "dylan-munro",
    startDate: "2026-02-11",
  },
  {
    id: "thomas-rennie",
    name: "Thomas Rennie",
    slug: "thomas-rennie",
    startDate: "2026-02-11",
  },
  {
    id: "lucas-tirri",
    name: "Lucas Tirri",
    slug: "lucas-tirri",
    startDate: "2026-02-11",
  },
  {
    id: "felipe-garcia",
    name: "Felipe Garcia",
    slug: "felipe-garcia",
    startDate: "2026-02-11",
  },
  {
    id: "connie-matthews",
    name: "Connie Matthews",
    slug: "connie-matthews",
    startDate: "2026-02-10",
  },
  {
    id: "cindy-rose-rondez-manrique",
    name: "Cindy Rose Rondez Manrique",
    slug: "cindy-rose-rondez-manrique",
    startDate: "2026-02-23",
  },
  {
    id: "krishna-patel",
    name: "Krishna Patel",
    slug: "krishna-patel",
    startDate: "2026-02-23",
  },
  {
    id: "jeremy-valiente",
    name: "Jeremy Valiente",
    slug: "jeremy-valiente",
    startDate: "2026-03-04",
  },
  {
    id: "dasha-axenova",
    name: "Dasha Axenova",
    slug: "dasha-axenova",
    startDate: "2026-03-06",
  },
  {
    id: "rachel-astachnowicz",
    name: "Rachel Astachnowicz",
    slug: "rachel-astachnowicz",
    startDate: "2026-03-18",
  },
  {
    id: "aston-marsh",
    name: "Aston Marsh",
    slug: "aston-marsh",
    startDate: "2026-03-18",
  },
  {
    id: "reegan-james",
    name: "Reegan James",
    slug: "reegan-james",
    startDate: "2026-03-19",
  },
  {
    id: "shani-thomas",
    name: "Shani Thomas",
    slug: "shani-thomas",
    startDate: "2026-03-24",
  },
  {
    id: "riley-kerrison",
    name: "Riley Kerrison",
    slug: "riley-kerrison",
    startDate: "2026-03-27",
  },
  {
    id: "khushi-patel",
    name: "Khushi Patel",
    slug: "khushi-patel",
    startDate: "2026-04-15",
  },
  {
    id: "lauren-kim",
    name: "Lauren Kim",
    slug: "lauren-kim",
    startDate: "2026-04-15",
  },
  {
    id: "kristy-lee-busk",
    name: "Kristy Lee Busk",
    slug: "kristy-lee-busk",
    startDate: "2026-04-16",
  },
  {
    id: "yashika-sood",
    name: "Yashika Sood",
    slug: "yashika-sood",
    startDate: "2026-04-16",
  },
  {
    id: "caia-cuggy",
    name: "Caia Cuggy",
    slug: "caia-cuggy",
    startDate: "2026-04-16",
  },
  {
    id: "jj-chatrawee",
    name: "JJ Chatrawee",
    slug: "jj-chatrawee",
    startDate: "2026-04-16",
  },
  {
    id: "sushant-maharjan",
    name: "Sushant Maharjan",
    slug: "sushant-maharjan",
    startDate: "2026-04-16",
  },
  {
    id: "maddison-bruce",
    name: "Maddison Bruce",
    slug: "maddison-bruce",
    startDate: "2026-04-16",
  },
  {
    id: "kateryna-bakumenko",
    name: "Kateryna Bakumenko",
    slug: "kateryna-bakumenko",
    startDate: "2026-04-16",
  },
  {
    id: "shahmir-saajad",
    name: "Shahmir Saajad",
    slug: "shahmir-saajad",
    startDate: "2026-04-16",
  },
  {
    id: "ella-smith",
    name: "Ella Smith",
    slug: "ella-smith",
    startDate: "2026-04-16",
  },
  {
    id: "trevor-koulenios",
    name: "Trevor Koulenios",
    slug: "trevor-koulenios",
    startDate: "2026-05-13",
  },
  {
    id: "sydney-arnold",
    name: "Sydney Arnold",
    slug: "sydney-arnold",
    startDate: "2026-03-17",
  },
  {
    id: "shian-roux",
    name: "Shian Roux",
    slug: "shian-roux",
    startDate: "2026-05-11",
  },
  {
    id: "dylanna-thach",
    name: "Dylanna Thach",
    slug: "dylanna-thach",
    startDate: "2026-05-11",
  },
  {
    id: "darren-ravikumar",
    name: "Darren Ravikumar",
    slug: "darren-ravikumar",
    startDate: "2026-06-08",
  },
  // ─── Customer Service team (Sessions area, no quizzes) ────────────────────
  // These reps see all session material but the quiz asset is hidden from
  // their view. They're allowlisted to /sessions just like the sales boys.
  {
    id: "trent-spinelli",
    name: "Trent Spinelli",
    slug: "trent-spinelli",
    startDate: "2026-05-21",
  },
  {
    id: "logan-earl",
    name: "Logan Earl",
    slug: "logan-earl",
    startDate: "2026-05-21",
  },
  {
    id: "claire-wheaton",
    name: "Claire Wheaton",
    slug: "claire-wheaton",
    startDate: "2026-05-21",
  },
];

export function getTraineeBySlug(slug: string): Trainee | undefined {
  return trainees.find((t) => t.slug === slug);
}

// ─── Sessions area access lists ──────────────────────────────────────────────
//
// Two teams have access to /sessions: the sales boys (full UX including quiz)
// and the customer service team (same material, quiz hidden). Anyone whose
// slug isn't in one of these lists won't see themselves in the RepPicker
// dropdown and can't enter the area.

export const SALES_TEAM_SLUGS: string[] = [
  "lucas-tirri",
  "dylan-munro",
  "felipe-garcia",
];

export const CUSTOMER_SERVICE_SLUGS: string[] = [
  "trent-spinelli",
  "logan-earl",
  "claire-wheaton",
];

// ─── Lead Gen team ───────────────────────────────────────────────────────────
// Lead Gen reps see a curated 7-session series (sourced from a subset of the
// sales material, renumbered 01–07 from their perspective). They DO take
// quizzes — same UX as the sales boys (resit until 100%, no per-question
// feedback) — but quizzes for this team are multiple-choice only. The full
// 7-session projection is built in data/sessions.ts as `leadGenSessions`.
export const LEAD_GEN_SLUGS: string[] = [
  "cindy-rose-rondez-manrique",
  "shian-roux",
  "riley-kerrison",
  "sydney-arnold",
  "darren-ravikumar",
];

/** Anyone allowed into the Sessions area (sales + customer service + lead gen). */
export const SESSIONS_ALLOWED_SLUGS: string[] = [
  ...SALES_TEAM_SLUGS,
  ...CUSTOMER_SERVICE_SLUGS,
  ...LEAD_GEN_SLUGS,
];

/** True if this rep is on the Customer Service team — hides the quiz. */
export function isCustomerService(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return CUSTOMER_SERVICE_SLUGS.includes(slug);
}

/** True if this rep is on the Lead Gen team — sees only the 7-session series
 *  and gets quizzes filtered to multiple-choice questions only. */
export function isLeadGen(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return LEAD_GEN_SLUGS.includes(slug);
}
