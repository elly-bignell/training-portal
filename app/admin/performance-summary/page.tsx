// app/admin/performance-summary/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import PasswordGate from "@/components/PasswordGate";
import { usePersistedState } from "@/hooks/usePersistedState";

// ─── Types ───
interface DailyRecord {
  date: string;
  calls_made: number;
  calls: number;
  bookings: number;
  meetings: number;
  units: number;
  revenue: number;
}

type Metric = "calls_made" | "calls" | "bookings" | "meetings" | "units" | "revenue";

// ─── Projection defaults (must match projections page) ───
const DEFAULT_CALLS_PER_HOUR = 18;
const DEFAULT_CONNECTS_PER_HOUR = 10;
const DEFAULT_BOOKINGS_PER_HOUR = 1.5;
const DEFAULT_ATTENDANCE_RATE = 0.5;
const DEFAULT_CLOSE_RATE = 0.5;
const DEFAULT_HOURS = 3.5;
const DEFAULT_DEAL_VALUE = 400;

// ─── Buddy pairs ───
const buddyPairs = [
  { label: "Lucas & Cindy", color: "indigo", members: ["lucas-tirri", "cindy-rose-rondez-manrique"] },
  { label: "Felipe & Connie", color: "pink", members: ["felipe-garcia", "connie-matthews"] },
  { label: "Dylan & Krishna", color: "amber", members: ["dylan-munro", "krishna-patel"] },
  { label: "Tom", color: "slate", members: ["thomas-rennie"] },
];

const allSlugs = buddyPairs.flatMap((p) => p.members);

// ─── Metrics we compare ───
const compMetrics: { key: Metric; label: string; emoji: string; projKey: string }[] = [
  { key: "calls_made", label: "Calls", emoji: "📞", projKey: "calls" },
  { key: "calls", label: "Connected", emoji: "🔗", projKey: "connects" },
  { key: "bookings", label: "Bookings", emoji: "📅", projKey: "bookings" },
  { key: "meetings", label: "Meetings", emoji: "🤝", projKey: "attended" },
  { key: "units", label: "Deals", emoji: "🏆", projKey: "deals" },
  { key: "revenue", label: "Revenue", emoji: "💰", projKey: "revenue" },
];

// ─── Week configs (same as performance page) ───
const weekConfig: Record<number, { start: string; label: string; shortLabel: string }> = {
  0: { start: "2026-02-16", label: "Training Week", shortLabel: "TW" },
  1: { start: "2026-02-23", label: "Week 1", shortLabel: "W1" },
  2: { start: "2026-03-02", label: "Week 2", shortLabel: "W2" },
  3: { start: "2026-03-09", label: "Week 3", shortLabel: "W3" },
  4: { start: "2026-03-16", label: "Week 4", shortLabel: "W4" },
  5: { start: "2026-03-23", label: "Week 5", shortLabel: "W5" },
  6: { start: "2026-03-30", label: "Week 6", shortLabel: "W6" },
  7: { start: "2026-04-06", label: "Week 7", shortLabel: "W7" },
  8: { start: "2026-04-13", label: "Week 8", shortLabel: "W8" },
};

function getWeekDates(weekNum: number): string[] {
  const startStr = weekConfig[weekNum]?.start || "2026-02-16";
  const [y, m, d] = startStr.split("-").map(Number);
  return Array.from({ length: 5 }, (_, i) => {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    return dt.toISOString().split("T")[0];
  });
}

function getCurrentWeek(): number {
  const now = new Date();
  for (let i = 8; i >= 0; i--) {
    const start = new Date(weekConfig[i].start);
    if (now >= start) return i;
  }
  return 0;
}

function getWorkingDaysElapsed(weekNum: number): number {
  const dates = getWeekDates(weekNum);
  const now = new Date();
  const currentWeek = getCurrentWeek();
  if (weekNum < currentWeek) return 5;
  if (weekNum > currentWeek) return 0;
  let count = 0;
  for (const d of dates) {
    if (new Date(d + "T23:59:59") <= now) count++;
  }
  return Math.max(count, 1);
}

function getShortName(slug: string): string {
  const t = trainees.find((t) => t.slug === slug);
  if (!t) return slug;
  return t.name.split(" ")[0];
}

function fmtVal(v: number, metric: Metric): string {
  if (metric === "revenue") return v >= 0 ? `$${Math.round(v).toLocaleString()}` : `-$${Math.abs(Math.round(v)).toLocaleString()}`;
  if (metric === "units") return v % 1 !== 0 ? v.toFixed(1) : v.toString();
  return Math.round(v).toString();
}

