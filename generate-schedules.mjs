// generate-schedules.mjs
// Run: node generate-schedules.mjs
// Generates weeks 2-8 schedules for all trainees, updated roadmap, admin page, and schedule index pages

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const trainees = [
  { name: 'Connie Matthews', slug: 'connie-matthews', dir: 'connie', short: 'Connie' },
  { name: 'Cindy Rose Rondez Manrique', slug: 'cindy-rose-rondez-manrique', dir: 'cindy', short: 'Cindy' },
  { name: 'Krishna Patel', slug: 'krishna-patel', dir: 'krishna', short: 'Krishna' },
];

const weekConfigs = [
  {
    week: 2, dateRange: 'Mon 2 Mar – Fri 6 Mar 2026', label: 'Building Pipeline',
    days: ['Mon 2 Mar', 'Tue 3 Mar', 'Wed 4 Mar', 'Thu 5 Mar', 'Fri 6 Mar'],
    template: 'week2-4', badge: 'Week 2 — Buddy Observe',
    targets: { calls: 62, connects: 34, bookings: 6, attended: 3, deals: 1.5, revenue: '$525' },
    revenueNote: 'Revenue based on $350 per deal · 50/50 buddy split applies',
    cb2Target: '2–3 bookings',
    meetingLabel: '🤝 Meeting (Observe)',
    meetingNote: 'Observe your buddy — learn the pitch structure',
    callEfficiency: '20% book rate — fewer calls, same bookings. Your efficiency is improving.',
    dailyTotal: { callHrs: '5.5hrs calls', meetings: '1 meeting', bookings: '6–7 bookings' },
    reminders: [
      'Call Block 2 is 1 hour shorter — use that efficiency gain wisely',
      'Your booking rate should be improving from 15% to 20%',
      'Meeting time: observe how your buddy handles objections and closes',
      '<strong>12:30pm Zoom Checkpoint</strong> — midday check-in with management',
      '<strong>5:00pm Zoom Checkpoint</strong> — end-of-day wrap-up',
      'Revenue split 50/50 with buddy — 50% put towards your monthly target',
    ],
    rules: [
      { left: '18 calls per hour', right: '= 10 connects' },
      { left: '10 connects', right: '= 2 bookings (20%)' },
      { left: '2 bookings', right: '= 1 attended (50%)' },
      { left: '2 attended', right: '= 1 deal (50%)' },
      { left: '1 deal', right: '= $350 revenue' },
    ],
  },
  {
    week: 3, dateRange: 'Mon 9 Mar – Fri 13 Mar 2026', label: 'Consistency',
    days: ['Mon 9 Mar', 'Tue 10 Mar', 'Wed 11 Mar', 'Thu 12 Mar', 'Fri 13 Mar'],
    template: 'week2-4', badge: 'Week 3 — Buddy Observe',
    targets: { calls: 62, connects: 34, bookings: 6, attended: 3, deals: 1.5, revenue: '$525' },
    revenueNote: 'Revenue based on $350 per deal · 50/50 buddy split applies',
    cb2Target: '2–3 bookings',
    meetingLabel: '🤝 Meeting (Observe)',
    meetingNote: 'Your booking quality should be improving — better prospects',
    callEfficiency: '20% book rate locked in — consistency is the goal this week.',
    dailyTotal: { callHrs: '5.5hrs calls', meetings: '1 meeting', bookings: '6–7 bookings' },
    reminders: [
      'Consistency is the goal — hit your numbers every single day',
      'Your booking quality should be improving — fewer no-shows',
      'Learn from every meeting — what objections come up?',
      '<strong>12:30pm Zoom Checkpoint</strong> — midday check-in with management',
      '<strong>5:00pm Zoom Checkpoint</strong> — end-of-day wrap-up',
      'Revenue split 50/50 with buddy — 50% put towards your monthly target',
    ],
    rules: [
      { left: '18 calls per hour', right: '= 10 connects' },
      { left: '10 connects', right: '= 2 bookings (20%)' },
      { left: '2 bookings', right: '= 1 attended (50%)' },
      { left: '2 attended', right: '= 1 deal (50%)' },
      { left: '1 deal', right: '= $350 revenue' },
    ],
  },
  {
    week: 4, dateRange: 'Mon 16 Mar – Fri 20 Mar 2026', label: 'Wrapping Up Phase 1',
    days: ['Mon 16 Mar', 'Tue 17 Mar', 'Wed 18 Mar', 'Thu 19 Mar', 'Fri 20 Mar'],
    template: 'week2-4', badge: 'Week 4 — Buddy Observe',
    targets: { calls: 62, connects: 34, bookings: 6, attended: 3, deals: 1.5, revenue: '$525' },
    revenueNote: 'Revenue based on $350 per deal · 50/50 buddy split applies',
    cb2Target: '2–3 bookings',
    meetingLabel: '🤝 Meeting (Observe)',
    meetingNote: 'Last week at this rhythm — next week you step up to 2 meetings',
    callEfficiency: '20% book rate at peak — your booking rhythm is locked in.',
    dailyTotal: { callHrs: '5.5hrs calls', meetings: '1 meeting', bookings: '6–7 bookings' },
    reminders: [
      'Last week at 1 meeting/day — next week you step up to 2',
      'Your booking rhythm should be locked in by now',
      'Focus on quality over quantity — better bookings = better show rates',
      '<strong>12:30pm Zoom Checkpoint</strong> — midday check-in with management',
      '<strong>5:00pm Zoom Checkpoint</strong> — end-of-day wrap-up',
      'Revenue split 50/50 with buddy — 50% put towards your monthly target',
    ],
    rules: [
      { left: '18 calls per hour', right: '= 10 connects' },
      { left: '10 connects', right: '= 2 bookings (20%)' },
      { left: '2 bookings', right: '= 1 attended (50%)' },
      { left: '2 attended', right: '= 1 deal (50%)' },
      { left: '1 deal', right: '= $350 revenue' },
    ],
  },
  {
    week: 5, dateRange: 'Mon 23 Mar – Fri 27 Mar 2026', label: 'Stepping Up',
    days: ['Mon 23 Mar', 'Tue 24 Mar', 'Wed 25 Mar', 'Thu 26 Mar', 'Fri 27 Mar'],
    template: 'week5-6', badge: 'Week 5 — Buddy Lead',
    targets: { calls: 50, connects: 28, bookings: 5, meetings: 2, deals: 1, revenue: '$500' },
    revenueNote: 'Revenue based on $500 per deal · 50/50 buddy split applies',
    cb2Target: '2 bookings',
    meetingLabel: '🤝 Meeting (You Lead)',
    meetingNote: 'You lead the call — buddy is there for backup only',
    callEfficiency: '20% book rate — fewer calls but more meetings. See Rules of Thumb.',
    dailyTotal: { callHrs: '4.5hrs calls', meetings: '2 meetings', bookings: '5 bookings' },
    reminders: [
      'You\'re now leading 2 meetings/day — your buddy is backup only',
      '1 fewer booking but 1 more meeting — see the Rules of Thumb',
      'Every meeting is a closing opportunity — prepare properly',
      '<strong>12:30pm Zoom Checkpoint</strong> — midday check-in with management',
      '<strong>5:00pm Zoom Checkpoint</strong> — end-of-day wrap-up',
      'Revenue split 50/50 with buddy — 50% put towards your monthly target',
    ],
    rules: [
      { left: '18 calls per hour', right: '= 10 connects' },
      { left: '10 connects', right: '= 2 bookings (20%)' },
      { left: '2 bookings', right: '= 1 attended (50%)' },
      { left: '2 attended', right: '= 1 deal (50%)' },
      { left: '1 deal', right: '= $500 revenue' },
    ],
  },
  {
    week: 6, dateRange: 'Mon 30 Mar – Fri 3 Apr 2026', label: 'Final Buddy Week',
    days: ['Mon 30 Mar', 'Tue 31 Mar', 'Wed 1 Apr', 'Thu 2 Apr', 'Fri 3 Apr'],
    template: 'week5-6', badge: 'Week 6 — Final Buddy Week',
    targets: { calls: 50, connects: 28, bookings: 5, meetings: 2, deals: 1, revenue: '$500' },
    revenueNote: 'Revenue based on $500 per deal · 50/50 buddy split applies',
    cb2Target: '2 bookings',
    meetingLabel: '🤝 Meeting (You Lead)',
    meetingNote: 'Last week with buddy support — prove you\'re ready for solo',
    callEfficiency: 'Same rhythm as Week 5 — lock it in before going solo.',
    dailyTotal: { callHrs: '4.5hrs calls', meetings: '2 meetings', bookings: '5 bookings' },
    reminders: [
      'This is your last week with buddy support — make it count',
      'Prove you can run the full meeting and close independently',
      'Don\'t cut your buddy prematurely — only go solo with 100% confidence',
      '<strong>12:30pm Zoom Checkpoint</strong> — midday check-in with management',
      '<strong>5:00pm Zoom Checkpoint</strong> — end-of-day wrap-up',
      'Revenue split 50/50 with buddy — last week of split commission',
    ],
    rules: [
      { left: '18 calls per hour', right: '= 10 connects' },
      { left: '10 connects', right: '= 2 bookings (20%)' },
      { left: '2 bookings', right: '= 1 attended (50%)' },
      { left: '2 attended', right: '= 1 deal (50%)' },
      { left: '1 deal', right: '= $500 revenue' },
    ],
  },
  {
    week: 7, dateRange: 'Mon 6 Apr – Fri 10 Apr 2026', label: '✈️ Flying Solo',
    days: ['Mon 6 Apr', 'Tue 7 Apr', 'Wed 8 Apr', 'Thu 9 Apr', 'Fri 10 Apr'],
    template: 'week7-8', badge: 'Week 7 — Flying Solo ✈️',
    targets: { calls: 50, connects: 28, bookings: 5, meetings: 2, deals: 1, revenue: '$500' },
    revenueNote: '100% of revenue goes to your target — no more buddy split',
    cb2Target: '2 bookings',
    meetingLabel: '📋 Meeting (Solo)',
    meetingNote: 'Your meeting, your close — 100% counts to your target',
    callEfficiency: 'Same rhythm — but every deal is 100% yours now.',
    dailyTotal: { callHrs: '4.5hrs calls', meetings: '2 meetings', bookings: '5 bookings' },
    isSolo: true,
    reminders: [
      'First week flying solo — 100% of every deal counts to your target',
      'Same rhythm: calls, bookings, meetings — but all yours now',
      'Prove you can maintain the close rate without your buddy',
      '<strong>12:30pm Zoom Checkpoint</strong> — midday check-in with management',
      '<strong>5:00pm Zoom Checkpoint</strong> — end-of-day wrap-up',
      '100% commission — every deal goes straight to your monthly target',
    ],
    rules: [
      { left: '18 calls per hour', right: '= 10 connects' },
      { left: '10 connects', right: '= 2 bookings (20%)' },
      { left: '2 bookings', right: '= 1 attended (50%)' },
      { left: '2 attended', right: '= 1 deal (50%)' },
      { left: '1 deal', right: '= $500 revenue' },
    ],
  },
  {
    week: 8, dateRange: 'Mon 13 Apr – Fri 17 Apr 2026', label: '🎯 The Standard',
    days: ['Mon 13 Apr', 'Tue 14 Apr', 'Wed 15 Apr', 'Thu 16 Apr', 'Fri 17 Apr'],
    template: 'week7-8', badge: 'Week 8 — The Standard 🎯',
    targets: { calls: 50, connects: 28, bookings: 5, meetings: 2, deals: 1, revenue: '$500' },
    revenueNote: 'The Standard — maintain this consistently from here on',
    cb2Target: '2 bookings',
    meetingLabel: '📋 Meeting (Solo)',
    meetingNote: 'You own the entire process — this is your benchmark',
    callEfficiency: 'The Standard is your floor, not your ceiling — keep pushing.',
    dailyTotal: { callHrs: '4.5hrs calls', meetings: '2 meetings', bookings: '5 bookings' },
    isSolo: true,
    isStandard: true,
    reminders: [
      'This is The Standard — your benchmark from here on',
      'Fully proficient closed-circuit selling — you own the entire process',
      '5 bookings, 2 meetings, 1 deal per day — maintain this consistently',
      '<strong>12:30pm Zoom Checkpoint</strong> — midday check-in with management',
      '<strong>5:00pm Zoom Checkpoint</strong> — end-of-day wrap-up',
      'The Standard is your floor, not your ceiling — keep pushing',
    ],
    rules: [
      { left: '18 calls per hour', right: '= 10 connects' },
      { left: '10 connects', right: '= 2 bookings (20%)' },
      { left: '2 bookings', right: '= 1 attended (50%)' },
      { left: '2 attended', right: '= 1 deal (50%)' },
      { left: '1 deal', right: '= $500 revenue' },
    ],
  },
];

