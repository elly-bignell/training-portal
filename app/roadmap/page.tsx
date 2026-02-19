// app/roadmap/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

interface WeekData {
  week: number;
  dateRange: string;
  startDate: string;
  phase: "training" | "ramp" | "standard" | "maintain";
  label?: string;
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
    daily: { revenue: 0, units: 0, meetings: 1, bookings: 7, calls: 70 },
    takeaways: [
      "60–80 calls/day depending on cut-through — volume is everything this week",
      "Minimum 7 bookings/day — you're booking out your buddy's calendar",
      "1 meeting/day observing your buddy — watch how they run the call",
      "No revenue expected — this is about building pipeline and learning the process",
    ],
  },
  {
    week: 2,
    dateRange: "Mon 2 Mar – Fri 6 Mar",
    startDate: "2026-03-02",
    phase: "ramp",
    label: "Building Pipeline",
    daily: { revenue: 0, units: 0, meetings: 1, bookings: 7, calls: 70 },
    takeaways: [
      "Same rhythm as Week 1 — 60–80 calls, 7 bookings/day minimum",
      "1 meeting/day observing — you should be picking up the structure and pitch",
      "Your pipeline is growing — the meetings you're booking now pay off in Week 3+",
      "Buddy is still leading meetings — focus on learning, not closing",
    ],
  },
  {
    week: 3,
    dateRange: "Mon 9 Mar – Fri 13 Mar",
    startDate: "2026-03-09",
    phase: "ramp",
    label: "Stepping Up",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 50 },
    takeaways: [
      "50 calls/day — meetings are taking more of your time now",
      "5 bookings/day minimum — efficiency improving as your pitch sharpens",
      "2 meetings/day — you start leading the call with buddy support",
      "50% close rate expected — 10 meetings/week → 5 deals → $2,500/week",
      "Commission is 50/50 while buddy attends — $1,250 each",
    ],
  },
  {
    week: 4,
    dateRange: "Mon 16 Mar – Fri 20 Mar",
    startDate: "2026-03-16",
    phase: "ramp",
    label: "Final Buddy Week",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 50 },
    takeaways: [
      "Same as Week 3 — 50 calls, 5 bookings, 2 meetings/day",
      "50% close rate → 5 deals/week → $2,500 (split 50/50 with buddy)",
      "This is your last week with buddy support — prove you can run the full meeting",
      "Don't cut your buddy prematurely — only go solo with 100% confidence",
    ],
  },
  {
    week: 5,
    dateRange: "Mon 23 Mar – Fri 27 Mar",
    startDate: "2026-03-23",
    phase: "ramp",
    label: "Nearly There",
    daily: { revenue: 400, units: 0.8, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "You're flying solo now — buddy is cut loose, 100% commission is yours",
      "40 calls/day, 4 bookings — call-to-book rate hits 10%, double Week 1",
      "Close rate at 40% — nearly at The Standard",
      "Prove you can maintain the rhythm independently — Week 6 is the benchmark",
    ],
  },
  {
    week: 6,
    dateRange: "Mon 30 Mar – Fri 3 Apr",
    startDate: "2026-03-30",
    phase: "standard",
    label: "🎯 The Standard",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "1 deal per day — this is the benchmark you maintain from here",
      "10% call-to-book, 50% show rate, 50% close rate — every metric is optimised",
      "33% fewer calls than Week 1, but 5x the revenue — efficiency wins",
    ],
  },
  {
    week: 7,
    dateRange: "Mon 6 Apr – Fri 10 Apr",
    startDate: "2026-04-06",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "Consistency is the challenge now — same discipline, same results",
      "Build habits that make this your new normal",
      "Trust the process — the numbers don't lie",
    ],
  },
  {
    week: 8,
    dateRange: "Mon 13 Apr – Fri 17 Apr",
    startDate: "2026-04-13",
    phase: "maintain",
    label: "Fully Operational",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "Your commission is uncapped — focus shifts to output over input",
      "5 deals/week minimum, achieved however you see fit with the inputs you choose",
      "Find your flow — 1 call = 1 deal should always be the goal",
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
  const callPct = Math.min(100, Math.max(0, ((60 - daily.calls) / (60 - standardDaily.calls)) * 100));
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
        bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
        badge: "bg-slate-700 text-white",
        metricBg: "bg-teal-100/60",
        textColor: "text-teal-700",
        dailyColor: "text-teal-500",
        arrowColor: `text-[${MINT}]`,
        takeawayBg: "bg-teal-50",
        takeawayBorder: "border-teal-200",
        takeawayText: "text-teal-800",
        takeawayDot: `bg-[${MINT}]`,
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
            This roadmap covers your first 8 weeks in the field, building up to The Standard by Week 6.
          </p>
        </div>
      </header>

      {/* The Standard Summary */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="rounded-2xl p-6 sm:p-8 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${PINK} 0%, #ff4da6 100%)` }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-bold">The Standard — Week 6 Target</h2>
          </div>
          <p className="text-pink-200 text-sm mb-6">From Week 6 onwards — these are your targets to maintain</p>

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
            const arrowHexColor = isStandard ? PINK : w.phase === "maintain" ? MINT : w.phase === "training" ? "#60a5fa" : "#94a3b8";

            return (
              <div key={w.week}>
                {showBuddyBanner && (
                  <div className="mb-4 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🤝</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-amber-900 mb-2">Weeks 1–4: Buddy System</h3>
                        <p className="text-sm text-amber-800 mb-3">
                          You&#39;ll be paired with a senior team member for your first 4 weeks. They&#39;ll attend your meetings,
                          guide your pitch, and help you close. By Week 5, you should be cut loose and running independently.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="bg-white/70 rounded-lg p-3 border border-amber-200">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-amber-600">💰</span>
                              <span className="text-xs font-bold text-amber-900">Commission Split</span>
                            </div>
                            <p className="text-xs text-amber-700">
                              While your buddy attends your meetings, commission is split <span className="font-bold">50/50</span>.
                              It&#39;s in your best interest to reach 100% proficiency and be cut loose by Week 5.
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
                  isStandard ? "shadow-lg shadow-pink-200/50" : ""
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
                          color: isStandard ? PINK : w.phase === "maintain" ? "#0d9488" : isTraining ? "#2563eb" : "#64748b"
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
                    <div className="flex items-center justify-between">
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        See the training schedule
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <p className="text-xs text-slate-400">
                        Complete all training modules before Week 1
                      </p>
                    </div>
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
                              </div>
                              {i < funnelMetrics.length - 1 && (
                                <ConversionArrowLeft
                                  rate={conversionValues[i].rate}
                                  label={conversionLabelsMap[i]}
                                  format={conversionValues[i].format}
                                  color={arrowHexColor}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {w.phase === "ramp" && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pctToStandard}%`, background: `linear-gradient(to right, ${MINT}, ${PINK})` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                            {pctToStandard}% to Standard
                          </span>
                        </div>
                      )}

                      {isStandard && (
                        <div className="mt-3 p-2.5 rounded-lg border" style={{ backgroundColor: `${PINK}0D`, borderColor: `${PINK}33` }}>
                          <p className="text-xs font-medium text-center" style={{ color: PINK }}>
                            🎯 This is the benchmark. From this week onwards, these are your daily and weekly targets to maintain.
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
                            <div className={`w-1.5 h-1.5 rounded-full ${styles.takeawayDot} mt-1.5 flex-shrink-0`} />
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
              <h4 className="font-semibold text-sm mb-2" style={{ color: PINK }}>📞 Calls Decrease, Efficiency Increases</h4>
              <p className="text-sm text-slate-600">
                300 calls/week down to 200 by The Standard.
                Call-to-booking rate doubles from 5% to 10% — fewer calls, better results.
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: `${MINT}15`, borderColor: `${MINT}44` }}>
              <h4 className="font-semibold text-sm mb-2 text-teal-700">📈 Show Rate Jumps After Week 1</h4>
              <p className="text-sm text-slate-600">
                Week 1 is about filling the pipe — only 13% of bookings attend.
                From Week 2 onwards, 50% show rate holds as your pipeline quality improves.
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: `${MINT}15`, borderColor: `${MINT}44` }}>
              <h4 className="font-semibold text-sm mb-2 text-teal-700">🤝 Close Rate Builds Steadily</h4>
              <p className="text-sm text-slate-600">
                Meeting-to-close rate grows from 0% to 50% at The Standard.
                Experience and product knowledge compound — each week you get sharper.
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
