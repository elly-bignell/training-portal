// lib/airtable-sessions.ts
//
// Server-only. Fetches the Sessions table from Airtable and shapes rows
// into the Session objects the portal already renders. Designed to be
// merged with the bundled `sessions` array in data/sessions.ts — so a
// row in Airtable acts exactly like a manually-added code entry.
//
// Two derivations returned in the context:
//   • airtableSessions   — every published Airtable row as a Session
//   • airtableLgProjections — the LG/CS-facing projection for rows that
//     have LGNumber set (mirrors data/sessions.ts's projectForLeadGen).
//
// Merge policy (applied in the /api/sessions route):
//   • Airtable rows win on slug collision with bundled entries. Rationale:
//     if a colleague republishes a bundled session with edits, their edit
//     should take effect without needing a code change.
//
// Caching: Next.js fetch with `revalidate: 60`. Falls back to an empty
// list on failure — bundled sessions in data/sessions.ts still render.

import type {
  Asset,
  MultipleChoiceQuestion,
  QuizAsset,
  Session,
} from "@/types/sessions";

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY = process.env.AIRTABLE_API_KEY!;
const TABLE = "Sessions";
const CACHE_SECONDS = 60;

interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  type?: string;
}

interface SessionRecord {
  id: string;
  fields: {
    Slug?: string;
    Title?: string;
    Number?: string;
    LGNumber?: string;
    SessionDate?: string;
    Summary?: string;
    KeyTakeaway?: string;
    Director?: string;
    TotalTime?: string;
    IntroYouTubeUrl?: string;
    DebriefPDF?: AirtableAttachment[];
    ToolkitPDF?: AirtableAttachment[];
    QuizDocx?: AirtableAttachment[];
    QuizJSON?: string;
    Audience?: string[];
    Origin?: string;
    Origins?: string[];
    Published?: boolean;
    Notes?: string;
  };
}

export interface AirtableSessionsContext {
  /** Every published Airtable row as a Session — closer view. */
  airtableSessions: Session[];
  /** LG/CS projection of Airtable rows (with LGNumber set + audience
   *  including Lead Gen or Customer Service). */
  airtableLgProjections: Session[];
  source: "airtable" | "fallback";
  fetchedAt: string;
}

function emptyContext(source: "airtable" | "fallback"): AirtableSessionsContext {
  return {
    airtableSessions: [],
    airtableLgProjections: [],
    source,
    fetchedAt: new Date().toISOString(),
  };
}

/** Fetches every published Session from Airtable and returns them shaped
 *  as Session objects. Safe to call from server components / API routes;
 *  never throws — errors log + fall back to empty. */
