// app/roadmap/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

interface WeekData {
  week: number;
  dateRange: string;
  startDate: string;
  phase: "training" | "ramp" | "solo" | "standard" | "maintain";
  label?: string;
  buddyWeek?: boolean;
  daily: {
    revenue: number;
    units: number;
    meetings: number;
    bookings: number;
    calls: number;
  };
  takeaways: string[];
}

const weeklyData: WeekData[] = [
  {
    week: 0,
    dateRange: "Mon 16 Feb – Fri 20 Feb",
    startDate: "2026-02-16",
    phase: "training",
    label: "Training Week",
    daily: { revenue: 0, units: 0, meetings: 0, bookings: 0, calls: 0 },
    takeaways: [
      "Mon–Tue: Induction, tech setup, software training & understanding the customer service team",
      "Wed–Fri: Hit the phones — paired with a senior buddy, going call for call",
      "40 bookings between you and your buddy by end of week",
      "200 calls between the pair over 3 days to hit the target",
    ],
  },
  {
    week: 1,
    dateRange: "Mon 23 Feb – Fri 27 Feb",
    startDate: "2026-02-23",
    phase: "ramp",
    label: "First Week Out",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 60 },
    takeaways: [
      "60 calls/day — volume is everything this week",
      "6 bookings/day — you're booking meetings for your buddy",
      "1 meeting/day observing — watch how your buddy runs the call and closes",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],
  },
  {
    week: 2,
    dateRange: "Mon 2 Mar – Fri 6 Mar",
    startDate: "2026-03-02",
    phase: "ramp",
    label: "Building Pipeline",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 60 },
    takeaways: [
      "Same rhythm as Week 1 — 60 calls, 6 bookings, 1 meeting observing",
      "You should be picking up the pitch structure and objection handling",
      "Your pipeline is growing — the bookings you're making fill your buddy's calendar",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],
  },
  {
    week: 3,
    dateRange: "Mon 9 Mar – Fri 13 Mar",
    startDate: "2026-03-09",
    phase: "ramp",
    label: "Consistency",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 60 },
    takeaways: [
      "Same targets — 60 calls, 6 bookings, 1 meeting observing",
      "Your booking quality should be improving — better prospects, fewer no-shows",
      "Learn from every meeting — what objections come up, how does your buddy handle them?",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],
  },
  {
    week: 4,
    dateRange: "Mon 16 Mar – Fri 20 Mar",
    startDate: "2026-03-16",
    phase: "ramp",
    label: "Wrapping Up Phase 1",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 60 },
    takeaways: [
      "Last week at 60 calls / 6 bookings / 1 meeting — you've built the foundation",
      "Next week you step up to 2 meetings/day — your buddy will start handing you the reins",
      "Your booking rhythm is locked in — now it's about quality over quantity",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],
  },
  {
    week: 5,
    dateRange: "Mon 23 Mar – Fri 27 Mar",
    startDate: "2026-03-23",
    phase: "ramp",
    label: "Stepping Up",
    buddyWeek: true,
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 50 },
    takeaways: [
      "50 calls/day, 5 bookings — meetings are taking more of your time now",
      "2 meetings/day — you start leading the call with buddy backup",
      "1 fewer booking but 1 more meeting — see the Rules of Thumb",
      "50% close rate → 5 deals/week → $2,500 (your target contribution: $1,250)",
    ],
  },
  {
    week: 6,
    dateRange: "Mon 30 Mar – Fri 3 Apr",
    startDate: "2026-03-30",
    phase: "ramp",
    label: "Final Buddy Week",
    buddyWeek: true,
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 50 },
    takeaways: [
      "Same as Week 5 — 50 calls, 5 bookings, 2 meetings/day",
      "50% close rate → 5 deals/week → $2,500 (your target contribution: $1,250)",
      "This is your last week with buddy support — prove you're ready to go solo",
      "Don't cut your buddy prematurely — only go solo with 100% confidence",
    ],
  },
  {
    week: 7,
    dateRange: "Mon 6 Apr – Fri 10 Apr",
    startDate: "2026-04-06",
    phase: "solo",
    label: "✈️ Flying Solo",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 50 },
    takeaways: [
      "First week running meetings solo — 100% of each deal counts towards your target",
      "Same rhythm: 50 calls, 5 bookings, 2 meetings — but all yours now",
      "50% close rate → 5 deals/week → $2,500 — 100% to your target",
      "Prove you can maintain the close rate without your buddy in the room",
    ],
  },
  {
    week: 8,
    dateRange: "Mon 13 Apr – Fri 17 Apr",
    startDate: "2026-04-13",
    phase: "standard",
    label: "🎯 The Standard",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "Fully proficient closed-circuit selling — you own the entire process",
      "40 calls, 4 bookings, 2 meetings — maximum efficiency, minimum waste",
      "50% close rate → 5 deals/week → $2,500/week — this is your benchmark",
      "The Standard is your floor, not your ceiling — keep pushing",
    ],
  },
  {
    week: 9,
    dateRange: "Mon 20 Apr – Fri 24 Apr",
    startDate: "2026-04-20",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "Review your follow-up pipeline — warm leads from previous weeks are your easiest wins",
      "Better bookings = better show rates = more meetings from less effort",
      "Start tracking which industries and business types convert best for you",
    ],
  },
  {
    week: 10,
    dateRange: "Mon 27 Apr – Fri 1 May",
    startDate: "2026-04-27",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "Your pitch should feel natural now — less scripted, more conversational",
      "Focus on objection handling — every objection overcome is a booking saved",
      "Efficiency is your edge — fewer wasted calls, more qualified conversations",
    ],
  },
  {
    week: 11,
    dateRange: "Mon 4 May – Fri 8 May",
    startDate: "2026-05-04",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "Look at your meeting-to-close ratio — every percentage point up is more revenue towards your target",
      "Pre-meeting prep is what separates good from great — research the prospect",
      "Aim to increase your average deal value through upsells and add-ons",
    ],
  },
  {
    week: 12,
    dateRange: "Mon 11 May – Fri 15 May",
    startDate: "2026-05-11",
    phase: "maintain",
    label: "Quarter Mark",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "3 months in — you should know your numbers inside out",
      "Identify your best-performing time slots for calls and meetings",
      "Maximise your calendar — dead time is a lost opportunity to hit your target",
    ],
  },
  {
    week: 13,
    dateRange: "Mon 18 May – Fri 22 May",
    startDate: "2026-05-18",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "Challenge yourself — can you close 6 deals this week instead of 5?",
      "Sharpen your discovery questions to qualify harder on the call",
      "Better qualification = higher show rate = more target contribution per booking",
    ],
  },
  {
    week: 14,
    dateRange: "Mon 25 May – Fri 29 May",
    startDate: "2026-05-25",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "Your booking quality should be improving — track no-show rate weekly",
      "Every no-show is a wasted meeting slot — tighten your qualification",
      "Follow-up game matters — chase confirmations the day before every meeting",
    ],
  },
  {
    week: 15,
    dateRange: "Mon 1 Jun – Fri 5 Jun",
    startDate: "2026-06-01",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "You're building a reputation now — referrals and warm leads start flowing",
      "Fewer cold calls needed as your pipeline compounds over time",
      "Focus on maximising every meeting — your close technique is your biggest lever",
    ],
  },
  {
    week: 16,
    dateRange: "Mon 8 Jun – Fri 12 Jun",
    startDate: "2026-06-08",
    phase: "maintain",
    label: "4 Months In",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "4 months of consistency — this is who you are now",
      "Your efficiency gains compound — same effort, better results every week",
      "The Standard is your floor, not your ceiling — keep pushing",
    ],
  },
];

