// hooks/useSessionsProgress.ts
//
// Per-rep state for the Sessions area. Persists to localStorage under
//   sessionsProgress:<slug>
// Keeps shape simple — no server round-trip for the MVP. A future Phase 2
// would mirror this into the existing /api/progress Airtable table.

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AssetKind,
  AssetState,
  QuizAttempt,
  RepSessionsProgress,
  Session,
  SessionFilter,
  SessionProgress,
  SessionStatus,
} from "@/types/sessions";
import { sessions, getSessionById } from "@/data/sessions";
import { trainees } from "@/data/trainees";

const REP_SLUG_KEY = "sessions-rep-slug";

function progressKey(slug: string) {
  return `sessionsProgress:${slug}`;
}

const EMPTY_REP_PROGRESS: RepSessionsProgress = {
  filterPref: "all",
  sessions: {},
};

function loadFromStorage(slug: string): RepSessionsProgress {
  if (typeof window === "undefined") return EMPTY_REP_PROGRESS;
  const raw = localStorage.getItem(progressKey(slug));
  if (!raw) return EMPTY_REP_PROGRESS;
  try {
    const parsed = JSON.parse(raw) as RepSessionsProgress;
    return {
      filterPref: parsed.filterPref ?? "all",
      sessions: parsed.sessions ?? {},
    };
  } catch {
    return EMPTY_REP_PROGRESS;
  }
}

function emptySessionProgress(): SessionProgress {
  return { assetStates: {}, resumePositions: {}, quizAttempts: [] };
}

/** Returns the currently-selected rep slug (or null if not chosen). */
export function getSelectedRepSlug(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REP_SLUG_KEY);
}

export function setSelectedRepSlug(slug: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REP_SLUG_KEY, slug);
}

export function clearSelectedRepSlug() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REP_SLUG_KEY);
}

// ─── Pure helpers (used by both server-style derivations and the hook) ──────

export function getSessionStatus(
  session: Session,
  progress: SessionProgress | undefined
): SessionStatus {
  if (!progress) return "not-started";
  const passed = progress.quizAttempts.some((a) => a.passed);
  if (passed) return "completed";
  const anyViewed = Object.values(progress.assetStates).some(
    (s) => s === "viewed" || s === "in-progress"
  );
  return anyViewed ? "in-progress" : "not-started";
}

/** True if published in the last 7 days AND not yet opened by this rep. */
export function isNewForRep(
  session: Session,
  progress: SessionProgress | undefined
): boolean {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const age = Date.now() - new Date(session.date).getTime();
  if (age > SEVEN_DAYS) return false;
  return !progress || !progress.lastViewedAt;
}

/** Best score across attempts, 0-100. Returns null if never attempted. */
export function bestQuizScore(progress: SessionProgress | undefined): number | null {
  if (!progress || progress.quizAttempts.length === 0) return null;
  return Math.max(...progress.quizAttempts.map((a) => a.score));
}

/** Number of asset slots viewed. Quiz counts as viewed once passed. The non-quiz
 *  kinds checked here are every kind we currently render — extend this list if
 *  a new asset type lands. */
