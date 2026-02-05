// app/roadmap/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

interface WeekData {
  week: number;
  dateRange: string;
  startDate: string; // ISO date string for the Monday of this week
  phase: "training" | "ramp" | "gold" | "maintain";
  label?: string;
  daily: {
    revenue: number;
    units: number;
    meetings: number;
    bookings: number;
    calls: number;
  };
}

const weeklyData: WeekData[] = [
  {
    week: 0,
    dateRange: "Mon 27 Jan – Fri 21 Feb",
    startDate: "2025-01-27",
    phase: "training",
    label: "Training Week",
    daily: { revenue: 0, units: 0, meetings: 0, bookings: 0, calls: 0 },
  },
  {
    week: 1,
    dateRange: "Mon 23 Feb – Fri 27 Feb",
    startDate: "2025-02-23",
    phase: "ramp",
    label: "First Week Out",
    daily: { revenue: 0, units: 0, meetings: 0.4, bookings: 3, calls: 60 },
  },
  {
    week: 2,
    dateRange: "Mon 2 Mar – Fri 6 Mar",
    startDate: "2025-03-02",
    phase: "ramp",
    daily: { revenue: 100, units: 0.2, meetings: 1.6, bookings: 3.2, calls: 50 },
  },
  {
    week: 3,
    dateRange: "Mon 9 Mar – Fri 13 Mar",
    startDate: "2025-03-09",
    phase: "ramp",
    label: "First Deals Expected",
    daily: { revenue: 200, units: 0.4, meetings: 1.6, bookings: 3.2, calls: 50 },
  },
  {
    week: 4,
    dateRange: "Mon 16 Mar – Fri 20 Mar",
    startDate: "2025-03-16",
    phase: "ramp",
    daily: { revenue: 300, units: 0.6, meetings: 2, bookings: 4, calls: 50 },
  },
  {
    week: 5,
    dateRange: "Mon 23 Mar – Fri 27 Mar",
    startDate: "2025-03-23",
    phase: "ramp",
    label: "Nearly There",
    daily: { revenue: 400, units: 0.8, meetings: 2, bookings: 4, calls: 40 },
  },
  {
    week: 6,
    dateRange: "Mon 30 Mar – Fri 3 Apr",
    startDate: "2025-03-30",
    phase: "gold",
    label: "⭐ Gold Standard",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
  },
  {
    week: 7,
    dateRange: "Mon 6 Apr – Fri 10 Apr",
    startDate: "2025-04-06",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
  },
  {
    week: 8,
    dateRange: "Mon 13 Apr – Fri 17 Apr",
    startDate: "2025-04-13",
    phase: "maintain",
    label: "Fully Operational",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
  },
];

const goldDaily = { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 };

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
    callsToBookings: daily.calls > 0 ? (daily.bookings / daily.calls) * 100 : 0,
    bookingsToMeetings: daily.bookings > 0 ? (daily.meetings / daily.bookings) * 100 : 0,
    meetingsToUnits: daily.meetings > 0 ? (daily.units / daily.meetings) * 100 : 0,
    revenuePerUnit: daily.units > 0 ? daily.revenue / daily.units : 0,
  };
}

function getPercentToGold(daily: WeekData["daily"]) {
  const revPct = goldDaily.revenue > 0 ? Math.min(100, (daily.revenue / goldDaily.revenue) * 100) : 100;
  const unitPct = goldDaily.units > 0 ? Math.min(100, (daily.units / goldDaily.units) * 100) : 100;
  const meetPct = Math.min(100, (daily.meetings / goldDaily.meetings) * 100);
  const bookPct = Math.min(100, (daily.bookings / goldDaily.bookings) * 100);
  const callPct = Math.min(100, Math.max(0, ((60 - daily.calls) / (60 - goldDaily.calls)) * 100));
  return Math.round((revPct + unitPct + meetPct + bookPct + callPct) / 5);
}

// Determine current week based on Adelaide time
function getCurrentWeek(): number {
  const now = new Date();
  // Convert to Adelaide time
  const adelaide = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Adelaide" }));
  
  // Check each week's start date (Sundays before the Monday)
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    const weekStart = new Date(weeklyData[i].startDate);
    // The "You are here" moves on the Sunday before (1 day before Monday)
    const activateDate = new Date(weekStart);
    activateDate.setDate(activateDate.getDate() - 1);
    
    if (adelaide >= activateDate) {
      return weeklyData[i].week;
    }
  }
  return 0;
}