const standardDaily = { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 };

function getWeekly(daily: WeekData["daily"]) {
  return {
    revenue: daily.revenue * 5,
    units: daily.units * 5,
    meetings: daily.meetings * 5,
    bookings: daily.bookings * 5,
    calls: daily.calls * 5,
  };
}

function formatCurrency(val: number) {
  if (val === 0) return "$0";
  return "$" + val.toLocaleString("en-AU");
}

function formatNumber(val: number) {
  if (Number.isInteger(val)) return val.toString();
  return val.toFixed(1);
}

function getConversions(daily: WeekData["daily"]) {
  return {
    callsToBookings: daily.calls > 0 ? Math.round((daily.bookings / daily.calls) * 100) : 0,
    bookingsToMeetings: daily.bookings > 0 ? Math.round((daily.meetings / daily.bookings) * 100) : 0,
    meetingsToUnits: daily.meetings > 0 ? Math.round((daily.units / daily.meetings) * 100) : 0,
    revenuePerUnit: daily.units > 0 ? daily.revenue / daily.units : 0,
  };
}

function getPercentToStandard(daily: WeekData["daily"]) {
  const revPct = standardDaily.revenue > 0 ? Math.min(100, (daily.revenue / standardDaily.revenue) * 100) : 100;
  const unitPct = standardDaily.units > 0 ? Math.min(100, (daily.units / standardDaily.units) * 100) : 100;
  const meetPct = Math.min(100, (daily.meetings / standardDaily.meetings) * 100);
  const bookPct = Math.min(100, (daily.bookings / standardDaily.bookings) * 100);
  const callPct = Math.min(100, Math.max(0, ((70 - daily.calls) / (70 - standardDaily.calls)) * 100));
  return Math.round((revPct + unitPct + meetPct + bookPct + callPct) / 5);
}

