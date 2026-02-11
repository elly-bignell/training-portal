// app/schedule/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function SchedulePageContent() {
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
                <h1 className="text-xl font-bold">Training Week Schedule</h1>
                <p className="text-sm text-slate-400">Mon 16 Feb – Sat 21 Feb 2026</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs font-semibold rounded-full">
              Week 0 — Training
            </span>
          </div>
        </div>
      </header>

      {/* Schedule Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
          <div className="min-w-[1100px]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="p-3 text-left font-semibold w-24 border border-slate-700 text-xs">Time</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Mon 16 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Tue 17 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Wed 18 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Thu 19 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Fri 20 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Sat 21 Feb</th>
                </tr>
              </thead>
              <tbody>
                {/* ── Arrivals ── */}
                <tr className="bg-blue-50">
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 text-xs whitespace-nowrap">✈️ Arrivals</td>
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="font-semibold text-blue-700">Cindy</div>
                    <div className="text-gray-500">Sydney → Adelaide</div>
                    <div className="text-gray-500">QF731 · Lands 8:15am</div>
                    <div className="mt-1.5 font-semibold text-blue-700">Becks</div>
                    <div className="text-gray-500">Brisbane → Adelaide</div>
                    <div className="text-gray-500">QF1927 · Lands 9:50am</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── 9:00–10:00 ── */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:00–10:00am</td>
                  {/* MON */}
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-purple-100 text-purple-700 rounded px-2 py-1 text-xs font-semibold">Office Tour</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00am · Cindy, Krishna, Connie</div>
                    <div className="mt-1.5 bg-purple-100 text-purple-700 rounded px-2 py-1 text-xs font-semibold">Info Session</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:30am · Training Week Overview</div>
                  </td>
                  {/* TUE: Felipe Rotation 3hr block */}
                  <td rowSpan={3} className="p-3 text-center border border-gray-200 align-top bg-sky-50">
                    <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Felipe Call Training</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00am – 12:00pm · 3hr rotation</div>
                    <div className="mt-2 text-[10px] text-left space-y-1.5 px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">9:00</span> – Cindy w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">9:30</span> – Krishna w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">10:00</span> – Becks w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">10:30</span> – Connie w/ Felipe</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 italic border-t border-sky-200 pt-1.5">30min 1-on-1 → 1hr solo calls</div>
                    <div className="text-[10px] text-gray-500 italic">Others on Training Modules</div>
                  </td>
                  {/* WED: Felipe Rotation 3hr block */}
                  <td rowSpan={3} className="p-3 text-center border border-gray-200 align-top bg-sky-50">
                    <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Felipe Call Training</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00am – 12:00pm · 3hr rotation</div>
                    <div className="mt-2 text-[10px] text-left space-y-1.5 px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">9:00</span> – Cindy w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">9:30</span> – Krishna w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">10:00</span> – Becks w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">10:30</span> – Connie w/ Felipe</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 italic border-t border-sky-200 pt-1.5">30min 1-on-1 → 1hr solo calls</div>
                    <div className="text-[10px] text-gray-500 italic">Others on Training Modules</div>
                  </td>
                  {/* THU: Felipe Rotation 3hr block */}
                  <td rowSpan={3} className="p-3 text-center border border-gray-200 align-top bg-sky-50">
                    <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Felipe Call Training</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00am – 12:00pm · 3hr rotation</div>
                    <div className="mt-2 text-[10px] text-left space-y-1.5 px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">9:00</span> – Cindy w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">9:30</span> – Krishna w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">10:00</span> – Becks w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">10:30</span> – Connie w/ Felipe</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 italic border-t border-sky-200 pt-1.5">30min 1-on-1 → 1hr solo calls</div>
                    <div className="text-[10px] text-gray-500 italic">Others on Training Modules</div>
                  </td>
                  {/* FRI: Felipe Rotation 3hr block */}
                  <td rowSpan={3} className="p-3 text-center border border-gray-200 align-top bg-sky-50">
                    <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Felipe Call Training</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00am – 12:00pm · 3hr rotation</div>
                    <div className="mt-2 text-[10px] text-left space-y-1.5 px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">9:00</span> – Cindy w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">9:30</span> – Krishna w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">10:00</span> – Becks w/ Felipe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                        <span className="text-gray-700"><span className="font-semibold">10:30</span> – Connie w/ Felipe</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 italic border-t border-sky-200 pt-1.5">30min 1-on-1 → 1hr solo calls</div>
                    <div className="text-[10px] text-gray-500 italic">Others on Training Modules</div>
                  </td>
                  {/* SAT */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── 10:00–11:00 ── */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:00–11:00am</td>
                  {/* MON: Reviewing Training Modules 2hr block */}
                  <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-purple-50">
                    <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Reviewing Training Modules</div>
                    <div className="text-[10px] text-gray-500 mt-1.5 italic">Becks arrives ~10:30am</div>
                    <div className="text-[10px] text-gray-600 mt-1.5 text-left pl-2 space-y-0.5">
                      <div>1. Company &amp; Culture</div>
                      <div>2. Marketing Sweet Products</div>
                      <div>3. Quodo Products</div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1.5">Corie, Trent, Elly</div>
                  </td>
                  {/* TUE-FRI covered by Felipe rowSpan */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── 11:00–12:00 ── */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:00–12:00pm</td>
                  {/* MON covered by Reviewing Modules rowSpan */}
                  {/* TUE-FRI covered by Felipe rowSpan */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── 12:00–1:00 LUNCH ── */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-yellow-50 text-xs whitespace-nowrap">12:00–1:00pm</td>
                  {/* MON */}
                  <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-green-50">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1.5 text-xs font-semibold">🍽️ Lunch + Check-in</div>
                    <div className="text-[10px] text-gray-500 mt-1.5">1:00–2:30pm</div>
                    <div className="text-[10px] text-gray-500">Accommodation check-in</div>
                    <div className="text-[10px] text-gray-500">w/ Cindy &amp; Becks</div>
                  </td>
                  {/* TUE */}
                  <td className="p-3 text-center border border-gray-200 bg-yellow-50">
                    <span className="text-yellow-700 font-medium">🍽️ Lunch</span>
                  </td>
                  {/* WED */}
                  <td className="p-3 text-center border border-gray-200 bg-yellow-50">
                    <span className="text-yellow-700 font-medium">🍽️ Lunch</span>
                  </td>
                  {/* THU */}
                  <td className="p-3 text-center border border-gray-200 bg-yellow-50">
                    <span className="text-yellow-700 font-medium">🍽️ Lunch</span>
                  </td>
                  {/* FRI */}
                  <td className="p-3 text-center border border-gray-200 bg-yellow-50">
                    <span className="text-yellow-700 font-medium">🍽️ Lunch</span>
                  </td>
                  {/* SAT */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── 1:00–2:00 ── */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:00–2:00pm</td>
                  {/* MON covered by Lunch+Checkin rowSpan */}
                  {/* TUE: Content Training 2hr block — Quodo */}
                  <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-purple-50">
                    <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Quodo Production Process</div>
                    <div className="text-[10px] text-gray-500 mt-1.5">1:00–3:00pm · 2hrs</div>
                    <div className="text-[10px] text-gray-600 mt-1">All group · Understanding depth</div>
                    <div className="text-[10px] text-gray-600">&amp; quality of product delivery</div>
                  </td>
                  {/* WED: Content Training 2hr block — Customer Service */}
                  <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-teal-50">
                    <div className="bg-teal-100 text-teal-700 rounded px-2 py-1.5 text-xs font-semibold">Customer Service Training</div>
                    <div className="text-[10px] text-gray-500 mt-1.5">1:00–3:00pm · 2hrs</div>
                    <div className="text-[10px] text-gray-600 mt-1">All group · Building faith in</div>
                    <div className="text-[10px] text-gray-600">client relationship management</div>
                  </td>
                  {/* THU: Content Training 2hr block — Objection Handling */}
                  <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-700 rounded px-2 py-1.5 text-xs font-semibold">Objection Handling</div>
                    <div className="text-[10px] text-gray-500 mt-1.5">1:00–3:00pm · 2hrs</div>
                    <div className="text-[10px] text-gray-600 mt-1">All group · Softwares,</div>
                    <div className="text-[10px] text-gray-600">Semrush, etc</div>
                  </td>
                  {/* FRI: Content Training 2hr block — Review / Wrap-up */}
                  <td rowSpan={2} className="p-3 text-center border border-gray-200 align-middle bg-rose-50">
                    <div className="bg-rose-100 text-rose-700 rounded px-2 py-1.5 text-xs font-semibold">Review &amp; Wrap-up</div>
                    <div className="text-[10px] text-gray-500 mt-1.5">1:00–3:00pm · 2hrs</div>
                    <div className="text-[10px] text-gray-600 mt-1">All group · Consolidation</div>
                    <div className="text-[10px] text-gray-600">&amp; final Q&amp;A</div>
                  </td>
                  {/* SAT */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── 2:00–3:00 ── */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:00–3:00pm</td>
                  {/* MON */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  {/* TUE-FRI covered by Content Training rowSpan */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── 3:00–4:00 ── */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:00–4:00pm</td>
                  {/* MON */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  {/* TUE */}
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold mb-1">🤝 Meeting w/ Lucas</div>
                    <div className="text-[10px] text-gray-600">Cindy &amp; Krishna</div>
                    <div className="mt-1.5 bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-xs font-semibold mb-1">🎭 Role Play</div>
                    <div className="text-[10px] text-gray-600">Becks &amp; Connie</div>
                  </td>
                  {/* WED */}
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold mb-1">🤝 Meeting w/ Lucas</div>
                    <div className="text-[10px] text-gray-600">Cindy &amp; Becks</div>
                    <div className="mt-1.5 bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-xs font-semibold mb-1">🎭 Role Play</div>
                    <div className="text-[10px] text-gray-600">Krishna &amp; Connie</div>
                  </td>
                  {/* THU */}
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold mb-1">🤝 Meeting w/ Lucas</div>
                    <div className="text-[10px] text-gray-600">Cindy &amp; Connie</div>
                    <div className="mt-1.5 bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-xs font-semibold mb-1">🎭 Role Play</div>
                    <div className="text-[10px] text-gray-600">Krishna &amp; Becks</div>
                  </td>
                  {/* FRI */}
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold mb-1">🤝 Meeting w/ Lucas</div>
                    <div className="text-[10px] text-gray-600">Krishna &amp; Connie</div>
                    <div className="mt-1.5 bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-xs font-semibold mb-1">🎭 Role Play</div>
                    <div className="text-[10px] text-gray-600">Cindy &amp; Becks</div>
                  </td>
                  {/* SAT */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── 4:00–5:00 ── */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:00–5:00pm</td>
                  {/* MON */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  {/* TUE */}
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-xs font-semibold mb-1">🎭 Role Play</div>
                    <div className="text-[10px] text-gray-600">Cindy &amp; Krishna</div>
                    <div className="mt-1.5 bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold mb-1">🤝 Meeting w/ Lucas</div>
                    <div className="text-[10px] text-gray-600">Becks &amp; Connie</div>
                  </td>
                  {/* WED */}
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-xs font-semibold mb-1">🎭 Role Play</div>
                    <div className="text-[10px] text-gray-600">Cindy &amp; Becks</div>
                    <div className="mt-1.5 bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold mb-1">🤝 Meeting w/ Lucas</div>
                    <div className="text-[10px] text-gray-600">Krishna &amp; Connie</div>
                  </td>
                  {/* THU */}
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-xs font-semibold mb-1">🎭 Role Play</div>
                    <div className="text-[10px] text-gray-600">Cindy &amp; Connie</div>
                    <div className="mt-1.5 bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold mb-1">🤝 Meeting w/ Lucas</div>
                    <div className="text-[10px] text-gray-600">Krishna &amp; Becks</div>
                  </td>
                  {/* FRI */}
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-xs font-semibold mb-1">🎭 Role Play</div>
                    <div className="text-[10px] text-gray-600">Krishna &amp; Connie</div>
                    <div className="mt-1.5 bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold mb-1">🤝 Meeting w/ Lucas</div>
                    <div className="text-[10px] text-gray-600">Cindy &amp; Becks</div>
                  </td>
                  {/* SAT */}
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── Departures ── */}
                <tr className="bg-blue-50">
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 text-xs whitespace-nowrap">✈️ Departures</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="font-semibold text-blue-700">Becks</div>
                    <div className="text-gray-500">Adelaide → Brisbane</div>
                    <div className="text-gray-500">JQ801 · Departs 10:55am</div>
                    <div className="mt-1.5 font-semibold text-blue-700">Cindy</div>
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
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ── Deliverables ── */}
                <tr className="bg-pink-50">
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 text-xs whitespace-nowrap">📋 Deliverables</td>
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="text-[#E6017D] font-medium">Complete Module 1</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="text-[#E6017D] font-medium">Pass Module 1 Exam</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="text-[#E6017D] font-medium">Complete Module 2</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="text-[#E6017D] font-medium">Complete Module 3</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-xs">
                    <div className="text-[#E6017D] font-medium">All Exams Passed</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-sky-100 border border-sky-200"></span>
              <span className="text-gray-600">Felipe Call Training</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></span>
              <span className="text-gray-600">Content Training</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-teal-100 border border-teal-200"></span>
              <span className="text-gray-600">Customer Service</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></span>
              <span className="text-gray-600">Objection Handling</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-indigo-100 border border-indigo-200"></span>
              <span className="text-gray-600">Role Play</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-green-100 border border-green-200"></span>
              <span className="text-gray-600">Meeting w/ Lucas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></span>
              <span className="text-gray-600">Lunch</span>
            </div>
          </div>

          {/* Pair Rotation Key */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 mb-2">PAIR ROTATION (3:00–5:00pm)</p>
            <div className="grid grid-cols-4 gap-3 text-[10px]">
              <div className="bg-gray-50 rounded p-2">
                <div className="font-semibold text-gray-700 mb-1">Tuesday</div>
                <div className="text-gray-500">Pair A: Cindy &amp; Krishna</div>
                <div className="text-gray-500">Pair B: Becks &amp; Connie</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="font-semibold text-gray-700 mb-1">Wednesday</div>
                <div className="text-gray-500">Pair A: Cindy &amp; Becks</div>
                <div className="text-gray-500">Pair B: Krishna &amp; Connie</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="font-semibold text-gray-700 mb-1">Thursday</div>
                <div className="text-gray-500">Pair A: Cindy &amp; Connie</div>
                <div className="text-gray-500">Pair B: Krishna &amp; Becks</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="font-semibold text-gray-700 mb-1">Friday</div>
                <div className="text-gray-500">Pair A: Krishna &amp; Connie</div>
                <div className="text-gray-500">Pair B: Cindy &amp; Becks</div>
              </div>
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

export default function SchedulePage() {
  return (
    <PasswordGate requireMaster>
      <SchedulePageContent />
    </PasswordGate>
  );
}