function getPhaseStyles(phase: string) {
  switch (phase) {
    case "gold":
      return {
        border: "border-amber-400",
        bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
        badge: "bg-amber-500 text-white",
        metricBg: "bg-amber-100/60",
        textColor: "text-amber-700",
        dailyColor: "text-amber-500",
        arrowColor: "text-amber-400",
      };
    case "maintain":
      return {
        border: "border-emerald-300",
        bg: "bg-gradient-to-br from-emerald-50 to-green-50",
        badge: "bg-emerald-600 text-white",
        metricBg: "bg-emerald-100/60",
        textColor: "text-emerald-700",
        dailyColor: "text-emerald-500",
        arrowColor: "text-emerald-400",
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
      };
  }
}

const funnelMetrics = [
  { key: "calls" as const, label: "Calls", format: "number" },
  { key: "bookings" as const, label: "Bookings", format: "number" },
  { key: "meetings" as const, label: "Meetings", format: "number" },
  { key: "units" as const, label: "Units", format: "number" },
  { key: "revenue" as const, label: "Revenue", format: "currency" },
];

const conversionLabels = ["Call → Book", "Book → Meet", "Meet → Close", "Avg Deal"];

function ConversionArrow({ rate, label, format, phaseColor }: { rate: number; label: string; format: "pct" | "currency"; phaseColor: string }) {
  const display = format === "currency"
    ? (rate > 0 ? formatCurrency(rate) : "—")
    : (rate > 0 ? rate.toFixed(1) + "%" : "—");

  return (
    <div className="flex flex-col items-center justify-center px-1">
      <svg className={`w-4 h-4 ${phaseColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span className={`text-xs font-bold ${rate > 0 ? "text-slate-700" : "text-slate-300"} whitespace-nowrap`}>
        {display}
      </span>
      <span className="text-[9px] text-slate-400 whitespace-nowrap leading-tight">{label}</span>
    </div>
  );
}

function YouAreHereBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md shadow-blue-200 animate-pulse">
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
      YOU ARE HERE
    </div>
  );
}

function RoadmapContent() {
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const goldWeekly = getWeekly(goldDaily);
  const goldConversions = getConversions(goldDaily);

  useEffect(() => {
    setCurrentWeek(getCurrentWeek());
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Portal
            </Link>
            <Link
              href="/admin"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Admin Dashboard →
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Our Standards
          </h1>
          <p className="text-lg sm:text-xl text-amber-400 font-semibold mt-2">
            The Roadmap to Achieving 1 Deal Per Day
          </p>
          <p className="text-slate-400 mt-3 max-w-2xl">
            Weeks 1–4 are onboarding &amp; training. This roadmap covers your first 8 weeks in the field, building up to the Gold Standard by Week 6.
          </p>
        </div>
      </header>

      {/* Gold Standard Summary */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-amber-200/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⭐</span>
            <h2 className="text-xl font-bold">The Gold Standard — Week 6 Target</h2>
          </div>
          <p className="text-amber-100 text-sm mb-6">
            From Week 6 onwards — these are your targets to maintain
          </p>

          {/* Gold Funnel */}
          <div className="flex items-center justify-between">
            {funnelMetrics.map((m, i) => (
              <div key={m.key} className="flex items-center">
                <div className="bg-white/15 backdrop-blur rounded-xl p-3 sm:p-4 text-center min-w-[80px]">
                  <div className="text-[10px] text-amber-200 uppercase tracking-wide font-semibold mb-1">{m.label}</div>
                  <div className="text-lg sm:text-xl font-bold">
                    {m.format === "currency" ? formatCurrency(goldWeekly[m.key]) : formatNumber(goldWeekly[m.key])}
                  </div>
                  <div className="text-[10px] text-amber-200">/ week</div>
                  <div className="text-xs text-white/70 mt-0.5">
                    {m.format === "currency" ? formatCurrency(goldDaily[m.key]) : formatNumber(goldDaily[m.key])}
                    <span className="text-[10px]"> / day</span>
                  </div>
                </div>
                {i < funnelMetrics.length - 1 && (
                  <div className="flex flex-col items-center mx-1 sm:mx-2">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[10px] font-bold text-white/90">
                      {i === 3 ? formatCurrency(goldConversions.revenuePerUnit) : [
                        goldConversions.callsToBookings,
                        goldConversions.bookingsToMeetings,
                        goldConversions.meetingsToUnits,
                      ][i].toFixed(0) + "%"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Cards - Stacked */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-4">
          {weeklyData.map((w) => {
            const styles = getPhaseStyles(w.phase);
            const weekly = getWeekly(w.daily);
            const daily = w.daily;
            const isGold = w.phase === "gold";
            const isTraining = w.phase === "training";
            const isHere = currentWeek === w.week;
            const pctToGold = getPercentToGold(w.daily);
            const conversions = getConversions(w.daily);
            const conversionValues = [
              { rate: conversions.callsToBookings, format: "pct" as const },
              { rate: conversions.bookingsToMeetings, format: "pct" as const },
              { rate: conversions.meetingsToUnits, format: "pct" as const },
              { rate: conversions.revenuePerUnit, format: "currency" as const },
            ];

            return (
              <div
                key={w.week}
                className={`rounded-xl border-2 ${styles.border} ${styles.bg} p-5 transition-all shadow-sm ${
                  isGold ? "shadow-lg shadow-amber-200/50" : ""
                } ${isHere ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
              >
                {/* You Are Here Badge */}
                {isHere && (
                  <div className="mb-3">
                    <YouAreHereBadge />
                  </div>
                )}

                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles.badge}`}>
                        {isTraining ? "TRAINING" : `WEEK ${w.week}`}
                      </span>
                      {w.label && (
                        <span className={`text-xs font-semibold ${
                          isGold ? "text-amber-600" :
                          w.phase === "maintain" ? "text-emerald-600" :
                          isTraining ? "text-blue-600" : "text-slate-500"
                        }`}>
                          {w.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{w.dateRange}</p>
                  </div>
                  {isGold && <div className="text-3xl">🏆</div>}
                </div>

                {/* Training Week - special content */}
                {isTraining && (
                  <div className="bg-blue-100/60 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3">
                      Complete your onboarding modules before heading into the field. This is your foundation.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      See the training schedule
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}

                {/* Funnel Metrics - for non-training weeks */}
                {!isTraining && (
                  <>
                    <div className="flex items-stretch justify-between">
                      {funnelMetrics.map((m, i) => {
                        const weeklyVal = weekly[m.key];
                        const dailyVal = daily[m.key];
                        const isZero = weeklyVal === 0;
                        const fmtWeekly = m.format === "currency" ? formatCurrency(weeklyVal) : formatNumber(weeklyVal);
                        const fmtDaily = m.format === "currency" ? formatCurrency(dailyVal) : formatNumber(dailyVal);

                        return (
                          <div key={m.key} className="flex items-center flex-1">
                            <div className={`rounded-lg p-3 text-center w-full ${styles.metricBg}`}>
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
                              <ConversionArrow
                                rate={conversionValues[i].rate}
                                label={conversionLabels[i]}
                                format={conversionValues[i].format}
                                phaseColor={styles.arrowColor}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress indicator for ramp weeks */}
                    {w.phase === "ramp" && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-slate-400 to-amber-400 rounded-full transition-all"
                            style={{ width: `${pctToGold}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          {pctToGold}% to Gold
                        </span>
                      </div>
                    )}

                    {isGold && (
                      <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800 font-medium text-center">
                          🎯 This is the benchmark. From this week onwards, these are your daily and weekly targets to maintain.
                        </p>
                      </div>
                    )}

                    {w.phase === "maintain" && (
                      <div className="mt-3 flex items-center gap-2 justify-center">
                        <span className="text-xs text-emerald-600 font-medium">✓ Maintaining Gold Standard</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Key Insights */}
        <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Key Observations</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Calls Decrease, Efficiency Increases</h4>
              <p className="text-sm text-blue-700">
                You start at 300 calls/week but drop to 200 by Gold Standard.
                Your call-to-booking rate improves from 5% to 10% — fewer calls, better results.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 text-sm mb-2">Booking-to-Meeting Rate Jumps</h4>
              <p className="text-sm text-purple-700">
                In Week 1, only 13% of bookings become attended meetings.
                By Week 2 this jumps to 50% and holds — your qualification improves fast.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-semibold text-amber-900 text-sm mb-2">Close Rate Builds Steadily</h4>
              <p className="text-sm text-amber-700">
                Your meeting-to-close rate grows from 0% (building pipeline) to 50% at Gold Standard.
                This is where experience and product knowledge pay off.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <h4 className="font-semibold text-emerald-900 text-sm mb-2">$500 Average Deal Value</h4>
              <p className="text-sm text-emerald-700">
                Revenue per unit stays consistent at $500. The growth comes from closing more deals,
                not bigger deals — 1 deal per day is the Gold Standard.
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
