// app/scorecard/[slug]/page.tsx

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getTraineeBySlug } from "@/data/trainees";
import PasswordGate from "@/components/PasswordGate";
import Scorecard from "@/components/Scorecard";

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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/trainees/${slug}`}
                className="text-slate-400 hover:text-white transition-colors"
                title="Back to Training"
              >
                <svg
                  className="w-6 h-6"
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
                <h1 className="text-xl font-bold">{trainee.name}</h1>
                <p className="text-sm text-slate-400">Activity Scorecard</p>
              </div>
            </div>
            <Link
              href="/roadmap"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              View Standards →
            </Link>
          </div>
        </div>
      </header>

      {/* Scorecard */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Scorecard traineeSlug={slug} traineeName={trainee.name} />
        
        {/* Quick link back to training */}
        <div className="mt-6 text-center">
          <Link
            href={`/trainees/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Back to Training Modules
          </Link>
        </div>
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
