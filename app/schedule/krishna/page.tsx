// app/schedule/krishna/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function KrishnaScheduleContent() {
  const competencies = [
    { label: "Technology Set Up", link: "https://docs.google.com/spreadsheets/d/1d6gVEjsHb640ZCa_cesU3j7bUmAyE4H7yulz3CRPCBU/edit?usp=sharing" },
    { label: "How to Book a Lead", link: null },
    { label: "How to Close a Deal", link: null },
    { label: "5 Hours Call for Call", link: null },
    { label: "5 Hours Supervised Calls", link: null },
    { label: "Call Scripts", link: "https://docs.google.com/document/d/1AbGxVtE5N0nMQFQCBrXzm3vYoUs337UE47UTOdU43FY/edit?tab=t.0#heading=h.bjodttb42hpy" },
    { label: "Understanding the Quodo Production Process", link: "https://docs.google.com/presentation/d/1_mOeJlBjMMWLbGa3Kb2lcXl8HSwY0Hi_dyAHPckfC5g/edit" },
    { label: "Understanding the strength of our Customer Service Team", link: "https://docs.google.com/presentation/d/1gyLJ6Kfrbc8rNKJDluBvkleKLJznmeTY--FFgHclbFQ/edit?usp=sharing" },
    { label: "Objection Handling", link: null },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/schedule/krishna" className="text-slate-400 hover:text-white transition-colors" title="Back to Portal">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Krishna Patel</h1>
                <p className="text-sm text-slate-400">Training Week · Mon 16 Feb – Fri 20 Feb 2026</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs font-semibold rounded-full">
              Week 0 — Training
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-8">
        <div className="flex gap-6">
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
            <div className="min-w-[800px]">
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

                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:00am</td></tr>
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

                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:30am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:00pm</td></tr>

                  {/* ═══ 12:30 ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:30pm</td>
                    <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                    <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                    <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                    <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                    <td rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-yellow-50"><span className="text-yellow-700 font-medium">🍽️ Lunch</span><div className="text-[10px] text-gray-500 mt-1">12:30–1:30pm</div></td>
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:00pm</td></tr>

                  {/* ═══ 1:30 ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:30pm</td>
                    <td rowSpan={7} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                      <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-1.5 text-xs font-semibold">Process &amp; Technology</div>
                      <div className="text-[10px] text-gray-500 mt-1">1:30–5:00pm · 3.5hrs</div>
                      <div className="text-[10px] text-gray-600 mt-2 text-left pl-3 space-y-1">
                        <div>• Booking Admin</div><div>• Deal Admin</div><div>• Semrush</div><div>• Slack</div><div>• Discord</div><div>• Google Calendars</div><div>• Zoom</div><div>• Wappalyzer</div>
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
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:00pm</td></tr>

                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:30pm</td>
                    <td rowSpan={5} className="p-2 text-center border border-gray-200 align-middle bg-violet-50">
                      <div className="bg-violet-100 text-violet-700 rounded px-2 py-1.5 text-xs font-semibold">Quodo Production</div>
                      <div className="text-[10px] text-gray-500 mt-1">2:30–5:00pm · 2.5hrs</div>
                      <div className="text-[10px] text-gray-500">Training w/ Taylor</div>
                    </td>
                  </tr>

                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:00pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:30pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:00pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:30pm</td></tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></span><span className="text-gray-600">Training</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-sky-100 border border-sky-200"></span><span className="text-gray-600">Call for Call (C4C)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></span><span className="text-gray-600">Supervised Calls</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200"></span><span className="text-gray-600">Process &amp; Technology</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></span><span className="text-gray-600">Lunch</span></div>
            </div>
          </div>

          <div className="w-[420px] flex-shrink-0 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-xs">✓</span>
                Competencies
              </h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="pb-2 text-left font-semibold text-gray-500 w-5"></th>
                    <th className="pb-2 text-left font-semibold text-gray-500">Competency</th>
                    <th className="pb-2 text-center font-semibold text-gray-500 w-16">Date</th>
                    <th className="pb-2 text-center font-semibold text-gray-500 w-14">Staff</th>
                    <th className="pb-2 text-center font-semibold text-gray-500 w-14">Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {competencies.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 text-center"><div className="w-4 h-4 rounded border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-pink-400 transition-colors"></div></td>
                      <td className="py-2 pr-1">
                        <div className="text-gray-700 font-medium leading-tight">{i + 1}. {item.label}</div>
                        {item.link && (<a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-500 hover:text-blue-700 hover:underline mt-0.5 inline-block">📎 View Resources</a>)}
                      </td>
                      <td className="py-2 px-0.5"><div className="h-6 rounded border border-gray-300 bg-gray-50/50"></div></td>
                      <td className="py-2 px-0.5"><div className="h-6 rounded border border-gray-300 bg-gray-50/50"></div></td>
                      <td className="py-2 px-0.5"><div className="h-6 rounded border border-gray-300 bg-gray-50/50"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">📚</span>
                Additional Resources
              </h2>
              <Link href="/trainees/krishna-patel" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
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

        <div className="mt-6 text-center">
          <Link href="/schedule/krishna" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">← Back</Link>
        </div>
      </div>
    </main>
  );
}

export default function KrishnaSchedulePage() {
  return (
    <PasswordGate traineeSlug="krishna-patel">
      <KrishnaScheduleContent />
    </PasswordGate>
  );
}

