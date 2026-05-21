// app/sessions/page.tsx
//
// Sessions home — the landing page of the new portal area.
//   • Welcome strip (rep name + portal-wide progress bar)
//   • "Continue where you left off" card (only when applicable)
//   • Filter chips: All / In Progress / Completed / Not Started
//     – persisted in URL via ?filter=  AND in localStorage as filterPref
//   • Card grid: 3-col desktop, 2-col tablet, 1-col mobile

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import RepPicker from "@/components/sessions/RepPicker";
import SessionsHeader from "@/components/sessions/SessionsHeader";
import SessionCard from "@/components/sessions/SessionCard";
import { sessions } from "@/data/sessions";
import { isCustomerService } from "@/data/trainees";
import {
  assetsViewedCount,
  getSessionStatus,
  useSessionsProgress,
} from "@/hooks/useSessionsProgress";
import { Session, SessionFilter } from "@/types/sessions";

const FILTER_LABELS: Record<SessionFilter, string> = {
  all: "All",
  "in-progress": "In Progress",
  completed: "Completed",
  "not-started": "Not Started",
};

function isFilter(v: string | null): v is SessionFilter {
  return v === "all" || v === "in-progress" || v === "completed" || v === "not-started";
}

function SessionsHomeInner() {
  const [repSlug, setRepSlug] = useState<string | null>(null);
  const [repName, setRepName] = useState<string>("");
  const { data, hydrated, setFilter, continueWhereLeftOff } =
    useSessionsProgress(repSlug);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filter precedence: URL > stored pref > "all"
  const urlFilter = searchParams.get("filter");
  const filter: SessionFilter = isFilter(urlFilter)
    ? urlFilter
    : data.filterPref ?? "all";

  // On first load, if no URL filter, push the stored pref into the URL so
  // refresh remembers (per the brief).
  useEffect(() => {
    if (!hydrated) return;
    if (!urlFilter && data.filterPref && data.filterPref !== "all") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("filter", data.filterPref);
      router.replace(`${pathname}?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const handleFilterClick = (next: SessionFilter) => {
    setFilter(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  // Customer Service reps see every session with the quiz asset removed.
  // We project each Session into an "effective" version once and use that
  // everywhere downstream — same id, same metadata, just trimmed assets.
  // That way the dots, counts, denominators and status calcs all line up.
  const isCS = isCustomerService(repSlug);
  const effectiveSessions: Session[] = useMemo(
    () =>
      isCS
        ? sessions.map((s) => ({
            ...s,
            assets: s.assets.filter((a) => a.kind !== "quiz"),
          }))
        : sessions,
    [isCS]
  );

  // Rank sessions: newest first (latest date wins).
  const ranked = useMemo(
    () =>
      [...effectiveSessions].sort((a, b) => {
        // Newest sessions first. Sort by date desc, then by session number
        // desc as a tiebreaker (two sessions can share a date when more
        // than one happens in a day).
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return a.number < b.number ? 1 : -1;
      }),
    [effectiveSessions]
  );

  // Featured sessions get hoisted out of the normal grid and rendered as
  // banner cards above it. They're not filtered by the status chips —
  // they're always visible because they're the team's "watch this now"
  // attention magnets.
  const featuredSessions = useMemo(
    () => ranked.filter((s) => s.featured),
    [ranked]
  );

  const visibleSessions = useMemo(
    () =>
      ranked
        .filter((s) => !s.featured)
        .filter((s) => {
          if (filter === "all") return true;
          return getSessionStatus(s, data.sessions[s.id]) === filter;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ranked, filter, data, isCS]
  );

  // Portal-wide progress: viewed assets / total assets across every
  // (effective) session. For CS reps the quiz doesn't count toward either
  // numerator or denominator since they don't see it.
  const totalAssets = effectiveSessions.reduce(
    (sum, s) => sum + s.assets.length,
    0
  );
  const totalViewed = effectiveSessions.reduce(
    (sum, s) => sum + assetsViewedCount(data.sessions[s.id], s.assets.length),
    0
  );
  const completedCount = effectiveSessions.filter(
    (s) => getSessionStatus(s, data.sessions[s.id]) === "completed"
  ).length;
  const portalPct = totalAssets > 0
    ? Math.round((totalViewed / totalAssets) * 100)
    : 0;

  const continueState = continueWhereLeftOff();

  // Show rep picker until the rep is identified.
  if (!repSlug) {
    return (
      <RepPicker
        onSelected={(slug, name) => {
          setRepSlug(slug);
          setRepName(name);
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SessionsHeader repName={repName} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome strip */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {repName.split(" ")[0]}.
          </h1>
          <p className="text-slate-600 mt-1">
            You&apos;ve completed {completedCount} of {effectiveSessions.length} sessions.
          </p>
          <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden max-w-md">
            <div
              className="h-full bg-[#1F3A5F] transition-all duration-500"
              style={{ width: `${portalPct}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">{portalPct}%</div>
        </div>

        {/* Continue where you left off */}
        {continueState && (
          <Link
            href={`/sessions/${continueState.session.id}#asset-${continueState.asset}`}
            className="block mb-8 bg-gradient-to-r from-[#1F3A5F] to-[#2a4a73] rounded-2xl p-5 text-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-1">
              Continue where you left off
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-lg">
                  Session {continueState.session.number} —{" "}
                  {continueState.session.title}
                </div>
                <div className="text-sm text-white/80 mt-1 capitalize">
                  {continueState.asset === "quiz"
                    ? "Quiz waiting for you"
                    : `${continueState.asset}`}
                  {continueState.resumeSeconds
                    ? ` · resume at ${formatTime(continueState.resumeSeconds)}`
                    : ""}
                </div>
              </div>
              <div className="text-[#D49A30] font-bold whitespace-nowrap">
                Resume →
              </div>
            </div>
          </Link>
        )}

        {/* Featured sessions — full-width banner cards above the grid */}
        {featuredSessions.length > 0 && (
          <div className="mb-8 space-y-4">
            {featuredSessions.map((s) => {
              const status = getSessionStatus(s, data.sessions[s.id]);
              const done = status === "completed";
              return (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="group block rounded-2xl overflow-hidden border border-[#D49A30]/40 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#1F3A5F] via-[#1F3A5F] to-[#2a4a73] relative"
                >
                  {/* Gold accent stripe */}
                  <div className="h-1.5 w-full bg-[#D49A30]" />
                  <div className="p-6 sm:p-7 text-white">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#D49A30] text-[#1F3A5F] rounded text-[10px] font-bold tracking-wider mb-3">
                          ★ FEATURED · {s.bannerLabel ?? "WATCH THIS"}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">
                          {s.title}
                        </h2>
                        <p className="text-white/85 text-sm sm:text-base mb-4 max-w-2xl">
                          {s.summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-white/70">
                          <span className="inline-flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="9" strokeWidth={2} />
                              <path strokeLinecap="round" strokeWidth={2} d="M12 7v5l3 2" />
                            </svg>
                            {s.totalTime}
                          </span>
                          {done && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#3C8055] text-white rounded-full font-bold tracking-wider">
                              ✓ WATCHED
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[#D49A30] font-bold whitespace-nowrap text-base self-center">
                        {done ? "Rewatch →" : "Watch the video →"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Filter chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(FILTER_LABELS) as SessionFilter[]).map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => handleFilterClick(f)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors border ${
                  active
                    ? "bg-[#1F3A5F] text-white border-[#1F3A5F]"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            );
          })}
        </div>

        {/* Card grid */}
        {visibleSessions.length === 0 ? (
          <div className="text-center text-slate-500 py-16 bg-white rounded-2xl border border-slate-200">
            <p className="font-medium text-slate-700">Nothing here yet.</p>
            <p className="text-sm mt-1">
              Try a different filter, or wait for the next session to drop.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleSessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                progress={data.sessions[s.id]}
                status={getSessionStatus(s, data.sessions[s.id])}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function formatTime(s: number) {
  const mm = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

// RepPicker now handles per-rep authentication via /api/auth/validate —
// no outer PasswordGate is needed (it would just add a redundant prompt).
//
// Suspense wrapper is required because SessionsHomeInner calls
// useSearchParams() — without PasswordGate's client-only wrapper around
// it, Next 14 needs an explicit Suspense boundary so the page can
// prerender as a shell and hydrate the searchParams on the client.
export default function SessionsHomePage() {
  return (
    <Suspense fallback={null}>
      <SessionsHomeInner />
    </Suspense>
  );
}
