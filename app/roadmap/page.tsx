// app/roadmap/page.tsx

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

interface WeekData {
  week: number;
  overallWeek: number;
  dateRange: string;
  phase: "ramp" | "gold" | "maintain";
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
    week: 1,
    overallWeek: 5,
    dateRange: "Mon 23 Feb – Fri 27 Feb",
    phase: "ramp",
    label: "First Week Out",
    daily: { revenue: 0, units: 0, meetings: 0.4, bookings: 3, calls: 60 },
  },
  {
    week: 2,
    overallWeek: 6,
    dateRange: "Mon 2 Mar – Fri 6 Mar",
    phase: "ramp",
    daily: { revenue: 100, units: 0.2, meetings: 1.6, bookings: 3.2, calls: 50 },
  },
  {
    week: 3,
    overallWeek: 7,
    dateRange: "Mon 9 Mar – Fri 13 Mar",
    phase: "ramp",
    label: "First Deals Expected",
    daily: { revenue: 200, units: 0.4, meetings: 1.6, bookings: 3.2, calls: 50 },
  },
  {
    week: 4,
    overallWeek: 8,
    dateRange: "Mon 16 Mar – Fri 20 Mar",
    phase: "ramp",
    daily: { revenue: 300, units: 0.6, meetings: 2, bookings: 4, calls: 50 },
  },
  {
    week: 5,
    overallWeek: 9,
    dateRange: "Mon 23 Mar – Fri 27 Mar",
    phase: "ramp",
    label: "Nearly There",
    daily: { revenue: 400, units: 0.8, meetings: 2, bookings: 4, calls: 40 },
  },
  {
    week: 6,
    overallWeek: 10,
    dateRange: "Mon 30 Mar – Fri 3 Apr",
    phase: "gold",
    label: "⭐ Gold Standard",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
  },
  {
    week: 7,
    overallWeek: 11,
    dateRange: "Mon 6 Apr – Fri 10 Apr",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
  },
  {
    week: 8,
    overallWeek: 12,
    dateRange: "Mon 13 Apr – Fri 17 Apr",
    phase: "maintain",
    label: "Fully Operational",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
  },
];

// Gold standard daily values for % calculation
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

// Calculate % to gold based on average of all metrics (excluding calls which decrease)
function getPercentToGold(daily: WeekData["daily"]) {
  // For revenue & units: higher = better (% of gold target)
  const revPct = goldDaily.revenue > 0 ? Math.min(100, (daily.revenue / goldDaily.revenue) * 100) : 100;
  const unitPct = goldDaily.units > 0 ? Math.min(100, (daily.units / goldDaily.units) * 100) : 100;
  const meetPct = Math.min(100, (daily.meetings / goldDaily.meetings) * 100);
  const bookPct = Math.min(100, (daily.bookings / goldDaily.bookings) * 100);
  // For calls: lower is better (they ramp down), so we invert
  // At 60 calls (max) = 0% progress, at 40 calls (gold) = 100% progress
  const callPct = Math.min(100, Math.max(0, ((60 - daily.calls) / (60 - goldDaily.calls)) * 100));

  return Math.round((revPct + unitPct + meetPct + bookPct + callPct) / 5);
}

// Phase colors
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
      };
    case "maintain":
      return {
        border: "border-emerald-300",
        bg: "bg-gradient-to-br from-emerald-50 to-green-50",
        badge: "bg-emerald-600 text-white",
        metricBg: "bg-emerald-100/60",
        textColor: "text-emerald-700",
        dailyColor: "text-emerald-500",
      };
    default:
      return {
        border: "border-slate-200",
        bg: "bg-white",
        badge: "bg-slate-600 text-white",
        metricBg: "bg-slate-50",
        textColor: "text-slate-800",
        dailyColor: "text-slate-400",
      };
  }
}

const metricLabels = [
  { key: "revenue" as const, label: "Revenue", format: "currency" },
  { key: "units" as const, label: "Units", format: "number" },
  { key: "meetings" as const, label: "Meetings", format: "number" },
  { key: "bookings" as const, label: "Bookings", format: "number" },
  { key: "calls" as const, label: "Calls", format: "number" },
];