function getCurrentWeek(): number {
  const now = new Date();
  const adelaide = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Adelaide" }));
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    const weekStart = new Date(weeklyData[i].startDate);
    const activateDate = new Date(weekStart);
    activateDate.setDate(activateDate.getDate() - 1);
    if (adelaide >= activateDate) {
      return weeklyData[i].week;
    }
  }
  return 0;
}

// Quodo brand colors
const PINK = "#E6017D";
const MINT = "#84D4BD";

function getPhaseStyles(phase: string) {
  switch (phase) {
    case "solo":
      return {
        border: "border-emerald-400",
        bg: "bg-gradient-to-br from-emerald-50 to-green-50",
        badge: "bg-emerald-600 text-white",
        metricBg: "bg-emerald-100/60",
        textColor: "text-emerald-700",
        dailyColor: "text-emerald-500",
        arrowColor: "text-emerald-500",
        takeawayBg: "bg-emerald-50",
        takeawayBorder: "border-emerald-200",
        takeawayText: "text-emerald-800",
        takeawayDot: "bg-emerald-500",
      };
    case "standard":
      return {
        border: `border-[${PINK}]`,
        bg: "bg-gradient-to-br from-pink-50 to-rose-50",
        badge: "bg-slate-700 text-white",
        metricBg: "bg-pink-100/60",
        textColor: `text-[${PINK}]`,
        dailyColor: "text-pink-400",
        arrowColor: `text-[${PINK}]`,
        takeawayBg: "bg-pink-50",
        takeawayBorder: "border-pink-200",
        takeawayText: "text-pink-900",
        takeawayDot: `bg-[${PINK}]`,
      };
    case "maintain":
      return {
        border: `border-[${MINT}]`,
        bg: "bg-white",
        badge: "bg-slate-700 text-white",
        metricBg: "bg-slate-50",
        textColor: "text-teal-700",
        dailyColor: "text-teal-500",
        arrowColor: `text-[${MINT}]`,
        takeawayBg: "bg-slate-50",
        takeawayBorder: "border-teal-200",
        takeawayText: "text-teal-800",
        takeawayDot: "bg-teal-500",
      };
    case "training":
      return {
        border: "border-blue-300",
        bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
        badge: "bg-blue-600 text-white",
        metricBg: "bg-blue-100/60",
        textColor: "text-blue-700",
        dailyColor: "text-blue-500",
        arrowColor: "text-blue-400",
        takeawayBg: "bg-blue-50",
        takeawayBorder: "border-blue-200",
        takeawayText: "text-blue-800",
        takeawayDot: "bg-blue-400",
      };
    default:
      return {
        border: "border-slate-200",
        bg: "bg-white",
        badge: "bg-slate-600 text-white",
        metricBg: "bg-slate-50",
        textColor: "text-slate-800",
        dailyColor: "text-slate-400",
        arrowColor: "text-slate-300",
        takeawayBg: "bg-slate-50",
        takeawayBorder: "border-slate-200",
        takeawayText: "text-slate-700",
        takeawayDot: "bg-slate-400",
      };
  }
}

