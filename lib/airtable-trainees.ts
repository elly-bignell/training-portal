// lib/airtable-trainees.ts
//
// Server-only module. Fetches the Portal Users table from Airtable and
// derives the trainee list + team allowlists + admin dashboard metadata.
//
// Two-tier data model (introduced Stage 2, 18 Jul 2026):
//   • `trainees` + team slug arrays — ACTIVE only, used by /sessions
//   • `allTrainees` + archived/applicant/csOnboarding slugs — full set
//     including inactive/archived rows, used by the admin dashboard
//
// Why: /sessions doesn't want inactive people cluttering the login picker
// (they can't log in anyway), but the admin dashboard wants to show
// historical people grouped under a separate "Archived" section.
//
// Airtable schema this depends on (Portal Users table):
//   Stage 1 fields:
//     • Name         (singleLineText)
//     • Slug         (singleLineText)
//     • Team         (singleSelect: Sales / Lead Gen / Customer Service / Admin)
//     • StartDate    (date)
//     • Active       (checkbox)
//   Stage 2 fields:
//     • Buddy        (singleSelect: Lucas Tirri / Dylan Munro / Felipe Garcia)
//     • Applicant    (checkbox)
//     • Archived     (checkbox)
//     • CSOnboarding (checkbox)
//
// Caching: Next.js fetch with `revalidate: 60`. Falls back to bundled
// FALLBACK_* arrays in data/trainees.ts if Airtable is unreachable.

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

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY = process.env.AIRTABLE_API_KEY!;
const TABLE = "Portal Users";
const CACHE_SECONDS = 60;

/** Trainee with Stage 2 metadata. `EnrichedTrainee` extends the base
 *  Trainee shape (id/name/slug/startDate) with the Airtable-driven flags
 *  needed by the admin dashboard. */
export interface EnrichedTrainee extends Trainee {
  team: "Sales" | "Lead Gen" | "Customer Service" | "Admin" | "Unassigned";
  active: boolean;
  archived: boolean;
  applicant: boolean;
  csOnboarding: boolean;
  buddy?: string;
  /** Personal best bookings in a single day. Editable inline on the
   *  Calls & Bookings section of the home page. Undefined = not set. */
  pbBookingsDay?: number;
  /** Personal best bookings in a single week. */
  pbBookingsWeek?: number;
}

export interface TraineeContext {
  // ─── /sessions scope (active only) ────────────────────────────────────
  /** Active trainees only. Used by /sessions RepPicker. */
  trainees: Trainee[];
  /** Active-only team allowlists (mirrors Stage 1 semantics). */
  salesTeamSlugs: string[];
  leadGenSlugs: string[];
  customerServiceSlugs: string[];
  sessionsAllowedSlugs: string[];

  // ─── Admin dashboard scope (everyone, including archived) ────────────
  /** Every trainee row in Airtable regardless of Active/Archived state.
   *  Includes full metadata for admin-side rendering. */
  allTrainees: EnrichedTrainee[];
  archivedSlugs: string[];
  applicantSlugs: string[];
  csOnboardingSlugs: string[];
  /** Map junior slug → their senior closer's NAME (as it appears in the
   *  Airtable Buddy single-select — e.g. "Lucas Tirri"). Kept for display
   *  purposes; use `seniorSlugByJuniorSlug` when you need to resolve to a
   *  slug for further lookups. */
  buddyBySlug: Record<string, string>;
  /** Map junior slug → their senior closer's SLUG (e.g. "lucas-tirri").
   *  Derived by matching the Buddy name against the closer's Name field. */
  seniorSlugByJuniorSlug: Record<string, string>;
  /** Map senior closer slug → array of junior slugs assigned to them.
   *  Used to build the "Calls & Bookings" team groupings on the admin
   *  home page, plus the two admin performance pages. Includes archived
   *  juniors — filter in the consumer if you only want active. */
  juniorSlugsBySeniorSlug: Record<string, string[]>;

  // ─── Meta ────────────────────────────────────────────────────────────
  source: "airtable" | "fallback";
  fetchedAt: string;
}

interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    Slug?: string;
    Team?: string;
    StartDate?: string;
    Active?: boolean;
    Buddy?: string;
    Applicant?: boolean;
    Archived?: boolean;
    CSOnboarding?: boolean;
    PBBookingsDay?: number;
    PBBookingsWeek?: number;
  };
}

