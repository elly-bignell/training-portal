// lib/airtable-trainees.ts
//
// Server-only module. Fetches the Portal Users table from Airtable and
// derives the trainee list + team allowlists that used to be hardcoded in
// data/trainees.ts.
//
// Why: so Elly's colleagues can add/remove/rearrange staff by editing the
// Airtable row alone — no code change, no git push, no deploy. Airtable is
// the single source of truth; the code is just a live projection.
//
// Airtable schema this depends on (Portal Users table):
//   • Name         (singleLineText)
//   • Slug         (singleLineText)  — kebab-case; must match code slug rules
//   • Team         (singleSelect: Sales / Lead Gen / Customer Service / Admin)
//   • StartDate    (date)
//   • Active       (checkbox)
//
// Caching: Next.js fetch with `revalidate: 60` means the Airtable API is hit
// at most once per 60 seconds per Vercel edge region. Individual page loads
// hit the local cache — no API latency after the first request.
//
// Fallback: if Airtable is unreachable (server down, API key rotated, network
// blip), we fall through to the bundled FALLBACK_TRAINEES + FALLBACK_*_SLUGS
// exported by data/trainees.ts. Reps can still log in and use the portal;
// only *newly added* Airtable rows won't be visible until the API is back.

import {
  FALLBACK_TRAINEES,
  FALLBACK_SALES_TEAM_SLUGS,
  FALLBACK_LEAD_GEN_SLUGS,
  FALLBACK_CUSTOMER_SERVICE_SLUGS,
} from "@/data/trainees";
import { Trainee } from "@/types";

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY = process.env.AIRTABLE_API_KEY!;
const TABLE = "Portal Users";
const CACHE_SECONDS = 60;

export interface TraineeContext {
  trainees: Trainee[];
  salesTeamSlugs: string[];
  leadGenSlugs: string[];
  customerServiceSlugs: string[];
  sessionsAllowedSlugs: string[];
  /** Where the data came from — useful for debugging in the network tab. */
  source: "airtable" | "fallback";
  /** ISO timestamp of when this snapshot was assembled. */
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
  };
}

function buildFallback(): TraineeContext {
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

/** Fetches the current trainee context from Airtable. Server-only. */
export async function getTraineeContext(): Promise<TraineeContext> {
  if (!BASE_ID || !API_KEY) {
    console.warn(
      "[airtable-trainees] AIRTABLE_BASE_ID or AIRTABLE_API_KEY missing — using fallback"
    );
    return buildFallback();
  }

  try {
    // Only pull the fields we actually need. Filter server-side to skip inactive
    // records — smaller payload, cleaner shape when it arrives.
    const params = new URLSearchParams();
    params.set("fields[]", "Name");
    params.append("fields[]", "Slug");
    params.append("fields[]", "Team");
    params.append("fields[]", "StartDate");
    params.append("fields[]", "Active");
    params.set("filterByFormula", "{Active} = TRUE()");
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

    const trainees: Trainee[] = [];
    const salesTeamSlugs: string[] = [];
    const leadGenSlugs: string[] = [];
    const customerServiceSlugs: string[] = [];

    for (const rec of records) {
      const { Name, Slug, Team, StartDate } = rec.fields;
      // Skip malformed rows — Slug is required for auth to work.
      if (!Slug || !Name) continue;

      if (Team === "Sales") salesTeamSlugs.push(Slug);
      else if (Team === "Lead Gen") leadGenSlugs.push(Slug);
      else if (Team === "Customer Service") customerServiceSlugs.push(Slug);
      else if (Team === "Admin") {
        // Admins don't appear in RepPicker — skip trainee record entirely.
        continue;
      } else {
        // Team missing — skip. This person has an Airtable row but no team
        // assigned; they won't appear until someone sets Team on their row.
        continue;
      }

      trainees.push({
        id: Slug,
        name: Name,
        slug: Slug,
        // StartDate is optional in Airtable but required in the Trainee type.
        // Fall back to a distant-future placeholder that hides the Week badge
        // (matches how the hardcoded placeholder rows behaved).
        startDate: StartDate ?? "2099-12-31",
      });
    }

    // If Airtable returned records but none of them mapped to a valid trainee,
    // treat it as a bad state and fall back. Avoids booting everyone off the
    // portal if the schema was misconfigured somehow.
    if (trainees.length === 0) {
      console.warn(
        "[airtable-trainees] Airtable returned 0 valid trainees — using fallback"
      );
      return buildFallback();
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
      source: "airtable",
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[airtable-trainees] Fetch threw — using fallback:", err);
    return buildFallback();
  }
}
