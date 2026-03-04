// app/schedule/senior-team/page.tsx

"use client";

import Link from "next/link";
import { usePersistedState } from "@/hooks/usePersistedState";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const MEETINGS_PER_DAY = 5;

export default function SeniorTeamSchedulePage() {
  const [attendanceRate] = usePersistedState("proj-attendanceRate", 0.35);
  const [closeRate] = usePersistedState("proj-closeRate", 0.55);
  const [dealValue] = usePersistedState("proj-dealValue", 400);

  const dailyMeetings = MEETINGS_PER_DAY;
  const dailyDeals = Math.round(dailyMeetings * closeRate * 100) / 100;
  const dailyRevenue = Math.round(dailyDeals * dealValue);
  const weeklyMeetings = dailyMeetings * 5;
  const weeklyDeals = Math.round(weeklyMeetings * closeRate * 100) / 100;
  const weeklyRevenue = Math.round(weeklyDeals * dealValue);

  const fmt = (v: number) => (v % 1 !== 0 ? v.toFixed(1) : v.toString());

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors" title="Back to Home">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Senior Sales Team — Daily Schedule</h1>
                <p className="text-sm text-slate-400">Lucas Tirri · Felipe Garcia · Dylan Munro</p>
              </div>
            </div>
            <span className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-full">
              5 Meetings / Day
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-8">
        {/* Daily Targets Banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎯</span>
            <h2 className="text-sm font-bold uppercase tracking-wide">Daily Targets</h2>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{dailyMeetings}</div>
              <div className="text-[10px] text-slate-400 uppercase">Meetings</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{fmt(dailyDeals)}</div>
              <div className="text-[10px] text-slate-400 uppercase">Deals</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${dailyRevenue.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 uppercase">Revenue</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{weeklyDeals}</div>
              <div className="text-[10px] text-slate-400 uppercase">Wk Deals</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${weeklyRevenue.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 uppercase">Wk Revenue</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {dailyMeetings} meetings/day · {Math.round(closeRate * 100)}% close rate · ${dealValue}/deal
          </p>
        </div>

        <div className="flex gap-6">
          {/* Schedule Table */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-2 text-left font-semibold w-28 border border-slate-700 text-xs">Time</th>
                    {DAYS.map((day) => (
                      <th key={day} className="p-2 text-center font-semibold border border-slate-700">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>

                  {/* 8:30–9:00 — Deal Admin */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">8:30am</td>
                    {DAYS.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-slate-50">
                        <div className="bg-slate-200 text-slate-700 rounded px-2 py-1.5 text-xs font-semibold">📋 Deal Admin</div>
                        <div className="text-[10px] text-gray-500 mt-1">8:30–9:00am · 30min</div>
                      </td>
                    ))}
                  </tr>

                  {/* 9:00–9:30 — Briefing */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:00am</td>
                    {DAYS.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-violet-50">
                        <div className="bg-violet-100 text-violet-700 rounded px-2 py-1.5 text-xs font-semibold">☕ Buddy Briefing</div>
                        <div className="text-[10px] text-gray-500 mt-1">9:00–9:30am · 30min</div>
                        <div className="text-[10px] text-violet-600 font-medium mt-1">Yesterday&apos;s outcomes · Today&apos;s focus · Deals to close</div>
                      </td>
                    ))}
                  </tr>

                  {/* 9:30–10:30 — Meeting 1 */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:30am</td>
                    {DAYS.map((day) => (
                      <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                        <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-2 text-xs font-semibold">🤝 Meeting 1</div>
                        <div className="text-[10px] text-gray-500 mt-1">9:30–10:30am · 1hr</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:00am</td></tr>

                  {/* 10:30–11:30 — Meeting 2 */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:30am</td>
                    {DAYS.map((day) => (
                      <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                        <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-2 text-xs font-semibold">🤝 Meeting 2</div>
                        <div className="text-[10px] text-gray-500 mt-1">10:30–11:30am · 1hr</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:00am</td></tr>

                  {/* 11:30–12:30 — Meeting 3 */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:30am</td>
                    {DAYS.map((day) => (
                      <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                        <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-2 text-xs font-semibold">🤝 Meeting 3</div>
                        <div className="text-[10px] text-gray-500 mt-1">11:30am–12:30pm · 1hr</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:00pm</td></tr>

                  {/* 12:30–1:00 — Validation Calls */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:30pm</td>
                    {DAYS.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                        <div className="bg-amber-100 text-amber-700 rounded px-2 py-1.5 text-xs font-semibold">🔍 Validation Calls</div>
                        <div className="text-[10px] text-gray-500 mt-1">12:30–1:00pm · 30min</div>
                        <div className="text-[10px] text-amber-600 font-medium mt-1">Validate previous day&apos;s bookings</div>
                      </td>
                    ))}
                  </tr>

                  {/* 1:00–1:30 — Break */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:00pm</td>
                    {DAYS.map((day) => (
                      <td key={day} className="p-2 border border-gray-200 bg-gray-50/50 text-center">
                        <div className="text-[10px] text-gray-400">Break · 30min</div>
                      </td>
                    ))}
                  </tr>

                  {/* 1:30–2:00 — Confirm Tomorrow Appts */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:30pm</td>
                    {DAYS.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                        <div className="bg-sky-100 text-sky-700 rounded px-2 py-1.5 text-xs font-semibold">📞 Confirm Tomorrow Appts</div>
                        <div className="text-[10px] text-gray-500 mt-1">1:30–2:00pm · 30min</div>
                        <div className="text-[10px] text-sky-600 font-medium mt-1">Call or text depending on validation status</div>
                      </td>
                    ))}
                  </tr>

                  {/* 2:00–3:00 — Meeting 4 */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:00pm</td>
                    {DAYS.map((day) => (
                      <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                        <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-2 text-xs font-semibold">🤝 Meeting 4</div>
                        <div className="text-[10px] text-gray-500 mt-1">2:00–3:00pm · 1hr</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:30pm</td></tr>

                  {/* 3:00–4:00 — Deal Calls */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:00pm</td>
                    {DAYS.map((day) => (
                      <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-pink-50">
                        <div className="bg-pink-100 text-pink-700 rounded px-2 py-2 text-xs font-semibold">💰 Deal Calls</div>
                        <div className="text-[10px] text-gray-500 mt-1">3:00–4:00pm · 1hr</div>
                        <div className="text-[10px] text-pink-600 font-medium mt-1">Load &amp; close — follow up warm leads</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:30pm</td></tr>

                  {/* 4:00–5:00 — Meeting 5 */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:00pm</td>
                    {DAYS.map((day) => (
                      <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                        <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-2 text-xs font-semibold">🤝 Meeting 5</div>
                        <div className="text-[10px] text-gray-500 mt-1">4:00–5:00pm · 1hr</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:30pm</td></tr>

                  {/* 5:00–5:30 — Deal Admin */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">5:00pm</td>
                    {DAYS.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-slate-50">
                        <div className="bg-slate-200 text-slate-700 rounded px-2 py-1.5 text-xs font-semibold">📋 Deal Admin</div>
                        <div className="text-[10px] text-gray-500 mt-1">5:00–5:30pm · 30min</div>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-slate-200 border border-slate-300"></span><span className="text-gray-600">Deal Admin</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-violet-100 border border-violet-200"></span><span className="text-gray-600">Briefing</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200"></span><span className="text-gray-600">Meetings</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></span><span className="text-gray-600">Validation</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-sky-100 border border-sky-200"></span><span className="text-gray-600">Confirm Appts</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-pink-100 border border-pink-200"></span><span className="text-gray-600">Deal Calls</span></div>
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
                    <th className="pb-2 text-center font-semibold text-gray-500">Time</th>
                    <th className="pb-2 text-right font-semibold text-gray-500">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-slate-50/50">
                    <td className="py-2 text-slate-700 font-medium">📋 Deal Admin</td>
                    <td className="py-2 text-center text-gray-600">8:30–9:00</td>
                    <td className="py-2 text-right text-slate-700 font-semibold">30min</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-violet-50/50">
                    <td className="py-2 text-violet-700 font-medium">☕ Buddy Briefing</td>
                    <td className="py-2 text-center text-gray-600">9:00–9:30</td>
                    <td className="py-2 text-right text-violet-700 font-semibold">30min</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-emerald-50/50">
                    <td className="py-2 text-emerald-700 font-medium">🤝 Meeting 1</td>
                    <td className="py-2 text-center text-gray-600">9:30–10:30</td>
                    <td className="py-2 text-right text-emerald-700 font-semibold">1hr</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-emerald-50/50">
                    <td className="py-2 text-emerald-700 font-medium">🤝 Meeting 2</td>
                    <td className="py-2 text-center text-gray-600">10:30–11:30</td>
                    <td className="py-2 text-right text-emerald-700 font-semibold">1hr</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-emerald-50/50">
                    <td className="py-2 text-emerald-700 font-medium">🤝 Meeting 3</td>
                    <td className="py-2 text-center text-gray-600">11:30–12:30</td>
                    <td className="py-2 text-right text-emerald-700 font-semibold">1hr</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-amber-50/50">
                    <td className="py-2 text-amber-700 font-medium">🔍 Validation Calls</td>
                    <td className="py-2 text-center text-gray-600">12:30–1:00</td>
                    <td className="py-2 text-right text-amber-700 font-semibold">30min</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-400 font-medium">Break</td>
                    <td className="py-2 text-center text-gray-400">1:00–1:30</td>
                    <td className="py-2 text-right text-gray-400">30min</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-sky-50/50">
                    <td className="py-2 text-sky-700 font-medium">📞 Confirm Appts</td>
                    <td className="py-2 text-center text-gray-600">1:30–2:00</td>
                    <td className="py-2 text-right text-sky-700 font-semibold">30min</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-emerald-50/50">
                    <td className="py-2 text-emerald-700 font-medium">🤝 Meeting 4</td>
                    <td className="py-2 text-center text-gray-600">2:00–3:00</td>
                    <td className="py-2 text-right text-emerald-700 font-semibold">1hr</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-pink-50/50">
                    <td className="py-2 text-pink-700 font-medium">💰 Deal Calls</td>
                    <td className="py-2 text-center text-gray-600">3:00–4:00</td>
                    <td className="py-2 text-right text-pink-700 font-semibold">1hr</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-emerald-50/50">
                    <td className="py-2 text-emerald-700 font-medium">🤝 Meeting 5</td>
                    <td className="py-2 text-center text-gray-600">4:00–5:00</td>
                    <td className="py-2 text-right text-emerald-700 font-semibold">1hr</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-slate-50/50">
                    <td className="py-2 text-slate-700 font-medium">📋 Deal Admin</td>
                    <td className="py-2 text-center text-gray-600">5:00–5:30</td>
                    <td className="py-2 text-right text-slate-700 font-semibold">30min</td>
                  </tr>
                  <tr className="border-t-2 border-gray-200">
                    <td className="py-2 text-gray-900 font-bold">Daily Total</td>
                    <td className="py-2 text-center text-gray-600 font-semibold">8:30–5:30</td>
                    <td className="py-2 text-right text-gray-900 font-bold">5 meetings</td>
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
                  <p className="text-xs text-gray-700 leading-relaxed"><strong>Briefing (9am)</strong> — review yesterday&apos;s results with your buddy, set today&apos;s focus, prep for meetings</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed"><strong>Validation calls (12:30pm)</strong> — call yesterday&apos;s bookings to confirm they&apos;re real and qualified</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed"><strong>Confirm tomorrow appts (1:30pm)</strong> — call or text tomorrow&apos;s meetings to confirm attendance</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed"><strong>Deal calls (3–4pm)</strong> — follow up warm prospects, load pipeline, close pending deals</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed">Revenue split 50/50 with buddy during buddy weeks — junior&apos;s half goes towards their monthly target</p>
                </div>
              </div>
            </div>

            {/* Conversion Rates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">📐</span>
                Conversion Rates
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-emerald-50 rounded">
                  <span className="text-emerald-700 font-medium">5 meetings/day</span>
                  <span className="text-emerald-900 font-bold">= 25 meetings/week</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">Close rate</span>
                  <span className="text-gray-900 font-bold">{Math.round(closeRate * 100)}%</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">{dailyMeetings} meetings</span>
                  <span className="text-gray-900 font-bold">= {fmt(dailyDeals)} deals/day</span>
                </div>
                <div className="flex justify-between p-2 bg-pink-50 rounded">
                  <span className="text-pink-700 font-medium">{fmt(dailyDeals)} deals</span>
                  <span className="text-pink-900 font-bold">= ${dailyRevenue.toLocaleString()}/day</span>
                </div>
                <div className="flex justify-between p-2 bg-pink-50 rounded">
                  <span className="text-pink-700 font-medium">{fmt(weeklyDeals)} deals/week</span>
                  <span className="text-pink-900 font-bold">= ${weeklyRevenue.toLocaleString()}/week</span>
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
                <Link href="/scorecard/lucas-tirri" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-pink-700 transition-colors">Lucas Scorecard</div>
                    <div className="text-[10px] text-gray-500">Track daily numbers</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/scorecard/felipe-garcia" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-pink-700 transition-colors">Felipe Scorecard</div>
                    <div className="text-[10px] text-gray-500">Track daily numbers</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/scorecard/dylan-munro" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-pink-700 transition-colors">Dylan Scorecard</div>
                    <div className="text-[10px] text-gray-500">Track daily numbers</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/projections" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">Projections</div>
                    <div className="text-[10px] text-gray-500">Adjust rates &amp; targets</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Checklist */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-amber-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-lg">⚡</span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Your Buddy Is Your Priority</h2>
              <p className="text-[10px] text-gray-500">If a meeting drops out, follow this checklist in order</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Check in with your buddy</p>
                <p className="text-xs text-gray-600 mt-0.5">Are they ahead or behind on bookings? If behind, this is your opportunity to pitch in and help them hit their targets.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Pull a task forward</p>
                <p className="text-xs text-gray-600 mt-0.5">Condense a later task into the free slot — validation calls, confirm tomorrow&apos;s appts, or deal calls. This frees up time later in the day to jump on booking calls if your buddy needs support.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Need to do something outside this schedule?</p>
                <p className="text-xs text-gray-600 mt-0.5">Call Elly for approval first. No exceptions.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-800 rounded-lg text-center">
            <p className="text-xs text-white font-semibold">Your buddy&apos;s success is your success. If they need bookings, that&apos;s your #1 job.</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