// ─── TEMPLATES ────────────────────────────────────────────────────────────────

function generateWeek2to4Page(trainee, config) {
  const { name, slug, dir, short } = trainee;
  const { week, dateRange, label, days, badge, targets, revenueNote, cb2Target, meetingLabel, meetingNote, callEfficiency, dailyTotal, reminders, rules } = config;
  const daysStr = days.map(d => `"${d}"`).join(', ');

  return `// app/schedule/${dir}/week-${week}/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function ${short}Week${week}Content() {
  const days = [${daysStr}];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/schedule/${dir}" className="text-slate-400 hover:text-white transition-colors" title="Back to Schedule">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold">${name}</h1>
                <p className="text-sm text-slate-400">Week ${week} — ${label} · ${dateRange}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded-full">
              ${badge}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-8">
        {/* Week ${week} Targets Banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎯</span>
            <h2 className="text-sm font-bold uppercase tracking-wide">Week ${week} Daily Targets</h2>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.calls}</div>
              <div className="text-[10px] text-slate-400 uppercase">Calls</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.connects}</div>
              <div className="text-[10px] text-slate-400 uppercase">Connects</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.bookings}</div>
              <div className="text-[10px] text-slate-400 uppercase">Bookings</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.attended}</div>
              <div className="text-[10px] text-slate-400 uppercase">Attended</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.deals}</div>
              <div className="text-[10px] text-slate-400 uppercase">Deals</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.revenue}</div>
              <div className="text-[10px] text-slate-400 uppercase">Revenue</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">${revenueNote}</p>
        </div>

        <div className="flex gap-6">
          {/* Schedule Table */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-2 text-left font-semibold w-24 border border-slate-700 text-xs">Time</th>
                    {days.map((day) => (
                      <th key={day} className="p-2 text-center font-semibold border border-slate-700">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* ═══ 9:30–12:30 — Call Block 1 (3hrs) ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:30am</td>
                    {days.map((day) => (
                      <td key={day} rowSpan={6} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                        <div className="bg-sky-100 text-sky-700 rounded px-2 py-2 text-xs font-semibold">📞 Call Block 1</div>
                        <div className="text-[10px] text-gray-500 mt-1">9:30am–12:30pm · 3hrs</div>
                        <div className="text-[10px] text-sky-600 font-semibold mt-1">Target: 3 bookings</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:00am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:30am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:00am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:30am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:00pm</td></tr>

                  {/* ═══ 12:30–1:00 — Zoom Checkpoint ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:30pm</td>
                    {days.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-indigo-50">
                        <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1.5 text-xs font-semibold">🗣️ Zoom Checkpoint</div>
                        <div className="text-[10px] text-gray-500 mt-1">12:30–1:00pm · 30min</div>
                      </td>
                    ))}
                  </tr>

                  {/* ═══ 1:00–1:30 — Break ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:00pm</td>
                    {days.map((day) => (
                      <td key={day} className="p-2 border border-gray-200 bg-gray-50/50"></td>
                    ))}
                  </tr>

                  {/* ═══ 1:30–4:00 — Call Block 2 (2.5hrs) ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:30pm</td>
                    {days.map((day) => (
                      <td key={day} rowSpan={5} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                        <div className="bg-sky-100 text-sky-700 rounded px-2 py-2 text-xs font-semibold">📞 Call Block 2</div>
                        <div className="text-[10px] text-gray-500 mt-1">1:30–4:00pm · 2.5hrs</div>
                        <div className="text-[10px] text-sky-600 font-semibold mt-1">Target: ${cb2Target}</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:00pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:30pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:00pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:30pm</td></tr>

                  {/* ═══ 4:00–5:00 — Meeting Slot ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:00pm</td>
                    {days.map((day) => (
                      <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                        <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-2 text-xs font-semibold">${meetingLabel}</div>
                        <div className="text-[10px] text-gray-500 mt-1">4:00–5:00pm · 1hr</div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-1">${meetingNote}</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:30pm</td></tr>

                  {/* ═══ 5:00–5:30 — Zoom Checkpoint ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">5:00pm</td>
                    {days.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-indigo-50">
                        <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1.5 text-xs font-semibold">🗣️ Zoom Checkpoint</div>
                        <div className="text-[10px] text-gray-500 mt-1">5:00–5:30pm · 30min</div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-sky-100 border border-sky-200"></span><span className="text-gray-600">Calls</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200"></span><span className="text-gray-600">Meeting</span></div>
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
                    <th className="pb-2 text-center font-semibold text-gray-500">Time</th>
                    <th className="pb-2 text-right font-semibold text-gray-500">Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-sky-50/50">
                    <td className="py-2 text-sky-700 font-medium">📞 Call Block 1</td>
                    <td className="py-2 text-center text-gray-600">9:30–12:30</td>
                    <td className="py-2 text-right text-sky-700 font-semibold">3 bookings</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-indigo-700 font-medium">🗣️ Zoom Checkpoint</td>
                    <td className="py-2 text-center text-gray-600">12:30–1:00</td>
                    <td className="py-2 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-400 font-medium"></td>
                    <td className="py-2 text-center text-gray-400">1:00–1:30</td>
                    <td className="py-2 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-sky-50/50">
                    <td className="py-2 text-sky-700 font-medium">📞 Call Block 2</td>
                    <td className="py-2 text-center text-gray-600">1:30–4:00</td>
                    <td className="py-2 text-right text-sky-700 font-semibold">${cb2Target}</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-emerald-50/50">
                    <td className="py-2 text-emerald-700 font-medium">${meetingLabel}</td>
                    <td className="py-2 text-center text-gray-600">4:00–5:00</td>
                    <td className="py-2 text-right text-emerald-700 font-semibold">1 meeting</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-indigo-700 font-medium">🗣️ Zoom Checkpoint</td>
                    <td className="py-2 text-center text-gray-600">5:00–5:30</td>
                    <td className="py-2 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="border-t-2 border-gray-200">
                    <td className="py-2 text-gray-900 font-bold">Daily Total</td>
                    <td className="py-2 text-center text-gray-600 font-semibold">${dailyTotal.callHrs} + ${dailyTotal.meetings}</td>
                    <td className="py-2 text-right text-gray-900 font-bold">${dailyTotal.bookings}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Efficiency Note */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">📈</span>
                <p className="text-xs text-amber-800 leading-relaxed">${callEfficiency}</p>
              </div>
            </div>

            {/* Key Reminders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">💡</span>
                Key Reminders
              </h2>
              <div className="space-y-3">
                ${reminders.map(r => `<div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed">${r}</p>
                </div>`).join('\n                ')}
              </div>
            </div>

            {/* Rules of Thumb */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">📐</span>
                Rules of Thumb
              </h2>
              <div className="space-y-2 text-xs">
                ${rules.map((r, i) => `<div className="flex justify-between p-2 ${i === 0 ? 'bg-indigo-50' : i === rules.length - 1 ? 'bg-emerald-50' : 'bg-gray-50'} rounded">
                  <span className="${i === 0 ? 'text-indigo-700' : i === rules.length - 1 ? 'text-emerald-700' : 'text-gray-700'} font-medium">${r.left}</span>
                  <span className="${i === 0 ? 'text-indigo-900' : i === rules.length - 1 ? 'text-emerald-900' : 'text-gray-900'} font-bold">${r.right}</span>
                </div>`).join('\n                ')}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">🔗</span>
                Quick Links
              </h2>
              <div className="space-y-2">
                <Link href="/scorecard/${slug}" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group">
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
                    <div className="text-[10px] text-gray-500">Roadmap to 1 deal per day</div>
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
          <Link href="/schedule/${dir}" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">← Back to Schedule</Link>
        </div>
      </div>
    </main>
  );
}

export default function ${short}Week${week}Page() {
  return (
    <PasswordGate traineeSlug="${slug}">
      <${short}Week${week}Content />
    </PasswordGate>
  );
}
`;
}