function RoadmapContent() {
  const goldWeekly = getWeekly(goldDaily);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
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
            Weeks 1–4 are onboarding &amp; training. This roadmap covers Weeks 5–12: 
            your first 8 weeks in the field, building up to the Gold Standard by Week 6.
          </p>
        </div>
      </header>

      {/* Gold Standard Summary */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-amber-200/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⭐</span>
            <h2 className="text-xl font-bold">The Gold Standard — Week 6 Target</h2>
          </div>
          <p className="text-amber-100 text-sm mb-6">
            From Week 6 (Week 10 overall) onwards — these are your targets to maintain
          </p>
          <div className="grid grid-cols-5 gap-4">
            {metricLabels.map((m) => (
              <div key={m.key} className="bg-white/15 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-xs text-amber-200 uppercase tracking-wide font-semibold mb-2">{m.label}</div>
                <div className="text-xl sm:text-2xl font-bold">
                  {m.format === "currency" ? formatCurrency(goldWeekly[m.key]) : formatNumber(goldWeekly[m.key])}
                </div>
                <div className="text-xs text-amber-200 mt-1">/ week</div>
                <div className="text-sm text-white/70 mt-1">
                  {m.format === "currency" ? formatCurrency(goldDaily[m.key]) : formatNumber(goldDaily[m.key])}
                  <span className="text-xs"> / day</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="max-w-6xl mx-auto px-4 mt-10 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            8-Week Progression
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Ramp Up
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Gold Standard
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Maintain
            </span>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="relative mb-8">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-slate-400 via-amber-500 to-emerald-500 rounded-full" style={{ width: "100%" }} />
          </div>
          <div className="flex justify-between mt-2">
            {weeklyData.map((w) => (
              <div key={w.week} className="flex flex-col items-center" style={{ width: `${100 / 8}%` }}>
                <div className={`w-4 h-4 rounded-full border-2 border-white -mt-5 shadow ${
                  w.phase === "gold" ? "bg-amber-500 ring-2 ring-amber-300" : 
                  w.phase === "maintain" ? "bg-emerald-500" : "bg-slate-400"
                }`} />
                <span className={`text-xs mt-1 font-medium ${
                  w.phase === "gold" ? "text-amber-600" : "text-slate-500"
                }`}>
                  Wk {w.week}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyData.map((w) => {
            const styles = getPhaseStyles(w.phase);
            const weekly = getWeekly(w.daily);
            const daily = w.daily;
            const isGold = w.phase === "gold";
            const pctToGold = getPercentToGold(w.daily);

            return (
              <div
                key={w.week}
                className={`rounded-xl border-2 ${styles.border} ${styles.bg} p-5 transition-all ${
                  isGold ? "md:col-span-2 shadow-lg shadow-amber-200/50" : "shadow-sm"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles.badge}`}>
                        WEEK {w.week}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        (Week {w.overallWeek} overall)
                      </span>
                      {w.label && (
                        <span className={`text-xs font-semibold ${
                          isGold ? "text-amber-600" : 
                          w.phase === "maintain" ? "text-emerald-600" : "text-slate-500"
                        }`}>
                          {w.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{w.dateRange}</p>
                  </div>
                  {isGold && (
                    <div className="text-3xl">🏆</div>
                  )}
                </div>

                {/* Metrics Grid - Weekly prominent, daily underneath */}
                <div className="grid grid-cols-5 gap-3">
                  {metricLabels.map((m) => {
                    const weeklyVal = weekly[m.key];
                    const dailyVal = daily[m.key];
                    const isZero = weeklyVal === 0;
                    const fmtWeekly = m.format === "currency" ? formatCurrency(weeklyVal) : formatNumber(weeklyVal);
                    const fmtDaily = m.format === "currency" ? formatCurrency(dailyVal) : formatNumber(dailyVal);

                    return (
                      <div key={m.key} className={`rounded-lg p-3 text-center ${styles.metricBg}`}>
                        <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">
                          {m.label}
                        </div>
                        <div className={`text-lg font-bold ${isZero ? "text-slate-300" : styles.textColor}`}>
                          {fmtWeekly}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">/ week</div>
                        <div className={`text-xs mt-1 ${isZero ? "text-slate-300" : styles.dailyColor}`}>
                          {fmtDaily} / day
                        </div>
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
              </div>
            );
          })}
        </div>

        {/* Key Insights */}
        <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Key Observations</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Calls Decrease Over Time</h4>
              <p className="text-sm text-blue-700">
                You start at 300 calls/week and work down to 200. As your pipeline builds and meetings increase, 
                you spend less time on the phone and more time closing.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 text-sm mb-2">Bookings Stay Consistent</h4>
              <p className="text-sm text-purple-700">
                Bookings remain steady at 15–20 per week throughout. The difference is your conversion rate 
                improves — more bookings turn into attended meetings.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-semibold text-amber-900 text-sm mb-2">Meetings Ramp Steadily</h4>
              <p className="text-sm text-amber-700">
                From 2 meetings per week in Week 1 to 10 per week by Gold Standard. 
                This is the engine that drives your deals.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <h4 className="font-semibold text-emerald-900 text-sm mb-2">Revenue Is the Result</h4>
              <p className="text-sm text-emerald-700">
                $0 in Week 1 is expected — you&apos;re building pipeline. By Week 6, $2,500/week 
                becomes your sustainable standard.
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
