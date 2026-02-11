// app/schedule/cindy/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function CindyScheduleContent() {
  const competencies = [
    "Technology Set Up",
    "How to Book a Lead",
    "How to Close a Deal",
    "5 Hours Call for Call",
    "5 Hours Supervised Calls",
    "Call Scripts",
    "Understanding the Quodo Production Process",
    "Understanding the strength of our Customer Service Team",
    "Objection Handling",
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-slate-400 hover:text-white transition-colors"
                title="Back to Portal"
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
                <h1 className="text-xl font-bold">Cindy Manrique</h1>
                <p className="text-sm text-slate-400">Training Week · Mon 16 Feb – Fri 20 Feb 2026</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs font-semibold rounded-full">
              Week 0 — Training
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ═══════════════════════════════════════════ */}
        {/* SCHEDULE + COMPETENCIES SIDE BY SIDE       */}
        {/* ═══════════════════════════════════════════ */}
        <div className="flex gap-6">

          {/* ── Schedule Table ── */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-3 text-left font-semibold w-24 border border-slate-700 text-xs">Time</th>
                    <th className="p-3 text-center font-semibold border border-slate-700">Mon 16 Feb</th>
                    <th className="p-3 text-center font-semibold border border-slate-700">Tue 17 Feb</th>
                    <th className="p-3 text-center font-semibold border border-slate-700">Wed 18 Feb</th>
                    <th className="p-3 text-center font-semibold border border-slate-700">Thu 19 Feb</th>
                    <th className="p-3 text-center font-semibold border border-slate-700">Fri 20 Feb</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ── Arrivals ── */}
                  <tr className="bg-blue-50">
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 text-xs whitespace-nowrap">✈️ Arrival</td>
                    <td className="p-3 text-center border border-gray-200 text-xs">
                      <div className="font-semibold text-blue-700">Cindy</div>
                      <div className="text-gray-500">Sydney → Adelaide</div>
                      <div className="text-gray-500">QF731 · Lands 8:15am</div>
                    </td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  </tr>

                  {/* ── 8:30–9:00 ── */}
                  <tr>
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">8:30–9:00am</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-purple-50">
                      <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Specialised Training</div>
                      <div className="text-[10px] text-gray-500 mt-1.5">8:30–10:00am · 1.5hrs</div>
                    </td>
                    <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-purple-50">
                      <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Specialised Training</div>
                      <div className="text-[10px] text-gray-500 mt-1.5">8:30–10:00am · 1.5hrs</div>
                    </td>
                    <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-purple-50">
                      <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Specialised Training</div>
                      <div className="text-[10px] text-gray-500 mt-1.5">8:30–10:00am · 1.5hrs</div>
                    </td>
                    <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-purple-50">
                      <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Specialised Training</div>
                      <div className="text-[10px] text-gray-500 mt-1.5">8:30–10:00am · 1.5hrs</div>
                    </td>
                  </tr>

                  {/* ── 9:00–10:00 ── */}
                  <tr>
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:00–10:00am</td>
                    {/* MON */}
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-purple-100 text-purple-700 rounded px-2 py-1 text-xs font-semibold">Welcome</div>
                      <div className="text-[10px] text-gray-600 mt-1.5 text-left pl-2 space-y-0.5">
                        <div>• Tech Setup</div>
                        <div>• The Week&apos;s Schedule</div>
                        <div>• Competencies</div>
                      </div>
                    </td>
                    {/* TUE-FRI: covered by Specialised Training rowSpan from 8:30 */}
                  </tr>

                  {/* ── 10:00–11:00 ── */}
                  <tr>
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:00–11:00am</td>
                    {/* MON */}
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    {/* TUE-FRI: C4C */}
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    </td>
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    </td>
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    </td>
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    </td>
                  </tr>

                  {/* ── 11:00–12:00 ── */}
                  <tr>
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:00–12:00pm</td>
                    {/* MON */}
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-slate-100 text-slate-700 rounded px-2 py-1.5 text-xs font-semibold">Standards &amp; Scorecards</div>
                    </td>
                    {/* TUE-FRI: Unsupervised Calls */}
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-orange-100 text-orange-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Unsupervised Calls</div>
                    </td>
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-orange-100 text-orange-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Unsupervised Calls</div>
                    </td>
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-orange-100 text-orange-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Unsupervised Calls</div>
                    </td>
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-orange-100 text-orange-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Unsupervised Calls</div>
                    </td>
                  </tr>

                  {/* ── 12:00–1:00 LUNCH ── */}
                  <tr>
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-yellow-50 text-xs whitespace-nowrap">12:00–1:00pm</td>
                    <td className="p-3 text-center border border-gray-200 bg-yellow-50">
                      <span className="text-yellow-700 font-medium">🍽️ Lunch</span>
                    </td>
                    <td className="p-3 text-center border border-gray-200 bg-yellow-50">
                      <span className="text-yellow-700 font-medium">🍽️ Lunch</span>
                    </td>
                    <td className="p-3 text-center border border-gray-200 bg-yellow-50">
                      <span className="text-yellow-700 font-medium">🍽️ Lunch</span>
                    </td>
                    <td className="p-3 text-center border border-gray-200 bg-yellow-50">
                      <span className="text-yellow-700 font-medium">🍽️ Lunch</span>
                    </td>
                    <td className="p-3 text-center border border-gray-200 bg-yellow-50">
                      <span className="text-yellow-700 font-medium">🍽️ Lunch</span>
                    </td>
                  </tr>

                  {/* ── 1:00–2:00 ── */}
                  <tr>
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:00–2:00pm</td>
                    {/* MON */}
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    </td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  </tr>

                  {/* ── 2:00–3:00 ── */}
                  <tr>
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:00–3:00pm</td>
                    {/* MON */}
                    <td className="p-3 text-center border border-gray-200">
                      <div className="bg-amber-100 text-amber-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Supervised Calls</div>
                    </td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  </tr>

                  {/* ── 3:00–4:00 ── */}
                  <tr>
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:00–4:00pm</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  </tr>

                  {/* ── 4:00–5:00 ── */}
                  <tr>
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:00–5:00pm</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  </tr>

                  {/* ── Departure ── */}
                  <tr className="bg-blue-50">
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 text-xs whitespace-nowrap">✈️ Departure</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-xs">
                      <div className="text-gray-500 italic">Sat 21 Feb</div>
                      <div className="text-gray-500">Adelaide → Sydney</div>
                      <div className="text-gray-500">QF740 · Departs 12:35pm</div>
                    </td>
                  </tr>

                  {/* ── Evening ── */}
                  <tr className="bg-indigo-50">
                    <td className="p-3 font-medium text-gray-700 border border-gray-200 text-xs whitespace-nowrap">🌙 Evening</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                    <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></span>
                <span className="text-gray-600">Training</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-sky-100 border border-sky-200"></span>
                <span className="text-gray-600">Call for Call (C4C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></span>
                <span className="text-gray-600">Supervised Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></span>
                <span className="text-gray-600">Unsupervised Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></span>
                <span className="text-gray-600">Lunch</span>
              </div>
            </div>
          </div>

          {/* ── Competencies & Resources Panel ── */}
          <div className="w-96 flex-shrink-0 space-y-6">

            {/* Competencies */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-xs">✓</span>
                Competencies
              </h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="pb-2 text-left font-semibold text-gray-500 w-6"></th>
                    <th className="pb-2 text-left font-semibold text-gray-500">Competency</th>
                    <th className="pb-2 text-center font-semibold text-gray-500 w-20">Date</th>
                    <th className="pb-2 text-center font-semibold text-gray-500 w-20">Initials</th>
                  </tr>
                </thead>
                <tbody>
                  {competencies.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2.5 text-center">
                        <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-pink-400 transition-colors"></div>
                      </td>
                      <td className="py-2.5 text-gray-700 font-medium pr-2">{item}</td>
                      <td className="py-2.5 px-1">
                        <div className="h-7 rounded border border-gray-300 bg-gray-50/50"></div>
                      </td>
                      <td className="py-2.5 px-1">
                        <div className="h-7 rounded border border-gray-300 bg-gray-50/50"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Additional Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">📚</span>
                Additional Resources
              </h2>
              <Link
                href="/"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">All Resource Modules</div>
                  <div className="text-[10px] text-gray-500">View all training resources</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Back to Training Portal
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CindySchedulePage() {
  return (
    <PasswordGate requireMaster>
      <CindyScheduleContent />
    </PasswordGate>
  );
}
