// app/schedule/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function SchedulePageContent() {
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors" title="Back to Portal">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Master Training Schedule</h1>
                <p className="text-sm text-slate-400">All Trainees · Mon 16 Feb – Fri 20 Feb 2026</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs font-semibold rounded-full">
              Week 0 — Training
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">

        {/* Individual Schedule Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Cindy", slug: "cindy", from: "Sydney" },
            { name: "Becks", slug: "becks", from: "Brisbane" },
            { name: "Krishna", slug: "krishna", from: "Local" },
            { name: "Connie", slug: "connie", from: "Local" },
          ].map((t) => (
            <Link key={t.slug} href={`/schedule/${t.slug}`} className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-sm transition-all text-center group">
              <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">{t.name}</div>
              <div className="text-[10px] text-gray-500">{t.from === "Local" ? "Local" : `✈️ ${t.from}`} · <span className="text-blue-500">View schedule →</span></div>
            </Link>
          ))}
        </div>

        {/* Master Schedule Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
          <div className="min-w-[900px]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="p-2 text-left font-semibold w-24 border border-slate-700 text-xs">Time</th>
                  <th className="p-2 text-center font-semibold border border-slate-700">Mon 16 Feb</th>
                  <th className="p-2 text-center font-semibold border border-slate-700">Tue 17 Feb</th>
                  <th className="p-2 text-center font-semibold border border-slate-700">Wed 18 Feb</th>
                  <th className="p-2 text-center font-semibold border border-slate-700">Thu 19 Feb</th>
                  <th className="p-2 text-center font-semibold border border-slate-700">Fri 20 Feb</th>
                </tr>
              </thead>
              <tbody>

                {/* ── Arrivals ── */}
                <tr className="bg-blue-50">
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 text-xs whitespace-nowrap">✈️ Arrivals</td>
                  <td className="p-2 text-center border border-gray-200 text-xs">
                    <div className="space-y-1.5">
                      <div>
                        <span className="font-semibold text-blue-700">Cindy</span>
                        <div className="text-gray-500">Sydney → Adelaide</div>
                        <div className="text-gray-500">Departs 6:40am · Lands 8:15am</div>
                      </div>
                      <div className="border-t border-blue-100 pt-1.5">
                        <span className="font-semibold text-blue-700">Becks</span>
                        <div className="text-gray-500">Brisbane → Adelaide</div>
                        <div className="text-gray-500">Departs 6:35am · Lands 9:50am</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

                {/* ═══ 8:30 ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">8:30am</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-purple-50">
                    <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Complete Resource Modules</div>
                    <div className="text-[10px] text-gray-500 mt-1">8:30–9:30am · 1hr</div>
                  </td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-purple-50">
                    <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Complete Resource Modules</div>
                    <div className="text-[10px] text-gray-500 mt-1">8:30–9:30am · 1hr</div>
                  </td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-purple-50">
                    <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Complete Resource Modules</div>
                    <div className="text-[10px] text-gray-500 mt-1">8:30–9:30am · 1hr</div>
                  </td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-purple-50">
                    <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Complete Resource Modules</div>
                    <div className="text-[10px] text-gray-500 mt-1">8:30–9:30am · 1hr</div>
                  </td>
                </tr>

                {/* ═══ 9:00 ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:00am</td>
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-purple-50">
                    <div className="bg-purple-100 text-purple-700 rounded px-2 py-1.5 text-xs font-semibold">Welcome</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00am–12:30pm · 3.5hrs</div>
                    <div className="text-[10px] text-gray-500 mt-1">Cindy, Krishna, Connie from 9:00am</div>
                    <div className="text-[10px] text-gray-500">Becks joins from 10:00am</div>
                    <div className="text-[10px] text-gray-600 mt-2 text-left pl-3 space-y-1">
                      <div>• Tech Setup</div>
                      <div>• This Week&apos;s Schedule</div>
                      <div>• Competencies</div>
                      <div>• Standards</div>
                      <div>• Scorecards</div>
                    </div>
                  </td>
                </tr>

                {/* ═══ 9:30 ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:30am</td>
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                    <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:30–11:00am · 1.5hrs</div>
                  </td>
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                    <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:30–11:00am · 1.5hrs</div>
                  </td>
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                    <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:30–11:00am · 1.5hrs</div>
                  </td>
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                    <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:30–11:00am · 1.5hrs</div>
                  </td>
                </tr>

                {/* ═══ 10:00 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:00am</td></tr>
                {/* ═══ 10:30 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:30am</td></tr>

                {/* ═══ 11:00 ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:00am</td>
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-1">11:00am–12:30pm · 1.5hrs</div>
                  </td>
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-1">11:00am–12:30pm · 1.5hrs</div>
                  </td>
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-1">11:00am–12:30pm · 1.5hrs</div>
                  </td>
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-1">11:00am–12:30pm · 1.5hrs</div>
                  </td>
                </tr>

                {/* ═══ 11:30 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:30am</td></tr>
                {/* ═══ 12:00 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:00pm</td></tr>

                {/* ═══ 12:30 LUNCH ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:30pm</td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                </tr>
                {/* ═══ 1:00 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:00pm</td></tr>

                {/* ═══ 1:30 ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:30pm</td>
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                    <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-1.5 text-xs font-semibold">Process &amp; Technology</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:30–5:00pm · 3.5hrs</div>
                    <div className="text-[10px] text-gray-600 mt-2 text-left pl-3 space-y-1">
                      <div>• Booking Admin</div>
                      <div>• Deal Admin</div>
                      <div>• Semrush</div>
                      <div>• Slack</div>
                      <div>• Discord</div>
                      <div>• Google Calendars</div>
                      <div>• Zoom</div>
                      <div>• Wappalyzer</div>
                    </div>
                  </td>
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-teal-50">
                    <div className="bg-teal-100 text-teal-700 rounded px-2 py-1.5 text-xs font-semibold">Customer Service Team</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:30–2:30pm · 1hr</div>
                    <div className="text-[10px] text-gray-500">Training w/ Trent</div>
                  </td>
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-violet-50">
                    <div className="bg-violet-100 text-violet-700 rounded px-2 py-1.5 text-xs font-semibold">Quodo Production</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:30–5:00pm · 3.5hrs</div>
                    <div className="text-[10px] text-gray-500">Training w/ Taylor</div>
                  </td>
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-rose-50">
                    <div className="bg-rose-100 text-rose-700 rounded px-2 py-1.5 text-xs font-semibold">Objection Handling</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:30–5:00pm · 3.5hrs</div>
                  </td>
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-orange-50">
                    <div className="bg-orange-100 text-orange-700 rounded px-2 py-1.5 text-xs font-semibold">Role Playing</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:30–5:00pm · 3.5hrs</div>
                  </td>
                </tr>
                {/* ═══ 2:00 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:00pm</td></tr>

                {/* ═══ 2:30 ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:30pm</td>
                  <td rowSpan={5} className="p-2 text-center border border-gray-200 align-middle bg-violet-50">
                    <div className="bg-violet-100 text-violet-700 rounded px-2 py-1.5 text-xs font-semibold">Quodo Production</div>
                    <div className="text-[10px] text-gray-500 mt-1">2:30–5:00pm · 2.5hrs</div>
                    <div className="text-[10px] text-gray-500">Training w/ Taylor</div>
                  </td>
                </tr>

                {/* ═══ 3:00 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:00pm</td></tr>
                {/* ═══ 3:30 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:30pm</td></tr>
                {/* ═══ 4:00 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:00pm</td></tr>
                {/* ═══ 4:30 ═══ */}
                <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:30pm</td></tr>

                {/* ── Departures ── */}
                <tr className="bg-blue-50">
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 text-xs whitespace-nowrap">✈️ Departures</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-xs">
                    <div className="text-gray-500 italic mb-1.5">Saturday 21 Feb</div>
                    <div className="space-y-1.5">
                      <div>
                        <span className="font-semibold text-blue-700">Cindy</span>
                        <div className="text-gray-500">Adelaide → Sydney</div>
                        <div className="text-gray-500">Departs 12:35pm · Arrives 3:00pm</div>
                      </div>
                      <div className="border-t border-blue-100 pt-1.5">
                        <span className="font-semibold text-blue-700">Becks</span>
                        <div className="text-gray-500">Adelaide → Brisbane</div>
                        <div className="text-gray-500">Departs 10:55am · Arrives 12:55pm</div>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* ── Evening ── */}
                <tr className="bg-indigo-50">
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 text-xs whitespace-nowrap">🌙 Evening</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-2 text-center border border-gray-200 text-gray-400">—</td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></span><span className="text-gray-600">Training / Modules</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-sky-100 border border-sky-200"></span><span className="text-gray-600">Call for Call (C4C)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></span><span className="text-gray-600">Supervised Calls</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200"></span><span className="text-gray-600">Process &amp; Technology</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-teal-100 border border-teal-200"></span><span className="text-gray-600">Customer Service</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-violet-100 border border-violet-200"></span><span className="text-gray-600">Quodo Production</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-rose-100 border border-rose-200"></span><span className="text-gray-600">Objection Handling</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></span><span className="text-gray-600">Role Playing</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></span><span className="text-gray-600">Lunch</span></div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
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
