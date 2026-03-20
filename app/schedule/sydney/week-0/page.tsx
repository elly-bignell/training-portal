// app/schedule/sydney/week-0/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function SydneyWeek0Content() {
  const days = ["Mon 23 Mar", "Tue 24 Mar", "Wed 25 Mar", "Thu 26 Mar", "Fri 27 Mar"];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/schedule/sydney" className="text-slate-400 hover:text-white transition-colors" title="Back to Schedule">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Sydney Arnold</h1>
                <p className="text-sm text-slate-400">Week 0 — Training Week · Mon 23 Mar – Fri 27 Mar 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-slate-800 text-slate-600 text-xs font-semibold rounded-lg cursor-not-allowed">
                <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </span>
              <span className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-full">
                Training Week
              </span>
              <Link href="/schedule/sydney/week-1" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition-colors">
                Week 1
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-8">

        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎓</span>
            <h2 className="text-sm font-bold uppercase tracking-wide">Week 0 — Training Week</h2>
          </div>
          <p className="text-sm text-amber-100">Orientation, system setup, and your first live calls. Booking targets apply during C4C and Supervised Call blocks — your buddy is there to support you every step of the way.</p>
        </div>

        {/* Schedule + Competencies side-by-side */}
        <div className="flex gap-4 items-start">

        {/* Schedule Table */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
          <div className="min-w-[900px]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="p-2 text-left font-semibold w-28 border border-slate-700 text-xs">Time</th>
                  {days.map((day) => (
                    <th key={day} className="p-2 text-center font-semibold border border-slate-700 text-xs">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>

                {/* ═══ 8:30am — Debrief (Tue–Fri) ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">8:30am</td>
                  {/* Mon: empty */}
                  <td className="p-2 border border-gray-200 bg-gray-50/50"></td>
                  {/* Tue–Fri: Debrief */}
                  {["Tue","Wed","Thu","Fri"].map((d) => (
                    <td key={d} className="p-2 text-center border border-gray-200 align-middle bg-blue-50">
                      <div className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs font-semibold">Debrief</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">8:30–9:00am · 30min</div>
                    </td>
                  ))}
                </tr>

                {/* ═══ 9:00am ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:00am</td>
                  {/* Mon: Welcome — rowSpan 7 (9:00–12:30) */}
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-indigo-50">
                    <div className="bg-indigo-100 text-indigo-800 rounded px-2 py-2 text-xs font-semibold">🙌 Welcome</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00am–12:30pm · 3.5hrs</div>
                    <div className="mt-2 text-left space-y-1">
                      {["Management Team Introduction","Tech Setup","This Week's Schedule","Competencies","Standards","Scorecards"].map((item) => (
                        <div key={item} className="text-[10px] text-indigo-700 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0"></span>{item}
                        </div>
                      ))}
                    </div>
                  </td>
                  {/* Tue: Call for Call — rowSpan 4 (9:00–11:00) = 2hrs = 2 bookings */}
                  <td rowSpan={4} className="p-2 text-center border border-gray-200 align-middle bg-indigo-900/5">
                    <div className="bg-indigo-900 text-white rounded px-2 py-2 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00–11:00am · 2hrs</div>
                    <div className="text-[10px] text-indigo-300 font-semibold mt-1">Target: 2 bookings</div>
                  </td>
                  {/* Wed: Call for Call — rowSpan 7 (9:00–12:30) = 3.5hrs = 3 bookings */}
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-indigo-900/5">
                    <div className="bg-indigo-900 text-white rounded px-2 py-2 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00am–12:30pm · 3.5hrs</div>
                    <div className="text-[10px] text-indigo-300 font-semibold mt-1">Target: 3 bookings</div>
                  </td>
                  {/* Thu: Call for Call — rowSpan 4 (9:00–11:00) = 2hrs = 2 bookings */}
                  <td rowSpan={4} className="p-2 text-center border border-gray-200 align-middle bg-indigo-900/5">
                    <div className="bg-indigo-900 text-white rounded px-2 py-2 text-xs font-semibold">📞 Call for Call (C4C)</div>
                    <div className="text-[10px] text-gray-500 mt-1">9:00–11:00am · 2hrs</div>
                    <div className="text-[10px] text-indigo-300 font-semibold mt-1">Target: 2 bookings</div>
                  </td>
                  {/* Fri: Supervised Calls — rowSpan 2 (9:00–10:00) = 1hr = 1 booking */}
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-800 rounded px-2 py-1.5 text-xs font-semibold">📋 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">9:00–10:00am · 1hr</div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Target: 1 booking</div>
                  </td>
                </tr>

                {/* 9:30am */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:30am</td>
                </tr>

                {/* 10:00am — Fri: Find Your Harpoon starts */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:00am</td>
                  {/* Fri: Find Your Harpoon — rowSpan 2 (10:00–11:00) */}
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-pink-50">
                    <div className="bg-pink-100 text-pink-800 rounded px-2 py-1.5 text-xs font-semibold">🎯 Find Your Harpoon</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">10:00–11:00am · 1hr</div>
                    <div className="text-[10px] text-pink-600 mt-0.5">Training session</div>
                  </td>
                </tr>

                {/* 10:30am */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:30am</td>
                </tr>

                {/* 11:00am — Tue/Thu/Fri: Supervised Calls 1.5hrs = 1 booking */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:00am</td>
                  {/* Tue: Supervised Calls — rowSpan 3 (11:00–12:30) = 1.5hrs = 1 booking */}
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-800 rounded px-2 py-1.5 text-xs font-semibold">📋 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">11:00am–12:30pm · 1.5hrs</div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Target: 1 booking</div>
                  </td>
                  {/* Thu: Supervised Calls — rowSpan 3 = 1.5hrs = 1 booking */}
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-800 rounded px-2 py-1.5 text-xs font-semibold">📋 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">11:00am–12:30pm · 1.5hrs</div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Target: 1 booking</div>
                  </td>
                  {/* Fri: Supervised Calls — rowSpan 3 = 1.5hrs = 1 booking */}
                  <td rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-800 rounded px-2 py-1.5 text-xs font-semibold">📋 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">11:00am–12:30pm · 1.5hrs</div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Target: 1 booking</div>
                  </td>
                </tr>

                {/* 11:30am */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:30am</td>
                </tr>

                {/* 12:00pm */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:00pm</td>
                </tr>

                {/* ═══ 12:30pm — Lunch all days ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:30pm</td>
                  {days.map((day) => (
                    <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-stone-50">
                      <div className="bg-stone-100 text-stone-600 rounded px-2 py-1.5 text-xs font-semibold">🍽️ Lunch</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">12:30–1:30pm</div>
                    </td>
                  ))}
                </tr>

                {/* 1:00pm */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:00pm</td>
                </tr>

                {/* ═══ 1:30pm ═══ */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:30pm</td>
                  {/* Mon: Process & Technology — rowSpan 7 (1:30–5:00) */}
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                    <div className="bg-emerald-100 text-emerald-800 rounded px-2 py-2 text-xs font-semibold">⚙️ Process & Technology</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:30–5:00pm · 3.5hrs</div>
                    <div className="mt-2 text-left space-y-1">
                      {["Booking Admin","Deal Admin","Semrush","Slack","Discord","Google Calendars","Zoom","Wappalyzer"].map((item) => (
                        <div key={item} className="text-[10px] text-emerald-700 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0"></span>{item}
                        </div>
                      ))}
                    </div>
                  </td>
                  {/* Tue: Role Playing & Scenarios — rowSpan 2 (1:30–2:30) */}
                  <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-orange-50">
                    <div className="bg-orange-100 text-orange-800 rounded px-2 py-1.5 text-xs font-semibold">🎭 Role Playing & Scenarios</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">1:30–2:30pm · 1hr</div>
                  </td>
                  {/* Wed: Supervised Calls — rowSpan 7 (1:30–5:00) = 3.5hrs = 3 bookings */}
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-800 rounded px-2 py-2 text-xs font-semibold">📋 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:30–5:00pm · 3.5hrs</div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-1">Target: 3 bookings</div>
                  </td>
                  {/* Thu: Supervised Calls — rowSpan 7 = 3.5hrs = 3 bookings */}
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-800 rounded px-2 py-2 text-xs font-semibold">📋 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:30–5:00pm · 3.5hrs</div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-1">Target: 3 bookings</div>
                  </td>
                  {/* Fri: Supervised Calls — rowSpan 7 = 3.5hrs = 3 bookings */}
                  <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-amber-50">
                    <div className="bg-amber-100 text-amber-800 rounded px-2 py-2 text-xs font-semibold">📋 Supervised Calls</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:30–5:00pm · 3.5hrs</div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-1">Target: 3 bookings</div>
                  </td>
                </tr>

                {/* 2:00pm */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:00pm</td>
                </tr>

                {/* 2:30pm — Tue: Customer Service Team starts */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:30pm</td>
                  {/* Tue: Customer Service Team — rowSpan 5 (2:30–5:00) */}
                  <td rowSpan={5} className="p-2 text-center border border-gray-200 align-middle bg-teal-50">
                    <div className="bg-teal-100 text-teal-800 rounded px-2 py-2 text-xs font-semibold">🎧 Customer Service Team</div>
                    <div className="text-[10px] text-gray-500 mt-1">2:30–5:00pm · 2.5hrs</div>
                    <div className="text-[10px] text-teal-600 mt-0.5">Training session</div>
                  </td>
                </tr>

                {/* 3:00pm */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:00pm</td>
                </tr>

                {/* 3:30pm */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:30pm</td>
                </tr>

                {/* 4:00pm */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:00pm</td>
                </tr>

                {/* 4:30pm */}
                <tr>
                  <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:30pm</td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-indigo-100 border border-indigo-200"></span><span className="text-gray-600">Training / Modules</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-indigo-900 border border-indigo-900"></span><span className="text-gray-600">Call for Call (C4C)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></span><span className="text-gray-600">Supervised Calls</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200"></span><span className="text-gray-600">Process & Technology</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-teal-100 border border-teal-200"></span><span className="text-gray-600">Customer Service</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></span><span className="text-gray-600">Role Playing</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-pink-100 border border-pink-200"></span><span className="text-gray-600">Find Your Harpoon</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></span><span className="text-gray-600">Debrief</span></div>
          </div>
        </div>

        {/* Competencies Sign-Off Panel */}
        <div className="w-72 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Competencies</h2>
          <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">Sign off once the staff member has demonstrated competency in each area.</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left py-1.5 px-2 text-[10px] font-semibold text-slate-600 border border-slate-200">Competency</th>
                <th className="py-1.5 px-2 text-[10px] font-semibold text-slate-600 border border-slate-200 text-center w-12">Mgr</th>
                <th className="py-1.5 px-2 text-[10px] font-semibold text-slate-600 border border-slate-200 text-center w-12">Staff</th>
              </tr>
            </thead>
            <tbody>
              {[
                "Technology Set Up",
                { label: "How to Book a Lead", sub: "Lead Admin" },
                { label: "How to Close a Deal", sub: "Deal Admin" },
                "5 Hours Call for Call",
                "5 Hours Supervised Calls",
                "Call Scripts",
                "Understanding the Quodo Production Process",
                "Understanding the strength of our Customer Service Team",
                "Objection Handling",
                "Email & Text Templates: Marketing Sweet",
                "Email & Text Templates: Quodo",
              ].map((item, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-slate-50/50">
                  <td className="py-2 px-2 text-gray-700 leading-tight border border-gray-100">
                    {typeof item === "string" ? item : (
                      <><span>{item.label}</span><br /><span className="text-[10px] italic text-gray-400">{item.sub}</span></>
                    )}
                  </td>
                  <td className="py-2 px-1 border border-gray-100">
                    <div className="h-6 rounded border border-gray-300 bg-gray-50/50 w-full"></div>
                  </td>
                  <td className="py-2 px-1 border border-gray-100">
                    <div className="h-6 rounded border border-gray-300 bg-gray-50/50 w-full"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        </div>{/* end schedule + competencies row */}

        {/* Key Focus */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">💡</span>
            Key Focus This Week
          </h2>
          <div className="space-y-3">
            {[
              { bold: "Booking targets apply", rest: " — 1 booking per hour is the expectation across C4C and Supervised Call blocks. Your buddy is there to pick up the slack if needed." },
              { bold: "Call for Call (C4C)", rest: " — you're calling alongside the senior team. Target 2 bookings in 2hr blocks, 3 bookings in 3.5hr blocks." },
              { bold: "Supervised Calls", rest: " — target 1 booking per 1–1.5hr block, 3 bookings per 3.5hr block. Focus on following the script naturally and getting a feel for when to lead with Quodo vs Marketing Sweet." },
              { bold: "Process & Technology (Monday PM)", rest: " — set up all your tools properly from day one so nothing slows you down later." },
              { bold: "Customer Service session (Tuesday PM)", rest: " — understand what happens after a deal is closed so you can sell with conviction." },
              { bold: "Find Your Harpoon (Friday AM)", rest: " — a dedicated session to identify your personal sales style and hook." },
            ].map(({ bold, rest }, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-gray-700 leading-relaxed"><strong>{bold}</strong>{rest}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/schedule/sydney" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">← Back to Schedule</Link>
        </div>
      </div>
    </main>
  );
}

export default function SydneyWeek0Page() {
  return (
    <PasswordGate traineeSlug="sydney-arnold">
      <SydneyWeek0Content />
    </PasswordGate>
  );
}