function fmtVar(v: number, metric: Metric): string {
  const prefix = v >= 0 ? "+" : "";
  if (metric === "revenue") return v >= 0 ? `+$${Math.round(v).toLocaleString()}` : `-$${Math.abs(Math.round(v)).toLocaleString()}`;
  if (metric === "units") return v % 1 !== 0 ? `${prefix}${v.toFixed(1)}` : `${prefix}${v}`;
  return `${prefix}${Math.round(v)}`;
}

function pctOf(actual: number, projected: number): number {
  if (projected === 0) return actual > 0 ? 999 : 0;
  return (actual / projected) * 100;
}

// ─── Traffic light ───
function trafficLight(pct: number): { bg: string; text: string; label: string; dot: string } {
  if (pct >= 100) return { bg: "bg-emerald-50", text: "text-emerald-700", label: "On Track", dot: "bg-emerald-500" };
  if (pct >= 75) return { bg: "bg-amber-50", text: "text-amber-700", label: "Behind", dot: "bg-amber-500" };
  return { bg: "bg-red-50", text: "text-red-600", label: "Off Track", dot: "bg-red-500" };
}

// ─── Trend arrow ───
function trendArrow(thisWeekPct: number, lastWeekPct: number | null): { icon: string; label: string; color: string } {
  if (lastWeekPct === null) return { icon: "—", label: "First week", color: "text-gray-400" };
  const diff = thisWeekPct - lastWeekPct;
  if (diff > 5) return { icon: "↑", label: "Improving", color: "text-emerald-600" };
  if (diff < -5) return { icon: "↓", label: "Slipping", color: "text-red-500" };
  return { icon: "→", label: "Steady", color: "text-gray-500" };
}

// ─── Color configs ───
const teamColors: Record<string, { header: string; light: string; accent: string; border: string }> = {
  indigo: { header: "bg-indigo-600", light: "bg-indigo-50", accent: "text-indigo-700", border: "border-indigo-200" },
  pink: { header: "bg-pink-600", light: "bg-pink-50", accent: "text-pink-700", border: "border-pink-200" },
  amber: { header: "bg-amber-500", light: "bg-amber-50", accent: "text-amber-700", border: "border-amber-200" },
  slate: { header: "bg-slate-600", light: "bg-slate-50", accent: "text-slate-700", border: "border-slate-200" },
};

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

