// app/scorecard/[slug]/page.tsx

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getTraineeBySlug } from "@/data/trainees";
import { isSenior, isJunior } from "@/data/buddyPairs";
import { BOOKERS } from "@/data/checklistTemplate";
import PasswordGate from "@/components/PasswordGate";
import Scorecard from "@/components/Scorecard";
import ScorecardRulesSenior from "@/components/ScorecardRulesSenior";
import RennieDealTracker from "@/components/RennieDealTracker";
import ScorecardRulesJunior from "@/components/ScorecardRulesJunior";

function ScorecardPageContent() {
  const params = useParams();
  const slug = params.slug as string;
  const trainee = getTraineeBySlug(slug);

  if (!trainee) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Trainee Not Found
          </h1>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href={`/trainees/${slug}`}
                className="text-slate-400 hover:text-white transition-colors"
                title="Back to Training"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-base sm:text-xl font-bold">{trainee.name}</h1>
                <p className="text-xs sm:text-sm text-slate-400">Activity Scorecard</p>
              </div>
            </div>
            <Link
              href="/roadmap"
              className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
            >
              Standards →
            </Link>
          </div>
        </div>
      </header>

      {/* Scorecard + Easter Promotion */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Existing Scorecard — untouched */}
        <Scorecard traineeSlug={slug} traineeName={trainee.name} />

        {/* Daily Checklist — shown automatically for every trainee in BOOKERS
            (which is derived from data/trainees.ts, so new scorecards
            inherit this link without any extra setup). */}
        {BOOKERS.some((b) => b.slug === slug) && (
          <Link
            href={`/checklist?booker=${slug}`}
            className="block rounded-xl p-4 sm:p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold">Daily Checklist</h3>
                  <p className="text-xs sm:text-sm text-white/80">
                    Morning / midday / EOD routines — resets Sunday
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* Team Question Box — available to every portal user */}
        <Link
          href="/question-box"
          className="block rounded-xl p-4 sm:p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Question Box</h3>
                <p className="text-xs sm:text-sm text-white/80">
                  Post anything you&apos;re stuck on — worked through every morning as a team
                </p>
              </div>
            </div>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {slug === "thomas-rennie" && <RennieDealTracker date={new Date().toLocaleDateString("en-CA")} />}
        {isSenior(slug) && <ScorecardRulesSenior slug={slug} />}
        {isJunior(slug) && <ScorecardRulesJunior slug={slug} />}
      </div>
    </main>
  );
}

export default function ScorecardPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <PasswordGate traineeSlug={slug}>
      <ScorecardPageContent />
    </PasswordGate>
  );
}
