// app/schedule/cindy/week-1/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function CindyWeek1Content() {
  const days = ["Mon 23 Feb", "Tue 24 Feb", "Wed 25 Feb", "Thu 26 Feb", "Fri 27 Feb"];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/schedule/cindy" className="text-slate-400 hover:text-white transition-colors" title="Back to Schedule">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Cindy Manrique + Lucas Tirri</h1>
                <p className="text-sm text-slate-400">Week 1 — First Week Out · Mon 23 Feb – Fri 27 Feb 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-600/30 text-blue-300 text-xs font-semibold rounded-full">
                🕐 NSW Time (AEDT)
              </span>
              <div className="flex items-center gap-2">

                <span className="px-3 py-1.5 bg-slate-800 text-slate-600 text-xs font-semibold rounded-lg cursor-not-allowed">

                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>

                </span>

                <span className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-full">

                  Week 1 — Buddy Observe

                </span>

                <Link href={`/schedule/cindy/week-2`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition-colors">

                  Week 2

                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>

                </Link>

              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-8">
        {/* Week 1 Targets Banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎯</span>
            <h2 className="text-sm font-bold uppercase tracking-wide">Week 1 — Team Daily Targets</h2>
          <p className="text-xs text-slate-300 mt-1">As a team, your daily targets are to hit at least:</p>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">72</div>
              <div className="text-[10px] text-slate-400 uppercase">Calls</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">40</div>
              <div className="text-[10px] text-slate-400 uppercase">Connects</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">7</div>
              <div className="text-[10px] text-slate-400 uppercase">Bookings</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-[10px] text-slate-400 uppercase">Attended</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">1.5</div>
              <div className="text-[10px] text-slate-400 uppercase">Deals</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">$600</div>
              <div className="text-[10px] text-slate-400 uppercase">Revenue</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Revenue based on $400 avg deal value · 50\/50 buddy split applies in Week 1</p>
        </div>

        {/* Timezone note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
          <strong>🕐 NSW Time:</strong> All times shown are AEDT (Sydney). Your 1:00pm Zoom Checkpoint = 12:30pm ACDT (Adelaide).
        </div>

        <div className="flex gap-6">
          {/* Schedule Table */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-2 text-left font-semibold w-24 border border-slate-700 text-xs">Time (AEDT)</th>
                    {days.map((day) => (
                      <th key={day} className="p-2 text-center font-semibold border border-slate-700">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* ═══ 9:30–1:00 — Call Block 1 ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:30am</td>
                    {days.map((day) => (
                      <td key={day} rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                        <div className="bg-sky-100 text-sky-700 rounded px-2 py-2 text-xs font-semibold">📞 Call Block 1</div>
                        <div className="text-[10px] text-gray-500 mt-1">9:30am–1:00pm · 3.5hrs</div>
                        <div className="text-[10px] text-sky-600 font-semibold mt-1">Target: 3–4 bookings</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:00am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:30am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:00am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:30am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:00pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:30pm</td></tr>

                  {/* ═══ 1:00–1:30 — Zoom Checkpoint ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:00pm</td>
                    {days.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-indigo-50">
                        <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1.5 text-xs font-semibold">🗣️ Zoom Checkpoint</div>
                        <div className="text-[10px] text-gray-500 mt-1">1:00–1:30pm · 30min</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">= 12:30pm Adelaide time</div>
                      </td>
                    ))}
                  </tr>

                  {/* ═══ 1:30–2:00 — Blank ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:30pm</td>
                    {days.map((day) => (
                      <td key={day} className="p-2 border border-gray-200 bg-gray-50/50"></td>
                    ))}
                  </tr>

                  {/* ═══ 2:00–5:00 — Call Block 2 ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:00pm</td>
                    {days.map((day) => (
                      <td key={day} rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                        <div className="bg-sky-100 text-sky-700 rounded px-2 py-2 text-xs font-semibold">📞 Call Block 2</div>
                        <div className="text-[10px] text-gray-500 mt-1">2:00–5:30pm · 3.5hrs</div>
                        <div className="text-[10px] text-sky-600 font-semibold mt-1">Target: 3–4 bookings</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:30pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:00pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:30pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:00pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:30pm</td></tr>

                  {/* ═══ 5:00–5:30 — Call Block 2 continued ═══ */}
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">5:00pm</td></tr>

                  {/* ═══ 5:30–6:00 — Zoom Checkpoint ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">5:30pm</td>
                    {days.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-indigo-50">
                        <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1.5 text-xs font-semibold">🗣️ Zoom Checkpoint</div>
                        <div className="text-[10px] text-gray-500 mt-1">5:30–6:00pm · 30min</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">= 5:00pm Adelaide time</div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-sky-100 border border-sky-200"></span><span className="text-gray-600">Calls</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-indigo-100 border border-indigo-200"></span><span className="text-gray-600">Zoom Checkpoint</span></div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[420px] flex-shrink-0 space-y-6">
            {/* Daily Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-xs">⏱️</span>
                Daily Breakdown
              </h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="pb-2 text-left font-semibold text-gray-500">Block</th>
                    <th className="pb-2 text-center font-semibold text-gray-500">Time (AEDT)</th>
                    <th className="pb-2 text-right font-semibold text-gray-500">Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-sky-50/50">
                    <td className="py-2 text-sky-700 font-medium">📞 Call Block 1</td>
                    <td className="py-2 text-center text-gray-600">9:30–1:00</td>
                    <td className="py-2 text-right text-sky-700 font-semibold">3–4 bookings</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-indigo-700 font-medium">🗣️ Zoom Checkpoint</td>
                    <td className="py-2 text-center text-gray-600">1:00–1:30</td>
                    <td className="py-2 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-400 font-medium"></td>
                    <td className="py-2 text-center text-gray-400">1:30–2:00</td>
                    <td className="py-2 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-sky-50/50">
                    <td className="py-2 text-sky-700 font-medium">📞 Call Block 2</td>
                    <td className="py-2 text-center text-gray-600">2:00–5:30</td>
                    <td className="py-2 text-right text-sky-700 font-semibold">3–4 bookings</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-indigo-700 font-medium">🗣️ Zoom Checkpoint</td>
                    <td className="py-2 text-center text-gray-600">5:30–6:00</td>
                    <td className="py-2 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="border-t-2 border-gray-200">
                    <td className="py-2 text-gray-900 font-bold">Daily Total</td>
                    <td className="py-2 text-center text-gray-600 font-semibold">7hrs calls</td>
                    <td className="py-2 text-right text-gray-900 font-bold">6–7 bookings</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Key Reminders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">💡</span>
                Key Reminders
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed">This week is about <strong>building pipeline</strong> — not closing deals</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed">You&apos;re booking meetings for your buddy — observe how they run them</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed"><strong>1:00pm Zoom Checkpoint</strong> — midday check-in (= 12:30pm Adelaide)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed"><strong>5:30pm Zoom Checkpoint</strong> — end-of-day wrap-up (= 5:00pm Adelaide)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed">18 calls per hour = 10 connects ≈ 1.75 bookings (18% booking rate)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed">Revenue split 50/50 with buddy — 50% put towards your monthly target</p>
                </div>
              </div>
            </div>

            {/* Rules of Thumb */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">📐</span>
                Rules of Thumb
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-indigo-50 rounded">
                  <span className="text-indigo-700 font-medium">18 calls per hour</span>
                  <span className="text-indigo-900 font-bold">= 10 connects</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">10 connects</span>
                  <span className="text-gray-900 font-bold">= ≈ 1.75 bookings (18%)</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">7 bookings</span>
                  <span className="text-gray-900 font-bold">= ≈ 3 attended (43%)</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">2 attended</span>
                  <span className="text-gray-900 font-bold">= 1.5 deals (50%)</span>
                </div>
                <div className="flex justify-between p-2 bg-emerald-50 rounded">
                  <span className="text-emerald-700 font-medium">1.5 deals</span>
                  <span className="text-emerald-900 font-bold">= $400 revenue</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">🔗</span>
                Quick Links
              </h2>
              <div className="space-y-2">
                <Link href="/scorecard/cindy-rose-rondez-manrique" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-pink-700 transition-colors">Activity Scorecard</div>
                    <div className="text-[10px] text-gray-500">Track your daily numbers</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/roadmap" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">View Standards</div>
                    <div className="text-[10px] text-gray-500">Roadmap to 1.5 deals per day</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/schedule/cindy" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">← Back to Schedule</Link>
        </div>
      </div>
    </main>
  );
}

export default function CindyWeek1Page() {
  return (
    <PasswordGate traineeSlug="cindy-rose-rondez-manrique">
      <CindyWeek1Content />
    </PasswordGate>
  );
}