function PerformanceSummaryContent() {
  const [allData, setAllData] = useState<Map<string, DailyRecord[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Read projections from localStorage (same keys as /projections)
  const [phoneHours] = usePersistedState("proj-phoneHours", DEFAULT_HOURS);
  const [callsPerHour] = usePersistedState("proj-callsPerHour", DEFAULT_CALLS_PER_HOUR);
  const [connectsPerHour] = usePersistedState("proj-connectsPerHour", DEFAULT_CONNECTS_PER_HOUR);
  const [bookingsPerHour] = usePersistedState("proj-bookingsPerHour", DEFAULT_BOOKINGS_PER_HOUR);
  const [attendanceRate] = usePersistedState("proj-attendanceRate", DEFAULT_ATTENDANCE_RATE);
  const [closeRate] = usePersistedState("proj-closeRate", DEFAULT_CLOSE_RATE);
  const [dealValue] = usePersistedState("proj-dealValue", DEFAULT_DEAL_VALUE);

  const currentWeek = getCurrentWeek();

  // Per-person daily projections
  const projPerPersonDaily = useMemo(() => {
    const dailyBookings = phoneHours * bookingsPerHour;
    const dailyAttended = dailyBookings * attendanceRate;
    const dailyDeals = dailyAttended * closeRate;
    return {
      calls: phoneHours * callsPerHour,
      connects: phoneHours * connectsPerHour,
      bookings: dailyBookings,
      attended: dailyAttended,
      deals: dailyDeals,
      revenue: dailyDeals * dealValue,
    };
  }, [phoneHours, callsPerHour, connectsPerHour, bookingsPerHour, attendanceRate, closeRate, dealValue]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      const dataMap = new Map<string, DailyRecord[]>();
      await Promise.all(
        allSlugs.map(async (slug) => {
          try {
            const res = await fetch(`/api/activity/all?trainee_slug=${slug}`);
            const json = await res.json();
            dataMap.set(slug, json.records || []);
          } catch {
            dataMap.set(slug, []);
          }
        })
      );
      setAllData(dataMap);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  const getValue = (slug: string, date: string, metric: Metric): number => {
    const records = allData.get(slug) || [];
    const rec = records.find((r) => r.date === date);
    if (!rec) return 0;
    return (rec as any)[metric] || 0;
  };

  const getTeamWeekTotal = (members: string[], weekNum: number, metric: Metric): number => {
    const dates = getWeekDates(weekNum);
    return members.reduce((sum, slug) => {
      return sum + dates.reduce((s, d) => s + getValue(slug, d, metric), 0);
    }, 0);
  };

  const getPersonWeekTotal = (slug: string, weekNum: number, metric: Metric): number => {
    const dates = getWeekDates(weekNum);
    return dates.reduce((sum, d) => sum + getValue(slug, d, metric), 0);
  };

  // Get projected weekly total for a team
  const getTeamWeeklyProjected = (memberCount: number, weekNum: number, projKey: string): number => {
    const daysElapsed = weekNum < currentWeek ? 5 : getWorkingDaysElapsed(weekNum);
    const perPersonDaily = (projPerPersonDaily as any)[projKey] || 0;
    return perPersonDaily * memberCount * daysElapsed;
  };

  // Build weekly scorecard data per team
  const teamScorecards = useMemo(() => {
    const weeksToShow = Array.from({ length: currentWeek + 1 }, (_, i) => i);

    return buddyPairs.map((pair) => {
      const weekData = weeksToShow.map((weekNum) => {
        const daysElapsed = weekNum < currentWeek ? 5 : getWorkingDaysElapsed(weekNum);
        const metricData = compMetrics.map((m) => {
          const actual = getTeamWeekTotal(pair.members, weekNum, m.key);
          const projected = getTeamWeeklyProjected(pair.members.length, weekNum, m.projKey);
          const pct = pctOf(actual, projected);
          const variance = actual - projected;
          return { ...m, actual, projected, pct, variance, daysElapsed };
        });

        // Overall score: average of all metric percentages (weighted towards bookings/deals/revenue)
        const weights: Record<string, number> = { calls_made: 0.5, calls: 0.5, bookings: 2, meetings: 1.5, units: 2, revenue: 2.5 };
        const weightedSum = metricData.reduce((s, md) => s + md.pct * (weights[md.key] || 1), 0);
        const totalWeight = metricData.reduce((s, md) => s + (weights[md.key] || 1), 0);
        const overallPct = totalWeight > 0 ? weightedSum / totalWeight : 0;

        return { weekNum, daysElapsed, metricData, overallPct };
      });

      // Trends: compare each week's overall % to previous
      const weekDataWithTrend = weekData.map((wd, idx) => {
        const prevPct = idx > 0 ? weekData[idx - 1].overallPct : null;
        const trend = trendArrow(wd.overallPct, prevPct);
        return { ...wd, trend };
      });

      // Per-person breakdown for current week
      const personBreakdown = pair.members.map((slug) => {
        const data = compMetrics.map((m) => {
          const actual = getPersonWeekTotal(slug, currentWeek, m.key);
          const daysElapsed = getWorkingDaysElapsed(currentWeek);
          const projected = (projPerPersonDaily as any)[m.projKey] * daysElapsed;
          const pct = pctOf(actual, projected);
          return { ...m, actual, projected, pct };
        });
        return { slug, name: getShortName(slug), data };
      });

      return { pair, weekData: weekDataWithTrend, personBreakdown };
    });
  }, [allData, currentWeek, projPerPersonDaily]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#E6017D] rounded-full animate-spin" />
          Loading performance data...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin/performance" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">📊 Performance vs Projections</h1>
                <p className="text-slate-400 text-[11px]">
                  Weekly scorecard · Projected: {phoneHours}hrs × {bookingsPerHour} bkgs/hr × {Math.round(attendanceRate * 100)}% att × {Math.round(closeRate * 100)}% close × ${dealValue}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/projections" className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-600 transition-colors">
                ⚙️ Edit Projections
              </Link>
              <Link href="/admin/performance" className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-600 transition-colors">
                📋 Full Data →
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-5 space-y-6">

        {/* ═══ TEAM CARDS ═══ */}
        {teamScorecards.map(({ pair, weekData, personBreakdown }) => {
          const tc = teamColors[pair.color] || teamColors.slate;
          const latestWeek = weekData[weekData.length - 1];
          const latestTL = latestWeek ? trafficLight(latestWeek.overallPct) : trafficLight(0);

          return (
            <div key={pair.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              {/* Sticky team header */}
              <div className={`${tc.header} text-white px-5 py-3 sticky top-0 z-30`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold">{pair.label}</h2>
                    <span className="text-white/60 text-xs">{pair.members.map(getShortName).join(" + ")}</span>
                  </div>
                  {latestWeek && (
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${latestWeek.trend.color} bg-white/90 px-2 py-0.5 rounded-full`}>
                        {latestWeek.trend.icon} {latestWeek.trend.label}
                      </span>
                      <span className={`text-xs font-bold bg-white/90 px-2 py-0.5 rounded-full ${latestTL.text}`}>
                        {Math.round(latestWeek.overallPct)}% of target
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Week-on-week grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-gray-500 font-semibold text-[10px] uppercase tracking-wide w-[90px]">Week</th>
                      {compMetrics.map((m) => (
                        <th key={m.key} className="text-center px-2 py-2 text-gray-500 font-semibold text-[10px] uppercase tracking-wide" colSpan={2}>
                          {m.emoji} {m.label}
                        </th>
                      ))}
                      <th className="text-center px-2 py-2 text-gray-500 font-semibold text-[10px] uppercase tracking-wide w-[70px]">Score</th>
                      <th className="text-center px-2 py-2 text-gray-500 font-semibold text-[10px] uppercase tracking-wide w-[60px]">Trend</th>
                    </tr>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th></th>
                      {compMetrics.map((m) => (
                        <React.Fragment key={m.key}>
                          <th className="text-center px-1 py-1 text-gray-400 font-normal text-[9px]">Act</th>
                          <th className="text-center px-1 py-1 text-gray-400 font-normal text-[9px]">Proj</th>
                        </React.Fragment>
                      ))}
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.map((wd) => {
                      const wc = weekConfig[wd.weekNum];
                      const isNow = wd.weekNum === currentWeek;
                      const tl = trafficLight(wd.overallPct);
                      const hasData = wd.metricData.some((md) => md.actual > 0);

                      return (
                        <tr
                          key={wd.weekNum}
                          className={`border-b border-gray-100 ${isNow ? "bg-[#E6017D]/5" : ""} ${!hasData ? "opacity-40" : ""}`}
                        >
                          <td className="px-3 py-2.5 font-semibold text-gray-700 whitespace-nowrap">
                            {wc.shortLabel}
                            {isNow && <span className="ml-1 text-[8px] bg-[#E6017D] text-white px-1 py-0.5 rounded font-bold align-middle">NOW</span>}
                            {isNow && wd.daysElapsed < 5 && <span className="text-gray-400 text-[9px] ml-1">({wd.daysElapsed}d)</span>}
                          </td>
                          {wd.metricData.map((md) => {
                            const mtl = trafficLight(md.pct);
                            return (
                              <React.Fragment key={md.key}>
                                <td className={`px-1.5 py-2.5 text-center tabular-nums font-bold ${md.actual > 0 ? mtl.text : "text-gray-300"} ${md.actual > 0 ? mtl.bg : ""}`}>
                                  {md.actual > 0 ? fmtVal(md.actual, md.key) : "–"}
                                </td>
                                <td className="px-1.5 py-2.5 text-center tabular-nums text-gray-400">
                                  {fmtVal(md.projected, md.key)}
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="px-2 py-2.5 text-center">
                            {hasData ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${tl.bg} ${tl.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${tl.dot}`}></span>
                                {Math.round(wd.overallPct)}%
                              </span>
                            ) : (
                              <span className="text-gray-300">–</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            {hasData ? (
                              <span className={`text-sm font-bold ${wd.trend.color}`} title={wd.trend.label}>
                                {wd.trend.icon}
                              </span>
                            ) : (
                              <span className="text-gray-300">–</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Current week per-person breakdown */}
              <div className={`${tc.light} border-t ${tc.border} px-5 py-3`}>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                  This Week — Individual ({weekConfig[currentWeek]?.shortLabel})
                </div>
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${pair.members.length}, 1fr)` }}>
                  {personBreakdown.map((pb) => (
                    <div key={pb.slug} className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                      <div className="font-bold text-sm text-gray-800 mb-1.5">
                        <Link href={`/scorecard/${pb.slug}`} className="hover:text-[#E6017D] transition-colors">
                          {pb.name}
                        </Link>
                      </div>
                      <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                        {pb.data.map((md) => {
                          const mtl = trafficLight(md.pct);
                          return (
                            <div key={md.key} className="flex items-center gap-1">
                              <span className="text-[10px]">{md.emoji}</span>
                              <span className={`text-[11px] font-bold tabular-nums ${md.actual > 0 ? mtl.text : "text-gray-300"}`}>
                                {md.actual > 0 ? fmtVal(md.actual, md.key) : "0"}
                              </span>
                              <span className="text-[9px] text-gray-400">/{fmtVal(md.projected, md.key)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Projection source info */}
        <div className="text-center text-[10px] text-gray-400 py-2">
          Projections sourced from{" "}
          <Link href="/projections" className="underline hover:text-gray-600">/projections</Link>
          {" "}· Per-person daily: {fmtVal(projPerPersonDaily.calls, "calls_made")} calls · {fmtVal(projPerPersonDaily.connects, "calls")} conn · {fmtVal(projPerPersonDaily.bookings, "bookings")} bkgs · {fmtVal(projPerPersonDaily.attended, "meetings")} meet · {fmtVal(projPerPersonDaily.deals, "units")} deals · {fmtVal(projPerPersonDaily.revenue, "revenue")} rev
        </div>
      </div>
    </main>
  );
}

export default function PerformanceSummaryPage() {
  return (
    <PasswordGate requireMaster>
      <PerformanceSummaryContent />
    </PasswordGate>
  );
}