const funnelMetrics = [
  { key: "revenue" as const, label: "Revenue", format: "currency" },
  { key: "units" as const, label: "Units", format: "number" },
  { key: "meetings" as const, label: "Meetings", format: "number" },
  { key: "bookings" as const, label: "Bookings", format: "number" },
  { key: "calls" as const, label: "Calls", format: "number" },
];

const conversionLabelsMap = ["Avg Deal", "Close Rate", "Show Rate", "Book Rate"];

function ConversionArrowLeft({ rate, label, format, color }: { rate: number; label: string; format: "pct" | "currency"; color: string }) {
  const display = format === "currency"
    ? (rate > 0 ? formatCurrency(rate) : "—")
    : (rate > 0 ? rate + "%" : "—");

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center mb-1" style={{ color: rate > 0 ? color : "#d1d5db" }}>
        <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <span className={`text-sm font-bold whitespace-nowrap ${rate > 0 ? "text-slate-700" : "text-slate-300"}`}>
        {display}
      </span>
      <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">{label}</span>
    </div>
  );
}

function YouAreHereBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md shadow-pink-200 animate-pulse" style={{ backgroundColor: PINK }}>
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
      YOU ARE HERE
    </div>
  );
}

function RoadmapContent() {
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const standardWeekly = getWeekly(standardDaily);
  const standardConversions = getConversions(standardDaily);

  useEffect(() => {
    setCurrentWeek(getCurrentWeek());
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Portal
            </Link>
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors text-sm">
              Admin Dashboard →
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Standards</h1>
          <p className="text-lg sm:text-xl font-semibold mt-2" style={{ color: PINK }}>The Roadmap to Achieving 1 Deal Per Day</p>
          <p className="text-slate-400 mt-3">
            This roadmap covers your first 16 weeks, building up to The Standard by Week 8 and maintaining it beyond.
          </p>
        </div>
      </header>

      {/* The Standard Summary */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="rounded-2xl p-6 sm:p-8 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${PINK} 0%, #ff4da6 100%)` }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-bold">The Standard — Week 8 Target</h2>
          </div>
          <p className="text-pink-200 text-sm mb-6">From Week 8 onwards — these are your targets to maintain</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr 60px 1fr 60px 1fr 60px 1fr", alignItems: "center" }}>
            {funnelMetrics.map((m, i) => (
              <div key={m.key} className="contents">
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 sm:p-4 text-center">
                  <div className="text-[10px] text-pink-200 uppercase tracking-wide font-semibold mb-1">{m.label}</div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {m.format === "currency" ? formatCurrency(standardWeekly[m.key]) : formatNumber(standardWeekly[m.key])}
                  </div>
                  <div className="text-[10px] text-pink-200">/ week</div>
                  <div className="text-sm text-white/70 mt-0.5">
                    {m.format === "currency" ? formatCurrency(standardDaily[m.key]) : formatNumber(standardDaily[m.key])}
                    <span className="text-[10px]"> / day</span>
                  </div>
                </div>
                {i < funnelMetrics.length - 1 && (
                  <div className="flex flex-col items-center">
                    <svg className="w-5 h-5 text-white/60 rotate-180 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-bold text-white/90">
                      {i === 0 ? formatCurrency(standardConversions.revenuePerUnit) : [
                        standardConversions.meetingsToUnits,
                        standardConversions.bookingsToMeetings,
                        standardConversions.callsToBookings,
                      ][i - 1] + "%"}
                    </span>
                    <span className="text-[10px] text-pink-200/80 mt-0.5">{conversionLabelsMap[i]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules of Thumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-slate-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📐</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-indigo-900 mb-1">Rules of Thumb</h3>
              <p className="text-xs text-indigo-700 mb-3">1 hour = 1 meeting <span className="font-bold">OR</span> minimum 1 booking.</p>
              <div className="bg-white rounded-lg border border-indigo-100 overflow-hidden">
                <div className="grid grid-cols-3 text-[11px] font-bold text-indigo-900 border-b border-indigo-100">
                  <div className="px-4 py-2 text-center border-r border-indigo-100">MEETINGS</div>
                  <div className="px-4 py-2 text-center border-r border-indigo-100">BOOKINGS</div>
                  <div className="px-4 py-2 text-center">CALLS</div>
                </div>
                {[
                  { m: 1, b: 6, c: 60 },
                  { m: 2, b: 5, c: 50 },
                  { m: 3, b: 4, c: 40 },
                  { m: 4, b: 3, c: 30 },
                ].map((row, i) => (
                  <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-indigo-50/40" : "bg-white"} ${i < 3 ? "border-b border-indigo-50" : ""}`}>
                    <div className="px-4 py-2.5 text-center font-bold text-indigo-700 border-r border-indigo-100">{row.m}</div>
                    <div className="px-4 py-2.5 text-center font-bold text-indigo-700 border-r border-indigo-100">{row.b}</div>
                    <div className="px-4 py-2.5 text-center font-bold text-indigo-700">{row.c}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-indigo-500 mt-2">Total daily output stays constant — more meetings means fewer calls, but each meeting is a closing opportunity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Cards */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="space-y-4">
          {weeklyData.map((w) => {
            const styles = getPhaseStyles(w.phase);
            const weekly = getWeekly(w.daily);
            const daily = w.daily;
            const isStandard = w.phase === "standard";
            const isTraining = w.phase === "training";
            const isHere = currentWeek === w.week;

            // Buddy/commission banner before Week 1
            const showBuddyBanner = w.week === 1;
            const pctToStandard = getPercentToStandard(w.daily);
            const conversions = getConversions(w.daily);
            const conversionValues = [
              { rate: conversions.revenuePerUnit, format: "currency" as const },
              { rate: conversions.meetingsToUnits, format: "pct" as const },
              { rate: conversions.bookingsToMeetings, format: "pct" as const },
              { rate: conversions.callsToBookings, format: "pct" as const },
            ];
            const arrowHexColor = isStandard ? PINK : w.phase === "maintain" ? MINT : w.phase === "solo" ? "#10b981" : w.phase === "training" ? "#60a5fa" : "#94a3b8";

            return (
              <div key={w.week}>
                {showBuddyBanner && (
                  <div className="mb-4 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🤝</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-amber-900 mb-2">Weeks 1–6: Buddy System</h3>
                        <p className="text-sm text-amber-800 mb-3">
                          You&#39;ll be paired with a senior team member for your first 6 weeks. They&#39;ll attend your meetings,
                          guide your pitch, and help you close. By Week 7, you should be cut loose and running independently.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="bg-white/70 rounded-lg p-3 border border-amber-200">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-amber-600">💰</span>
                              <span className="text-xs font-bold text-amber-900">Target Contribution</span>
                            </div>
                            <p className="text-xs text-amber-700">
                              While your buddy attends meetings, only <span className="font-bold">50%</span> of each deal counts towards your target.
                              It&#39;s in your best interest to reach proficiency and be cut loose by Week 7 so 100% of every deal counts towards your target.
                            </p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3 border border-amber-200">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-amber-600">⚠️</span>
                              <span className="text-xs font-bold text-amber-900">Don&#39;t Rush It</span>
                            </div>
                            <p className="text-xs text-amber-700">
                              Do not cut your buddy loose prematurely. Only go solo when you have <span className="font-bold">100% confidence</span> in
                              running the full meeting and close independently.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              <div
                className={`rounded-xl border-2 ${styles.border} ${styles.bg} p-5 transition-all shadow-sm ${
                  isStandard ? "shadow-lg shadow-pink-200/50" : w.phase === "solo" ? "shadow-lg shadow-emerald-200/50" : ""
                }`}
                style={isHere ? { boxShadow: `0 0 0 3px ${PINK}33`, outline: `2px solid ${PINK}`, outlineOffset: "2px" } : {}}
              >
                {isHere && (
                  <div className="mb-3">
                    <YouAreHereBadge />
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles.badge}`}>
                        {isTraining ? "TRAINING" : `WEEK ${w.week}`}
                      </span>
                      {w.label && (
                        <span className={`text-xs font-semibold`} style={{
                          color: isStandard ? PINK : w.phase === "maintain" ? "#0d9488" : w.phase === "solo" ? "#059669" : isTraining ? "#2563eb" : "#64748b"
                        }}>
                          {w.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{w.dateRange}</p>
                  </div>
                  {isStandard && <div className="text-3xl">🏆</div>}
                </div>

                {isTraining ? (
                  <div className="space-y-4">
                    {/* Two-phase layout */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Phase 1: Mon-Tue */}
                      <div className="rounded-lg border border-blue-200 bg-white/80 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">MON – TUE</span>
                          <span className="text-xs font-semibold text-blue-700">Onboarding</span>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">📋</span>
                            <div>
                              <p className="text-sm font-medium text-slate-800">Induction & Setup</p>
                              <p className="text-xs text-slate-500">Company intro, tech setup, software training</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">🎧</span>
                            <div>
                              <p className="text-sm font-medium text-slate-800">Customer Service Team</p>
                              <p className="text-xs text-slate-500">Understand the CS team — our unfair advantage</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">📚</span>
                            <div>
                              <p className="text-sm font-medium text-slate-800">Product Knowledge</p>
                              <p className="text-xs text-slate-500">Learn the products inside out before hitting the phones</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phase 2: Wed-Fri */}
                      <div className="rounded-lg border border-blue-300 bg-blue-50/80 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-700 text-white">WED – FRI</span>
                          <span className="text-xs font-semibold text-blue-700">Hitting the Phones</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-3">
                          Paired with a senior buddy — going call for call. Your buddy sets the pace, you match it.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">40</div>
                            <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Bookings</div>
                            <div className="text-[10px] text-blue-400 mt-0.5">between the pair</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">200</div>
                            <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Calls</div>
                            <div className="text-[10px] text-blue-400 mt-0.5">over 3 days</div>
                          </div>
                        </div>
                        <div className="mt-3 p-2 rounded bg-blue-100/60 border border-blue-200">
                          <p className="text-[11px] text-blue-800 text-center font-medium">
                            🎯 Target: ~67 calls/day each · ~13 bookings/day between you
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Training week link */}
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr 60px 1fr 60px 1fr 60px 1fr", alignItems: "center" }}>
                        {funnelMetrics.map((m, i) => {
                          const weeklyVal = weekly[m.key];
                          const dailyVal = daily[m.key];
                          const isZero = weeklyVal === 0;
                          const fmtWeekly = m.format === "currency" ? formatCurrency(weeklyVal) : formatNumber(weeklyVal);
                          const fmtDaily = m.format === "currency" ? formatCurrency(dailyVal) : formatNumber(dailyVal);
                          const isBuddy = w.buddyWeek === true;
                          // Show Rate is index 2 (between Meetings and Bookings) — hide for buddy weeks
                          const hideThisArrow = isBuddy && i === 2;

                          return (
                            <div key={m.key} className="contents">
                              <div className={`rounded-lg p-3 text-center ${styles.metricBg}`}>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-1">
                                  {m.label}
                                </div>
                                <div className={`text-lg font-bold ${isZero ? "text-slate-300" : styles.textColor}`}>
                                  {fmtWeekly}
                                </div>
                                <div className="text-[10px] text-slate-400">/ week</div>
                                <div className={`text-xs mt-0.5 ${isZero ? "text-slate-300" : styles.dailyColor}`}>
                                  {fmtDaily} / day
                                </div>
                                {isBuddy && m.key === "revenue" && weeklyVal > 0 && (
                                  <div className="mt-1 text-[10px] font-normal text-amber-600">
                                    50% put towards your<br />monthly target
                                  </div>
                                )}
                              </div>
                              {i < funnelMetrics.length - 1 && (
                                hideThisArrow ? (
                                  <div className="flex flex-col items-center justify-center">
                                    <svg className="w-5 h-5 rotate-180 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                ) : (
                                  <ConversionArrowLeft
                                    rate={conversionValues[i].rate}
                                    label={conversionLabelsMap[i]}
                                    format={conversionValues[i].format}
                                    color={arrowHexColor}
                                  />
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>



                      {isStandard && (
                        <div className="mt-3 p-2.5 rounded-lg border" style={{ backgroundColor: `${PINK}0D`, borderColor: `${PINK}33` }}>
                          <p className="text-xs font-medium text-center" style={{ color: PINK }}>
                            🎯 This is the benchmark. From this week onwards, these are your daily and weekly targets to maintain.
                          </p>
                        </div>
                      )}

                      {w.phase === "solo" && (
                        <div className="mt-3 p-2.5 rounded-lg border border-emerald-300 bg-emerald-50">
                          <p className="text-xs font-medium text-center text-emerald-700">
                            ✈️ First week flying solo — 100% of every deal now counts towards your target
                          </p>
                        </div>
                      )}

                      {w.phase === "maintain" && (
                        <div className="mt-3 flex items-center gap-2 justify-center">
                          <span className="text-xs font-medium" style={{ color: MINT }}>✓ Maintaining The Standard</span>
                        </div>
                      )}
                    </div>

                    <div className={`w-80 flex-shrink-0 rounded-lg p-4 border ${styles.takeawayBorder} ${styles.takeawayBg}`}>
                      <div className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-2">Key Takeaways</div>
                      <div className="space-y-2">
                        {w.takeaways.map((t, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full ${styles.takeawayDot} mt-1.5 flex-shrink-0`} />
                            <p className={`text-xs ${styles.takeawayText} leading-relaxed`}>{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>
            );
          })}
        </div>

        {/* Key Observations */}
        <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">💡 Key Observations</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: `${PINK}08`, borderColor: `${PINK}22` }}>
              <h4 className="font-semibold text-sm mb-2" style={{ color: PINK }}>📞 Calls Decrease as Meetings Increase</h4>
              <p className="text-sm text-slate-600">
                300 calls/week in Weeks 1–4, down to 200 by The Standard.
                Every meeting you add frees up call time — see the Rules of Thumb.
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: `${MINT}15`, borderColor: `${MINT}44` }}>
              <h4 className="font-semibold text-sm mb-2 text-teal-700">📈 Buddy System → Independence</h4>
              <p className="text-sm text-slate-600">
                Weeks 1–6 with buddy support (50% counts to target). Flying solo from Week 7 — 100% of every deal counts towards your target.
                The faster you reach proficiency, the sooner every deal fully counts towards your target.
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: `${MINT}15`, borderColor: `${MINT}44` }}>
              <h4 className="font-semibold text-sm mb-2 text-teal-700">🤝 50% Close Rate Throughout</h4>
              <p className="text-sm text-slate-600">
                Close rate holds at 50% from Week 1 onwards — your buddy ensures strong conversion early,
                and by Week 7 you maintain it independently. Every 2 meetings = 1 deal.
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: `${PINK}08`, borderColor: `${PINK}22` }}>
              <h4 className="font-semibold text-sm mb-2" style={{ color: PINK }}>💰 $500 Average Deal Value</h4>
              <p className="text-sm text-slate-600">
                Revenue per unit stays consistent at $500. Growth comes from closing more deals,
                not bigger deals — 1 deal per day is The Standard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function RoadmapPage() {
  return (
    <PasswordGate requireMaster>
      <RoadmapContent />
    </PasswordGate>
  );
}