function buildFallback(): TraineeContext {
  // Enrich the bundled trainee list using the fallback flag arrays. Team
  // is inferred from the slug's presence in the fallback team lists —
  // rough but good enough for the emergency path.
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

/** Fetches the current trainee context from Airtable. Server-only. */
export async function getTraineeContext(): Promise<TraineeContext> {
  if (!BASE_ID || !API_KEY) {
    console.warn(
      "[airtable-trainees] AIRTABLE_BASE_ID or AIRTABLE_API_KEY missing — using fallback"
    );
    return buildFallback();
  }

  try {
    // Fetch ALL records — the admin dashboard needs archived people too.
    // Filter out only the truly irrelevant ones (Admin role + no team)
    // in the loop below.
    const params = new URLSearchParams();
    params.set("fields[]", "Name");
    params.append("fields[]", "Slug");
    params.append("fields[]", "Team");
    params.append("fields[]", "StartDate");
    params.append("fields[]", "Active");
    params.append("fields[]", "Buddy");
    params.append("fields[]", "Applicant");
    params.append("fields[]", "Archived");
    params.append("fields[]", "CSOnboarding");
    params.append("fields[]", "PBBookingsDay");
    params.append("fields[]", "PBBookingsWeek");
    params.set("pageSize", "100");

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?${params}`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        next: { revalidate: CACHE_SECONDS },
      }
    );

    if (!res.ok) {
      console.error(
        `[airtable-trainees] Airtable returned ${res.status} ${res.statusText} — using fallback`
      );
      return buildFallback();
    }

    const json = (await res.json()) as { records: AirtableRecord[] };
    const records = json.records ?? [];

    const allTrainees: EnrichedTrainee[] = [];
    const salesTeamSlugs: string[] = [];
    const leadGenSlugs: string[] = [];
    const customerServiceSlugs: string[] = [];
    const archivedSlugs: string[] = [];
    const applicantSlugs: string[] = [];
    const csOnboardingSlugs: string[] = [];
    const buddyBySlug: Record<string, string> = {};

    for (const rec of records) {
      const {
        Name,
        Slug,
        Team,
        StartDate,
        Active,
        Buddy,
        Applicant,
        Archived,
        CSOnboarding,
        PBBookingsDay,
        PBBookingsWeek,
      } = rec.fields;

      // Slug + Name are required for the record to be usable. Admins are
      // filtered out entirely (they don't appear in trainee lists).
      if (!Slug || !Name) continue;
      if (Team === "Admin") continue;

      const team: EnrichedTrainee["team"] =
        Team === "Sales" || Team === "Lead Gen" || Team === "Customer Service"
          ? Team
          : "Unassigned";

      const active = Active === true;
      const archived = Archived === true;
      const applicant = Applicant === true;
      const csOnboarding = CSOnboarding === true;

      const enriched: EnrichedTrainee = {
        id: Slug,
        name: Name,
        slug: Slug,
        startDate: StartDate ?? "2099-12-31",
        team,
        active,
        archived,
        applicant,
        csOnboarding,
        pbBookingsDay:
          typeof PBBookingsDay === "number" ? PBBookingsDay : undefined,
        pbBookingsWeek:
          typeof PBBookingsWeek === "number" ? PBBookingsWeek : undefined,
        buddy: Buddy,
      };
      allTrainees.push(enriched);

      if (archived) archivedSlugs.push(Slug);
      if (applicant) applicantSlugs.push(Slug);
      if (csOnboarding) csOnboardingSlugs.push(Slug);
      if (Buddy) buddyBySlug[Slug] = Buddy;

      // /sessions team allowlists — active only
      if (active) {
        if (team === "Sales") salesTeamSlugs.push(Slug);
        else if (team === "Lead Gen") leadGenSlugs.push(Slug);
        else if (team === "Customer Service") customerServiceSlugs.push(Slug);
      }
    }

    // Fresh Trainee list for /sessions (active only, base shape).
    const trainees: Trainee[] = allTrainees
      .filter((t) => t.active)
      .map(({ team, active, archived, applicant, csOnboarding, buddy, ...base }) => base);

    if (allTrainees.length === 0) {
      console.warn(
        "[airtable-trainees] Airtable returned 0 valid trainees — using fallback"
      );
      return buildFallback();
    }

    // ─── Derive the closer↔junior maps ──────────────────────────────────
    // Buddy in Airtable is stored as a name string (e.g. "Lucas Tirri") on
    // the single-select. Convert that into slug-based lookups by matching
    // against the Sales team's Name fields.
    const closerNameToSlug: Record<string, string> = {};
    for (const t of allTrainees) {
      if (t.team === "Sales") closerNameToSlug[t.name] = t.slug;
    }
    const seniorSlugByJuniorSlug: Record<string, string> = {};
    const juniorSlugsBySeniorSlug: Record<string, string[]> = {};
    for (const t of allTrainees) {
      if (!t.buddy) continue;
      const seniorSlug = closerNameToSlug[t.buddy];
      if (!seniorSlug) continue; // buddy name doesn't resolve — skip
      seniorSlugByJuniorSlug[t.slug] = seniorSlug;
      if (!juniorSlugsBySeniorSlug[seniorSlug]) {
        juniorSlugsBySeniorSlug[seniorSlug] = [];
      }
      juniorSlugsBySeniorSlug[seniorSlug].push(t.slug);
    }

    return {
      trainees,
      salesTeamSlugs,
      leadGenSlugs,
      customerServiceSlugs,
      sessionsAllowedSlugs: [
        ...salesTeamSlugs,
        ...leadGenSlugs,
        ...customerServiceSlugs,
      ],
      allTrainees,
      archivedSlugs,
      applicantSlugs,
      csOnboardingSlugs,
      buddyBySlug,
      seniorSlugByJuniorSlug,
      juniorSlugsBySeniorSlug,
      source: "airtable",
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[airtable-trainees] Fetch threw — using fallback:", err);
    return buildFallback();
  }
}