function generateWeek5to8Page(trainee, config) {
  const { name, slug, dir, short } = trainee;
  const { week, dateRange, label, days, badge, targets, revenueNote, cb2Target, meetingLabel, meetingNote, callEfficiency, dailyTotal, isSolo, isStandard, reminders, rules } = config;
  const daysStr = days.map(d => `"${d}"`).join(', ');
  const standardBanner = isStandard ? `
        {/* The Standard Banner */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-500 rounded-xl p-4 text-white text-center">
          <div className="text-2xl mb-1">🏆</div>
          <h2 className="text-lg font-bold">You&apos;ve Reached The Standard</h2>
          <p className="text-pink-200 text-sm mt-1">5 bookings, 2 meetings, 1 deal per day — this is your benchmark from here on</p>
        </div>` : '';
  const soloNote = isSolo && !isStandard ? `
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-emerald-700">✈️ Flying solo — 100% of every deal counts towards your target</p>
        </div>` : '';

  return `// app/schedule/${dir}/week-${week}/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function ${short}Week${week}Content() {
  const days = [${daysStr}];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/schedule/${dir}" className="text-slate-400 hover:text-white transition-colors" title="Back to Schedule">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold">${name}</h1>
                <p className="text-sm text-slate-400">Week ${week} — ${label} · ${dateRange}</p>
              </div>
            </div>
            <span className="px-3 py-1 ${isStandard ? 'bg-pink-600 text-white' : isSolo ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'} text-xs font-semibold rounded-full">
              ${badge}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-8">${standardBanner}${soloNote}
        {/* Week ${week} Targets Banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">${isStandard ? '🏆' : '🎯'}</span>
            <h2 className="text-sm font-bold uppercase tracking-wide">Week ${week} Daily Targets</h2>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.calls}</div>
              <div className="text-[10px] text-slate-400 uppercase">Calls</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.connects}</div>
              <div className="text-[10px] text-slate-400 uppercase">Connects</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.bookings}</div>
              <div className="text-[10px] text-slate-400 uppercase">Bookings</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.meetings}</div>
              <div className="text-[10px] text-slate-400 uppercase">Meetings</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.deals}</div>
              <div className="text-[10px] text-slate-400 uppercase">Deals</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">${targets.revenue}</div>
              <div className="text-[10px] text-slate-400 uppercase">Revenue</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">${revenueNote}</p>
        </div>

        <div className="flex gap-6">
          {/* Schedule Table */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-2 text-left font-semibold w-24 border border-slate-700 text-xs">Time</th>
                    {days.map((day) => (
                      <th key={day} className="p-2 text-center font-semibold border border-slate-700">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* ═══ 9:30–12:30 — Call Block 1 (3hrs) ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">9:30am</td>
                    {days.map((day) => (
                      <td key={day} rowSpan={6} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                        <div className="bg-sky-100 text-sky-700 rounded px-2 py-2 text-xs font-semibold">📞 Call Block 1</div>
                        <div className="text-[10px] text-gray-500 mt-1">9:30am–12:30pm · 3hrs</div>
                        <div className="text-[10px] text-sky-600 font-semibold mt-1">Target: 3 bookings</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:00am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">10:30am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:00am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">11:30am</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:00pm</td></tr>

                  {/* ═══ 12:30–1:00 — Zoom Checkpoint ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">12:30pm</td>
                    {days.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-indigo-50">
                        <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1.5 text-xs font-semibold">🗣️ Zoom Checkpoint</div>
                        <div className="text-[10px] text-gray-500 mt-1">12:30–1:00pm · 30min</div>
                      </td>
                    ))}
                  </tr>

                  {/* ═══ 1:00–1:30 — Break ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:00pm</td>
                    {days.map((day) => (
                      <td key={day} className="p-2 border border-gray-200 bg-gray-50/50"></td>
                    ))}
                  </tr>

                  {/* ═══ 1:30–2:30 — Meeting 1 ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">1:30pm</td>
                    {days.map((day) => (
                      <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                        <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-2 text-xs font-semibold">${meetingLabel} 1</div>
                        <div className="text-[10px] text-gray-500 mt-1">1:30–2:30pm · 1hr</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:00pm</td></tr>

                  {/* ═══ 2:30–4:00 — Call Block 2 (1.5hrs) ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">2:30pm</td>
                    {days.map((day) => (
                      <td key={day} rowSpan={3} className="p-2 text-center border border-gray-200 align-middle bg-sky-50">
                        <div className="bg-sky-100 text-sky-700 rounded px-2 py-2 text-xs font-semibold">📞 Call Block 2</div>
                        <div className="text-[10px] text-gray-500 mt-1">2:30–4:00pm · 1.5hrs</div>
                        <div className="text-[10px] text-sky-600 font-semibold mt-1">Target: ${cb2Target}</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:00pm</td></tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">3:30pm</td></tr>

                  {/* ═══ 4:00–5:00 — Meeting 2 ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:00pm</td>
                    {days.map((day) => (
                      <td key={day} rowSpan={2} className="p-2 text-center border border-gray-200 align-middle bg-emerald-50">
                        <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-2 text-xs font-semibold">${meetingLabel} 2</div>
                        <div className="text-[10px] text-gray-500 mt-1">4:00–5:00pm · 1hr</div>
                      </td>
                    ))}
                  </tr>
                  <tr><td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">4:30pm</td></tr>

                  {/* ═══ 5:00–5:30 — Zoom Checkpoint ═══ */}
                  <tr>
                    <td className="p-2 font-medium text-gray-700 border border-gray-200 bg-gray-50 text-xs whitespace-nowrap">5:00pm</td>
                    {days.map((day) => (
                      <td key={day} className="p-2 text-center border border-gray-200 align-middle bg-indigo-50">
                        <div className="bg-indigo-100 text-indigo-700 rounded px-2 py-1.5 text-xs font-semibold">🗣️ Zoom Checkpoint</div>
                        <div className="text-[10px] text-gray-500 mt-1">5:00–5:30pm · 30min</div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-sky-100 border border-sky-200"></span><span className="text-gray-600">Calls</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200"></span><span className="text-gray-600">Meeting</span></div>
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
                    <th className="pb-2 text-center font-semibold text-gray-500">Time</th>
                    <th className="pb-2 text-right font-semibold text-gray-500">Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-sky-50/50">
                    <td className="py-2 text-sky-700 font-medium">📞 Call Block 1</td>
                    <td className="py-2 text-center text-gray-600">9:30–12:30</td>
                    <td className="py-2 text-right text-sky-700 font-semibold">3 bookings</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-indigo-700 font-medium">🗣️ Zoom Checkpoint</td>
                    <td className="py-2 text-center text-gray-600">12:30–1:00</td>
                    <td className="py-2 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-400 font-medium"></td>
                    <td className="py-2 text-center text-gray-400">1:00–1:30</td>
                    <td className="py-2 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-emerald-50/50">
                    <td className="py-2 text-emerald-700 font-medium">${meetingLabel} 1</td>
                    <td className="py-2 text-center text-gray-600">1:30–2:30</td>
                    <td className="py-2 text-right text-emerald-700 font-semibold">1 meeting</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-sky-50/50">
                    <td className="py-2 text-sky-700 font-medium">📞 Call Block 2</td>
                    <td className="py-2 text-center text-gray-600">2:30–4:00</td>
                    <td className="py-2 text-right text-sky-700 font-semibold">${cb2Target}</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-emerald-50/50">
                    <td className="py-2 text-emerald-700 font-medium">${meetingLabel} 2</td>
                    <td className="py-2 text-center text-gray-600">4:00–5:00</td>
                    <td className="py-2 text-right text-emerald-700 font-semibold">1 meeting</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-indigo-700 font-medium">🗣️ Zoom Checkpoint</td>
                    <td className="py-2 text-center text-gray-600">5:00–5:30</td>
                    <td className="py-2 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="border-t-2 border-gray-200">
                    <td className="py-2 text-gray-900 font-bold">Daily Total</td>
                    <td className="py-2 text-center text-gray-600 font-semibold">${dailyTotal.callHrs} + ${dailyTotal.meetings}</td>
                    <td className="py-2 text-right text-gray-900 font-bold">${dailyTotal.bookings}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Efficiency Note */}
            <div className="${isStandard ? 'bg-pink-50 border-pink-200' : isSolo ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} rounded-xl border p-4">
              <div className="flex items-start gap-2">
                <span className="${isStandard ? 'text-pink-500' : isSolo ? 'text-emerald-500' : 'text-amber-500'} mt-0.5">${isStandard ? '🎯' : isSolo ? '✈️' : '📈'}</span>
                <p className="text-xs ${isStandard ? 'text-pink-800' : isSolo ? 'text-emerald-800' : 'text-amber-800'} leading-relaxed">${callEfficiency}</p>
              </div>
            </div>

            {/* Key Reminders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">💡</span>
                Key Reminders
              </h2>
              <div className="space-y-3">
                ${reminders.map(r => `<div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed">${r}</p>
                </div>`).join('\n                ')}
              </div>
            </div>

            {/* Rules of Thumb */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">📐</span>
                Rules of Thumb
              </h2>
              <div className="space-y-2 text-xs">
                ${rules.map((r, i) => `<div className="flex justify-between p-2 ${i === 0 ? 'bg-indigo-50' : i === rules.length - 1 ? 'bg-emerald-50' : 'bg-gray-50'} rounded">
                  <span className="${i === 0 ? 'text-indigo-700' : i === rules.length - 1 ? 'text-emerald-700' : 'text-gray-700'} font-medium">${r.left}</span>
                  <span className="${i === 0 ? 'text-indigo-900' : i === rules.length - 1 ? 'text-emerald-900' : 'text-gray-900'} font-bold">${r.right}</span>
                </div>`).join('\n                ')}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">🔗</span>
                Quick Links
              </h2>
              <div className="space-y-2">
                <Link href="/scorecard/${slug}" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group">
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
                    <div className="text-[10px] text-gray-500">Roadmap to 1 deal per day</div>
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
          <Link href="/schedule/${dir}" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">← Back to Schedule</Link>
        </div>
      </div>
    </main>
  );
}

export default function ${short}Week${week}Page() {
  return (
    <PasswordGate traineeSlug="${slug}">
      <${short}Week${week}Content />
    </PasswordGate>
  );
}
`;
}