export async function getAirtableSessionsContext(): Promise<AirtableSessionsContext> {
  if (!BASE_ID || !API_KEY) {
    console.warn(
      "[airtable-sessions] AIRTABLE_BASE_ID or AIRTABLE_API_KEY missing — returning empty"
    );
    return emptyContext("fallback");
  }

  try {
    // filterByFormula ensures we only fetch published rows. Cheaper than
    // filtering client-side and prevents accidental leaks of drafts.
    const params = new URLSearchParams();
    params.set("filterByFormula", "{Published} = TRUE()");
    params.set("pageSize", "100");

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?${params}`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        // No cache — the calling /api/sessions route is also dynamic;
        // caching here would defeat the point and cause the flicker bug
        // that appeared with edge-cached responses.
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        `[airtable-sessions] Airtable returned ${res.status} ${res.statusText} — returning empty`
      );
      return emptyContext("fallback");
    }

    const json = (await res.json()) as { records: SessionRecord[] };
    const records = json.records ?? [];

    const airtableSessions: Session[] = [];
    const airtableLgProjections: Session[] = [];

    for (const rec of records) {
      const built = buildSession(rec);
      if (!built) continue;
      airtableSessions.push(built);

      // LG/CS projection — only if LGNumber is set AND audience includes
      // at least one of LG/CS. Sales-only sessions don't get projected.
      const lgNumber = rec.fields.LGNumber?.trim();
      const audience = rec.fields.Audience ?? [];
      const eligibleForLg =
        !!lgNumber &&
        (audience.includes("Lead Gen") || audience.includes("Customer Service"));
      if (eligibleForLg) {
        airtableLgProjections.push(projectSessionForLg(built, lgNumber!));
      }
    }

    return {
      airtableSessions,
      airtableLgProjections,
      source: "airtable",
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[airtable-sessions] Fetch threw — returning empty:", err);
    return emptyContext("fallback");
  }
}

/** Builds a Session object from an Airtable row. Returns null if the row
 *  is missing required fields (Slug, Title, Number, Date). Missing
 *  optional pieces (debrief, toolkit, intro, quiz) simply omit the
 *  corresponding asset. */
function buildSession(rec: SessionRecord): Session | null {
  const {
    Slug,
    Title,
    Number,
    SessionDate,
    Summary,
    KeyTakeaway,
    Director,
    TotalTime,
    IntroYouTubeUrl,
    DebriefPDF,
    ToolkitPDF,
    QuizJSON,
    Origin,
  } = rec.fields;

  if (!Slug || !Title || !Number || !SessionDate) {
    console.warn(
      `[airtable-sessions] Skipping row ${rec.id} — missing Slug/Title/Number/SessionDate`
    );
    return null;
  }

  const assets: Asset[] = [];

  if (IntroYouTubeUrl && IntroYouTubeUrl.trim()) {
    assets.push({
      kind: "intro",
      estimate: "~10 min watch",
      url: IntroYouTubeUrl.trim(),
    });
  }

  if (DebriefPDF && DebriefPDF.length > 0) {
    assets.push({
      kind: "debrief",
      estimate: "10 min read",
      url: DebriefPDF[0].url,
    });
  }

  if (ToolkitPDF && ToolkitPDF.length > 0) {
    assets.push({
      kind: "toolkit",
      estimate: "5 min reference",
      url: ToolkitPDF[0].url,
    });
  }

  if (QuizJSON && QuizJSON.trim()) {
    const parsed = safeParseQuizJson(QuizJSON, Slug);
    if (parsed) assets.push(parsed);
  }

  if (assets.length === 0) {
    console.warn(
      `[airtable-sessions] Skipping row ${rec.id} (${Slug}) — no assets attached`
    );
    return null;
  }

  return {
    id: Slug,
    number: Number,
    date: SessionDate,
    title: Title,
    summary: Summary ?? "",
    keyTakeaway: KeyTakeaway ?? "",
    director: Director ?? "Corie Dawson",
    totalTime: TotalTime ?? estimateTotalTime(assets),
    assets,
    origin: deriveOrigin(rec.fields.Origins, Origin),
  };
}

/** Prefer the new Origins multi-select, fall back to the legacy Origin
 *  single-select. Returns an array of origin tags (empty = default
 *  "sales" applied at the render layer). */
function deriveOrigin(
  origins: string[] | undefined,
  legacyOrigin: string | undefined
): ("sales" | "customer-service")[] {
  const tag = (s: string): "sales" | "customer-service" | null => {
    const norm = s.toLowerCase().trim();
    if (norm === "sales") return "sales";
    if (norm === "customer service" || norm === "customer-service")
      return "customer-service";
    return null;
  };
  if (origins && origins.length > 0) {
    const mapped = origins.map(tag).filter((v): v is "sales" | "customer-service" => !!v);
    if (mapped.length > 0) return mapped;
  }
  if (legacyOrigin) {
    const mapped = tag(legacyOrigin);
    if (mapped) return [mapped];
  }
  return ["sales"];
}

/** Safely parse the QuizJSON string into a QuizAsset. If parsing fails
 *  or the shape doesn't match, we log and return null (the session goes
 *  out without a quiz rather than 500ing the whole /sessions page). */
function safeParseQuizJson(json: string, slug: string): QuizAsset | null {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("questions" in parsed) ||
      !Array.isArray((parsed as { questions: unknown }).questions)
    ) {
      console.warn(
        `[airtable-sessions] QuizJSON for ${slug} isn't a valid QuizAsset shape`
      );
      return null;
    }
    const p = parsed as Partial<QuizAsset>;
    return {
      kind: "quiz",
      estimate: p.estimate ?? `${p.questions?.length ?? 0} questions`,
      passMark: p.passMark ?? 100,
      questions: (p.questions ?? []) as MultipleChoiceQuestion[],
    };
  } catch (err) {
    console.warn(`[airtable-sessions] QuizJSON parse failed for ${slug}:`, err);
    return null;
  }
}

/** Mirrors projectForLeadGen in data/sessions.ts: rewrites the id/number
 *  for the LG/CS view, keeps everything else the same. */
function projectSessionForLg(source: Session, newNumber: string): Session {
  const idSuffix = /^\d+$/.test(newNumber)
    ? String(parseInt(newNumber, 10))
    : newNumber.toLowerCase();
  return {
    ...source,
    id: `lg-session-${idSuffix}`,
    number: newNumber,
    featured: false,
    bannerLabel: undefined,
    salesOnly: false,
  };
}

/** Cheap heuristic for the "~50 min" pill. Sum of per-asset estimates
 *  isn't structured — use a rough 10-min per asset. Colleague can override
 *  by setting TotalTime in Airtable. */
function estimateTotalTime(assets: Asset[]): string {
  const minutes = assets.length * 10;
  return `~${minutes} min`;
}
