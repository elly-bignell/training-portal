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
          <div className="min-w-[1050px]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="p-3 text-left font-semibold w-28 border border-slate-700">Time</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Mon 16 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Tue 17 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Wed 18 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Thu 19 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Fri 20 Feb</th>
                  <th className="p-3 text-center font-semibold border border-slate-700">Sat 21 Feb</th>
                </tr>
              </thead>
              <tbody>
                {/* Flight arrivals row */}
                <tr className="bg-blue-50">
                  <td className="p-3 font-medium text-gray-700 border border-gray-200">✈️ Arrivals</td>
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
                
                {/* 8:30-9:30 */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50">8:30–9:30am</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400 italic">Travel to office</td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs font-semibold">📝 EXAMS</div>
                    <div className="text-[10px] text-gray-500 mt-1">Module 1</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs font-semibold">📝 EXAMS</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs font-semibold">📝 EXAMS</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs font-semibold">📝 EXAMS</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* 9:30-10:30 */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50">9:30–10:30am</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400 italic">Travel to office</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* 10:30-11:30 */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50">10:30–11:30am</td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-purple-100 text-purple-700 rounded px-2 py-1 text-xs font-semibold">Quodo Red Process</div>
                    <div className="text-[10px] text-gray-500 mt-1">Training w/ Ely</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-teal-100 text-teal-700 rounded px-2 py-1 text-xs font-semibold">Customer Service</div>
                    <div className="text-[10px] text-gray-500 mt-1">Team Pres w/ Ely, Trev & Troy</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-amber-100 text-amber-700 rounded px-2 py-1 text-xs font-semibold">Objection Handling</div>
                    <div className="text-[10px] text-gray-500 mt-1">Softwares, Semrush, etc</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* 11:30-12:30 */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50">11:30–12:30pm</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* 12:30-1:30 LUNCH */}
                <tr className="bg-yellow-50">
                  <td className="p-3 font-medium text-gray-700 border border-gray-200">12:30–1:30pm</td>
                  <td className="p-3 text-center border border-gray-200">
                    <span className="text-yellow-700 font-medium">🍽️ LUNCH</span>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <span className="text-yellow-700 font-medium">🍽️ LUNCH</span>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <span className="text-yellow-700 font-medium">🍽️ LUNCH</span>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <span className="text-yellow-700 font-medium">🍽️ LUNCH</span>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <span className="text-yellow-700 font-medium">🍽️ LUNCH</span>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* 1:30-2:30 */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50">1:30–2:30pm</td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-semibold">📞 Booking Calls</div>
                    <div className="text-[10px] text-gray-500 mt-1">Block 1 (CG)</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold">🤝 Att. Meeting</div>
                    <div className="text-[10px] text-gray-500 mt-1">App Meeting Room CT</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold">🤝 Att. Meeting</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold">🤝 Att. Meeting</div>
                    <div className="text-[10px] text-gray-500 mt-1">CT</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold">🤝 Att. Meeting</div>
                    <div className="text-[10px] text-gray-500 mt-1">CT</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* 2:30-3:30 */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50">2:30–3:30pm</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold">🤝 Att. Meeting</div>
                    <div className="text-[10px] text-gray-500 mt-1">CT</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* 3:30-4:30 */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50">3:30–4:30pm</td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-slate-100 text-slate-700 rounded px-2 py-1 text-xs font-semibold">❓ Q&A</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-slate-100 text-slate-700 rounded px-2 py-1 text-xs font-semibold">❓ Q&A</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-slate-100 text-slate-700 rounded px-2 py-1 text-xs font-semibold">❓ Q&A</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-orange-100 text-orange-700 rounded px-2 py-1 text-xs font-semibold">Catch Up</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200">
                    <div className="bg-slate-100 text-slate-700 rounded px-2 py-1 text-xs font-semibold">❓ Q&A</div>
                  </td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* 4:30-5:30 */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50">4:30–5:30pm</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* 5:30-6:30 */}
                <tr>
                  <td className="p-3 font-medium text-gray-700 border border-gray-200 bg-gray-50">5:30–6:30pm</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* Departures row */}
                <tr className="bg-blue-50">
                  <td className="p-3 font-medium text-gray-700 border border-gray-200">✈️ Departures</td>
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
                
                {/* Evening */}
                <tr className="bg-indigo-50">
                  <td className="p-3 font-medium text-gray-700 border border-gray-200">🌙 Evening</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                  <td className="p-3 text-center border border-gray-200 text-gray-400">—</td>
                </tr>
                
                {/* Daily Deliverables */}
                <tr className="bg-pink-50">
                  <td className="p-3 font-medium text-gray-700 border border-gray-200">📋 Deliverables</td>
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
              <span className="w-4 h-4 rounded bg-red-100 border border-red-200"></span>
              <span className="text-gray-600">Exams</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></span>
              <span className="text-gray-600">Training Sessions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></span>
              <span className="text-gray-600">Booking Calls</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-green-100 border border-green-200"></span>
              <span className="text-gray-600">Attended Meetings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></span>
              <span className="text-gray-600">Lunch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200"></span>
              <span className="text-gray-600">Q&A</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-teal-100 border border-teal-200"></span>
              <span className="text-gray-600">Team Presentations</span>
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
