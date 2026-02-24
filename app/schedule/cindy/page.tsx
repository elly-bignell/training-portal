// app/schedule/cindy/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function CindyScheduleContent() {
  const weeks = [
    {
        "week": 1,
        "dateRange": "Mon 23 Feb – Fri 27 Feb",
        "label": "First Week Out",
        "badge": "Calls Only",
        "badgeColor": "bg-sky-100 text-sky-700"
    },
    {
        "week": 2,
        "dateRange": "Mon 2 Mar – Fri 6 Mar",
        "label": "Building Pipeline",
        "badge": "+ 1 Meeting",
        "badgeColor": "bg-emerald-100 text-emerald-700"
    },
    {
        "week": 3,
        "dateRange": "Mon 9 Mar – Fri 13 Mar",
        "label": "Consistency",
        "badge": "+ 1 Meeting",
        "badgeColor": "bg-emerald-100 text-emerald-700"
    },
    {
        "week": 4,
        "dateRange": "Mon 16 Mar – Fri 20 Mar",
        "label": "Wrapping Up Phase 1",
        "badge": "+ 1 Meeting",
        "badgeColor": "bg-emerald-100 text-emerald-700"
    },
    {
        "week": 5,
        "dateRange": "Mon 23 Mar – Fri 27 Mar",
        "label": "Stepping Up",
        "badge": "2 Meetings",
        "badgeColor": "bg-amber-100 text-amber-700"
    },
    {
        "week": 6,
        "dateRange": "Mon 30 Mar – Fri 3 Apr",
        "label": "Final Buddy Week",
        "badge": "2 Meetings",
        "badgeColor": "bg-amber-100 text-amber-700"
    },
    {
        "week": 7,
        "dateRange": "Mon 6 Apr – Fri 10 Apr",
        "label": "✈️ Flying Solo",
        "badge": "Solo",
        "badgeColor": "bg-emerald-600 text-white"
    },
    {
        "week": 8,
        "dateRange": "Mon 13 Apr – Fri 17 Apr",
        "label": "🎯 The Standard",
        "badge": "The Standard",
        "badgeColor": "bg-pink-600 text-white"
    }
];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Cindy Manrique + Lucas Tirri</h1>
              <p className="text-sm text-slate-400">Weekly Schedule — 8-Week Ramp</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {weeks.map((w) => (
            <Link
              key={w.week}
              href={`/schedule/cindy/week-${w.week}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                  {w.week}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-pink-700 transition-colors">
                    Week {w.week} — {w.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{w.dateRange}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${w.badgeColor}`}>
                  {w.badge}
                </span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/roadmap" className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors">
            View Full Roadmap →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CindySchedulePage() {
  return (
    <PasswordGate traineeSlug="cindy-rose-rondez-manrique">
      <CindyScheduleContent />
    </PasswordGate>
  );
}