export function assetsViewedCount(progress: SessionProgress | undefined): number {
  if (!progress) return 0;
  const NON_QUIZ_KINDS: AssetKind[] = [
    "debrief",
    "toolkit",
    "intro",
    "podcast",
    "presentation",
  ];
  let count = 0;
  for (const kind of NON_QUIZ_KINDS) {
    if (progress.assetStates[kind] === "viewed") count++;
  }
  if (progress.quizAttempts.some((a) => a.passed)) count++;
  return count;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSessionsProgress(slug: string | null) {
  const [data, setData] = useState<RepSessionsProgress>(EMPTY_REP_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!slug) {
      setData(EMPTY_REP_PROGRESS);
      setHydrated(true);
      return;
    }

    // 1. Hydrate from localStorage immediately for instant UI.
    const local = loadFromStorage(slug);
    setData(local);
    setHydrated(true);

    // 2. Fetch authoritative quiz attempts AND asset-view events from Airtable
    //    in parallel and merge them in. Server wins for both. This makes
    //    pass/fail/score AND asset-viewed states consistent across devices and
    //    browsers — localStorage alone isn't a source of truth because every
    //    browser has its own. Resume positions stay local-only (low value to
    //    sync, high overhead).
    let aborted = false;
    Promise.all([
      fetch(`/api/sessions/quiz/results?rep_slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : { submissions: [] })),
      fetch(
        `/api/sessions/asset-view/results?rep_slug=${encodeURIComponent(slug)}`,
        { cache: "no-store" }
      ).then((r) => (r.ok ? r.json() : { views: [] })),
    ])
      .then(
        ([quizPayload, viewPayload]: [
          { submissions?: any[] },
          { views?: any[] }
        ]) => {
          if (aborted) return;
          const submissions = quizPayload.submissions || [];
          const views = viewPayload.views || [];

          // Group server quiz attempts by sessionId.
          const quizBySession: Record<string, QuizAttempt[]> = {};
          for (const s of submissions) {
            if (!quizBySession[s.sessionId]) quizBySession[s.sessionId] = [];
            quizBySession[s.sessionId].push({
              attemptedAt: s.submittedAt,
              score: s.score,
              passed: s.passed === true,
              answers: s.answers || {},
            });
          }

          // Group server asset views by sessionId → list of viewed kinds.
          const viewedBySession: Record<string, AssetKind[]> = {};
          for (const v of views) {
            if (!v.sessionId || !v.assetKind) continue;
            if (!viewedBySession[v.sessionId])
              viewedBySession[v.sessionId] = [];
            const kind = v.assetKind as AssetKind;
            if (!viewedBySession[v.sessionId].includes(kind)) {
              viewedBySession[v.sessionId].push(kind);
            }
          }

          setData((prev) => {
            const nextSessions = { ...prev.sessions };
            const allSessionIds: string[] = [];
            const seen = new Set<string>();
            for (const sid of Object.keys(quizBySession)
              .concat(Object.keys(viewedBySession))
              .concat(Object.keys(prev.sessions))) {
              if (!seen.has(sid)) {
                seen.add(sid);
                allSessionIds.push(sid);
              }
            }
            for (const sid of allSessionIds) {
              const existing = nextSessions[sid] ?? emptySessionProgress();
              // Quiz attempts — server wins.
              const quizAttempts = quizBySession[sid]
                ? quizBySession[sid].sort((a, b) =>
                    a.attemptedAt.localeCompare(b.attemptedAt)
                  )
                : existing.quizAttempts;
              // Asset states — merge server views in (server says viewed →
              // mark viewed). Don't downgrade anything that's already
              // viewed locally.
              const assetStates: Partial<Record<AssetKind, AssetState>> = {
                ...existing.assetStates,
              };
              const serverViewed = viewedBySession[sid];
              if (serverViewed) {
                serverViewed.forEach((kind) => {
                  assetStates[kind] = "viewed";
                });
              }
              nextSessions[sid] = {
                ...existing,
                quizAttempts,
                assetStates,
                lastViewedAt:
                  existing.lastViewedAt ??
                  quizAttempts[quizAttempts.length - 1]?.attemptedAt,
              };
            }
            const merged: RepSessionsProgress = {
              ...prev,
              sessions: nextSessions,
            };
            // Cache the merged state so the next page load is instant.
            if (typeof window !== "undefined") {
              localStorage.setItem(progressKey(slug), JSON.stringify(merged));
            }
            return merged;
          });
        }
      )
      .catch((err) => {
        // Silent fallback — localStorage is still rendering, so the UI works.
        console.warn("[useSessionsProgress] mount fetch failed", err);
      });

    return () => {
      aborted = true;
    };
  }, [slug]);

  const persist = useCallback(
    (next: RepSessionsProgress) => {
      setData(next);
      if (slug && typeof window !== "undefined") {
        localStorage.setItem(progressKey(slug), JSON.stringify(next));
      }
    },
    [slug]
  );

  const ensureSession = useCallback(
    (sessionId: string): SessionProgress => data.sessions[sessionId] ?? emptySessionProgress(),
    [data]
  );

  const setAssetState = useCallback(
    (sessionId: string, kind: AssetKind, state: AssetState) => {
      const cur = ensureSession(sessionId);
      const next: RepSessionsProgress = {
        ...data,
        sessions: {
          ...data.sessions,
          [sessionId]: {
            ...cur,
            lastViewedAt: new Date().toISOString(),
            assetStates: { ...cur.assetStates, [kind]: state },
          },
        },
      };
      persist(next);

      // Mirror "viewed" transitions to Airtable so trainers can verify the
      // rep has actually consumed each asset. Fire-and-forget — failures
      // don't affect the rep's UI experience (localStorage is authoritative
      // for what they see).
      if (state === "viewed" && slug) {
        const session = getSessionById(sessionId);
        const trainee = trainees.find((t) => t.slug === slug);
        if (session) {
          fetch("/api/sessions/asset-view/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              repSlug: slug,
              repName: trainee?.name ?? "",
              sessionId,
              sessionNumber: session.number,
              sessionTitle: session.title,
              assetKind: kind,
              viewedAt: new Date().toISOString(),
            }),
          }).catch((err) => {
            console.warn("[asset-view/submit] failed", err);
          });
        }
      }
    },
    [data, ensureSession, persist, slug]
  );

  const setResumePosition = useCallback(
    (sessionId: string, kind: AssetKind, seconds: number) => {
      const cur = ensureSession(sessionId);
      const next: RepSessionsProgress = {
        ...data,
        sessions: {
          ...data.sessions,
          [sessionId]: {
            ...cur,
            lastViewedAt: new Date().toISOString(),
            resumePositions: { ...cur.resumePositions, [kind]: seconds },
            // If we're tracking a resume position the asset is implicitly in-progress
            assetStates: {
              ...cur.assetStates,
              [kind]: cur.assetStates[kind] === "viewed" ? "viewed" : "in-progress",
            },
          },
        },
      };
      persist(next);
    },
    [data, ensureSession, persist]
  );

  const recordQuizAttempt = useCallback(
    (sessionId: string, attempt: QuizAttempt) => {
      const cur = ensureSession(sessionId);
      const next: RepSessionsProgress = {
        ...data,
        sessions: {
          ...data.sessions,
          [sessionId]: {
            ...cur,
            lastViewedAt: new Date().toISOString(),
            quizAttempts: [...cur.quizAttempts, attempt],
          },
        },
      };
      persist(next);
    },
    [data, ensureSession, persist]
  );

  const setFilter = useCallback(
    (filter: SessionFilter) => persist({ ...data, filterPref: filter }),
    [data, persist]
  );

  // Derived view: which session, if any, the rep should be nudged to resume.
  const continueWhereLeftOff = useCallback((): {
    session: Session;
    asset: AssetKind;
    resumeSeconds?: number;
  } | null => {
    if (!hydrated) return null;
    const candidates = sessions
      .map((s) => ({ session: s, prog: data.sessions[s.id] }))
      .filter(
        ({ session, prog }) =>
          prog &&
          getSessionStatus(session, prog) === "in-progress" &&
          !!prog.lastViewedAt
      )
      .sort(
        (a, b) =>
          new Date(b.prog!.lastViewedAt!).getTime() -
          new Date(a.prog!.lastViewedAt!).getTime()
      );
    const top = candidates[0];
    if (!top) return null;

    // Prefer an asset currently in-progress, else the first not-viewed one.
    const order: AssetKind[] = [
      "debrief",
      "toolkit",
      "podcast",
      "presentation",
      "quiz",
    ];
    const inProgressKind = order.find(
      (k) => top.prog!.assetStates[k] === "in-progress"
    );
    const notViewedKind = order.find((k) => !top.prog!.assetStates[k]);
    const asset = inProgressKind ?? notViewedKind ?? "quiz";
    return {
      session: top.session,
      asset,
      resumeSeconds: top.prog!.resumePositions[asset],
    };
  }, [data, hydrated]);

  return {
    data,
    hydrated,
    setAssetState,
    setResumePosition,
    recordQuizAttempt,
    setFilter,
    continueWhereLeftOff,
  };
}
