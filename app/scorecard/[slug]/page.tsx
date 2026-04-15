// app/scorecard/[slug]/page.tsx

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getTraineeBySlug } from "@/data/trainees";
import { isSenior, isJunior } from "@/data/buddyPairs";
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
