// app/sessions/[id]/page.tsx
//
// Session detail — hero, suggested learning path strip, then five asset cards.

"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import RepPicker from "@/components/sessions/RepPicker";
import SessionsHeader from "@/components/sessions/SessionsHeader";
import AssetCard from "@/components/sessions/AssetCard";
import { getSessionById } from "@/data/sessions";
import { isCustomerService } from "@/data/trainees";
import {
  assetsViewedCount,
  bestQuizScore,
  getSessionStatus,
  useSessionsProgress,
} from "@/hooks/useSessionsProgress";
import { AssetKind } from "@/types/sessions";

const ASSET_LABELS: Record<AssetKind, string> = {
  debrief: "Read",
  toolkit: "Reference",
  intro: "Intro",
  podcast: "Listen",
  presentation: "Watch",
  quiz: "Test",
};

const NUMERALS = ["①", "②", "③", "④", "⑤", "⑥"];

function SessionDetailInner() {
  const params = useParams<{ id: string }>();
  const session = getSessionById(params.id);

  const [repSlug, setRepSlug] = useState<string | null>(null);
  const [repName, setRepName] = useState<string>("");
  const { data, setAssetState, setResumePosition } =
    useSessionsProgress(repSlug);

  if (!session) return notFound();

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

  // Customer Service team sees every asset EXCEPT the quiz. Filter once
  // here and pass the trimmed list to every downstream component so the
  // counts, dots, learning-path strip and cards all stay in sync.
  const isCS = isCustomerService(repSlug);
  const visibleAssets = isCS
    ? session.assets.filter((a) => a.kind !== "quiz")
    : session.assets;

  const progress = data.sessions[session.id];
  const status = getSessionStatus(session, progress);
  const viewed = assetsViewedCount(progress, visibleAssets.length);
  const best = bestQuizScore(progress);
  const quizAsset = session.assets.find((a) => a.kind === "quiz");
  const passMark =
    quizAsset && quizAsset.kind === "quiz" ? quizAsset.passMark : 80;

  return (
    <main className="min-h-screen bg-slate-50">
      <SessionsHeader
        repName={repName}
        breadcrumb={`Session ${session.number}`}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/sessions"
          className="inline-block text-sm text-slate-500 hover:text-[#1F3A5F] mb-4"
        >
          ← All sessions
        </Link>

        {/* Hero */}
        <div className="mb-8">
          <div className="text-xs font-bold tracking-wider text-slate-500 mb-3">
            SESSION {session.number} ·{" "}
            {new Date(session.date).toLocaleDateString("en-AU", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).toUpperCase()}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1F3A5F] leading-tight mb-3">
            {session.title}
          </h1>
          <div className="text-sm text-slate-600 mb-6">
            Led by {session.director} · Director
          </div>

          {/* Key takeaway callout */}
          <div className="border-l-4 border-[#D49A30] bg-[#D49A30]/5 px-5 py-4 rounded-r-lg mb-6">
            <div className="text-xs font-bold tracking-wider text-[#D49A30] mb-1">
              KEY TAKEAWAY
            </div>
            <p className="text-slate-800 leading-relaxed">
              {session.keyTakeaway}
            </p>
          </div>

          {/* Time + dots */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <path strokeLinecap="round" strokeWidth={2} d="M12 7v5l3 2" />
              </svg>
              {session.totalTime} total
            </span>
            <span className="flex items-center gap-1">
              {Array.from({ length: visibleAssets.length }).map((_, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: i < viewed ? "#1F3A5F" : "#E5E5E5" }}
                />
              ))}
              <span className="ml-1">
                {viewed} of {visibleAssets.length} assets viewed
              </span>
            </span>
            {best !== null && (
              <span className="text-slate-700">
                Best quiz: <span className="font-semibold">{best}%</span>
              </span>
            )}
            {status === "completed" && (
              <span className="px-2 py-0.5 text-xs font-bold tracking-wider bg-[#3C8055] text-white rounded-full">
                COMPLETE
              </span>
            )}
          </div>
        </div>

        {/* How this session works — module instructions */}
        {(() => {
          // Friendly labels for each asset kind, in the order they should
          // appear on the page. Derive copy from the session's actual
          // assets (excluding quiz, which is described separately) so
          // sessions with missing assets read accurately.
          const PROSE_LABEL: Partial<Record<AssetKind, string>> = {
            debrief: "Debrief",
            toolkit: "Toolkit",
            intro: "Introductory Video",
            podcast: "Podcast",
            presentation: "Presentation",
          };
          const nonQuizLabels = visibleAssets
            .filter((a) => a.kind !== "quiz")
            .map((a) => PROSE_LABEL[a.kind] ?? a.kind);
          const nonQuizCount = nonQuizLabels.length;
          const wordCount =
            ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"][
              nonQuizCount
            ] ?? `${nonQuizCount}`;
          // Join labels as "A, B, C, and D" / "A and B" etc.
          let joinedLabels = "";
          if (nonQuizLabels.length === 1) {
            joinedLabels = nonQuizLabels[0];
          } else if (nonQuizLabels.length === 2) {
            joinedLabels = `${nonQuizLabels[0]} and ${nonQuizLabels[1]}`;
          } else if (nonQuizLabels.length > 2) {
            const last = nonQuizLabels[nonQuizLabels.length - 1];
            joinedLabels = `${nonQuizLabels.slice(0, -1).join(", ")}, then ${last}`;
          }
          return (
            <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-5">
              <div className="text-xs font-bold tracking-wider text-[#1F3A5F] mb-3">
                HOW THIS SESSION WORKS
              </div>
              <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside marker:text-[#1F3A5F] marker:font-bold">
                <li>
                  Work through the {wordCount} assets below — {joinedLabels}.
                </li>
                <li>
                  After you&apos;ve read / watched / listened to each asset, hit
                  the green{" "}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#3C8055] text-white rounded text-xs font-bold">
                    ✓ Mark viewed
                  </span>{" "}
                  button to record that you&apos;ve completed it.
                </li>
                {!isCS && (
                  <li>
                    Take the quiz whenever you&apos;re ready — no need to mark
                    every asset viewed first. You need{" "}
                    <span className="font-semibold">{passMark}%</span> on the
                    multiple-choice questions to pass. Unlimited retries.
                  </li>
                )}
                {!isCS && (
                  <li>
                    If you don&apos;t get 100%, you&apos;ll need to re-sit.
                    We won&apos;t tell you which questions you got wrong, so
                    go back through the assets above before trying again.
                  </li>
                )}
              </ol>
              <p className="text-xs text-slate-500 mt-3 italic">
                Your progress is saved automatically and recorded for the trainers.
                Don&apos;t share your password — every rep&apos;s activity is
                tracked individually.
              </p>
            </div>
          );
        })()}

        {/* Suggested learning path */}
        <div className="mb-8">
          <div className="text-xs font-bold tracking-wider text-slate-500 mb-3">
            SUGGESTED LEARNING PATH
          </div>
          <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
            {(() => {
              // Quiz is never locked any more — sales reps can take it
              // whenever they're ready, CS reps don't see it at all (the
              // quiz is filtered out of visibleAssets upstream).
              const quizPassed =
                progress?.quizAttempts.some((a) => a.passed) ?? false;

              return visibleAssets.map((asset, i) => {
                const stepProgress = progress?.assetStates[asset.kind];
                const passed =
                  asset.kind === "quiz"
                    ? quizPassed
                    : stepProgress === "viewed";
                const inProg = stepProgress === "in-progress";

                const commonClasses =
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap";
                const stateClasses = passed
                  ? "bg-[#3C8055]/10 text-[#3C8055] border-[#3C8055]/30"
                  : inProg
                  ? "bg-[#1F3A5F]/5 text-[#1F3A5F] border-[#1F3A5F]/30 animate-pulse"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300";

                return (
                  <li
                    key={asset.kind}
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <a
                      href={
                        asset.kind === "quiz"
                          ? `/sessions/${session.id}/quiz`
                          : `#asset-${asset.kind}`
                      }
                      className={`${commonClasses} ${stateClasses}`}
                    >
                      <span aria-hidden>
                        {passed ? "✓" : NUMERALS[i] ?? `${i + 1}.`}
                      </span>
                      {ASSET_LABELS[asset.kind]}
                    </a>
                    {i < visibleAssets.length - 1 && (
                      <span className="text-slate-300" aria-hidden>
                        ›
                      </span>
                    )}
                  </li>
                );
              });
            })()}
          </ol>
        </div>

        {/* Asset cards */}
        <div>
          {(() => {
            // Derive the list of asset kinds in this session once, then pass
            // to each AssetCard (used for misc downstream calculations).
            const sessionAssetKinds = visibleAssets.map((a) => a.kind);
            return visibleAssets.map((asset, idx) => {
              const state =
                asset.kind === "quiz"
                  ? progress?.quizAttempts.some((a) => a.passed)
                    ? "viewed"
                    : progress?.quizAttempts.length
                    ? "in-progress"
                    : "not-viewed"
                  : progress?.assetStates[asset.kind] ?? "not-viewed";
              return (
                <AssetCard
                  key={asset.kind}
                  sessionId={session.id}
                  asset={asset}
                  progress={progress}
                  state={state}
                  position={idx + 1}
                  sessionAssetKinds={sessionAssetKinds}
                  onSetState={(kind, s) => setAssetState(session.id, kind, s)}
                  onResume={(kind, sec) =>
                    setResumePosition(session.id, kind, sec)
                  }
                />
              );
            });
          })()}
        </div>
      </div>
    </main>
  );
}

// Per-rep auth is enforced by RepPicker (validates password against the
// picked slug via /api/auth/validate). No outer PasswordGate needed.
export default function SessionDetailPage() {
  return <SessionDetailInner />;
}