function generateScheduleIndexPage(trainee) {
  const { name, slug, dir, short } = trainee;

  const weeks = [
    { week: 1, dateRange: 'Mon 23 Feb – Fri 27 Feb', label: 'First Week Out', badge: 'Calls Only', badgeColor: 'bg-sky-100 text-sky-700' },
    { week: 2, dateRange: 'Mon 2 Mar – Fri 6 Mar', label: 'Building Pipeline', badge: '+ 1 Meeting', badgeColor: 'bg-emerald-100 text-emerald-700' },
    { week: 3, dateRange: 'Mon 9 Mar – Fri 13 Mar', label: 'Consistency', badge: '+ 1 Meeting', badgeColor: 'bg-emerald-100 text-emerald-700' },
    { week: 4, dateRange: 'Mon 16 Mar – Fri 20 Mar', label: 'Wrapping Up Phase 1', badge: '+ 1 Meeting', badgeColor: 'bg-emerald-100 text-emerald-700' },
    { week: 5, dateRange: 'Mon 23 Mar – Fri 27 Mar', label: 'Stepping Up', badge: '2 Meetings', badgeColor: 'bg-amber-100 text-amber-700' },
    { week: 6, dateRange: 'Mon 30 Mar – Fri 3 Apr', label: 'Final Buddy Week', badge: '2 Meetings', badgeColor: 'bg-amber-100 text-amber-700' },
    { week: 7, dateRange: 'Mon 6 Apr – Fri 10 Apr', label: '✈️ Flying Solo', badge: 'Solo', badgeColor: 'bg-emerald-600 text-white' },
    { week: 8, dateRange: 'Mon 13 Apr – Fri 17 Apr', label: '🎯 The Standard', badge: 'The Standard', badgeColor: 'bg-pink-600 text-white' },
  ];

  return `// app/schedule/${dir}/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

function ${short}ScheduleContent() {
  const weeks = ${JSON.stringify(weeks, null, 4)};

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
              <h1 className="text-2xl font-bold">${name}</h1>
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
              href={\`/schedule/${dir}/week-\${w.week}\`}
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
                <span className={\`text-xs font-semibold px-2.5 py-1 rounded-full \${w.badgeColor}\`}>
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

export default function ${short}SchedulePage() {
  return (
    <PasswordGate traineeSlug="${slug}">
      <${short}ScheduleContent />
    </PasswordGate>
  );
}
`;
}


// ─── GENERATE ALL FILES ───────────────────────────────────────────────────────

let filesCreated = 0;

for (const trainee of trainees) {
  for (const config of weekConfigs) {
    const dir = join('app', 'schedule', trainee.dir, `week-${config.week}`);
    mkdirSync(dir, { recursive: true });

    let content;
    if (config.template === 'week2-4') {
      content = generateWeek2to4Page(trainee, config);
    } else {
      content = generateWeek5to8Page(trainee, config);
    }

    writeFileSync(join(dir, 'page.tsx'), content);
    filesCreated++;
    console.log(`✅ Created: ${dir}/page.tsx`);
  }

  // Update schedule index page
  const indexContent = generateScheduleIndexPage(trainee);
  writeFileSync(join('app', 'schedule', trainee.dir, 'page.tsx'), indexContent);
  filesCreated++;
  console.log(`✅ Updated: app/schedule/${trainee.dir}/page.tsx`);
}

console.log(`\n🎉 Generated ${filesCreated} files total`);
console.log('\n⚠️  IMPORTANT: You still need to manually update:');
console.log('   1. app/roadmap/page.tsx (Week 1 data)');
console.log('   2. app/admin/page.tsx (add schedule links)');
console.log('   These are provided as separate files.\n');
