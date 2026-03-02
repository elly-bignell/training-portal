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

// ─── Projection defaults ───
const DEFAULT_CALLS_PER_HOUR = 18;
const DEFAULT_CONNECTS_PER_HOUR = 10;
const DEFAULT_BOOKINGS_PER_HOUR = 1.5;
const DEFAULT_ATTENDANCE_RATE = 0.5;
const DEFAULT_CLOSE_RATE = 0.5;
const DEFAULT_HOURS = 3.5;
const DEFAULT_DEAL_VALUE = 400;

// ─── Buddy pairs (no Tom) ───
const buddyPairs = [
  {
    label: "Lucas & Cindy",
    color: "indigo",
    members: ["lucas-tirri", "cindy-rose-rondez-manrique"],
    leadGen: "cindy-rose-rondez-manrique",
    closer: "lucas-tirri",
  },
  {
    label: "Felipe & Connie",
    color: "pink",
    members: ["felipe-garcia", "connie-matthews"],
    leadGen: "connie-matthews",
    closer: "felipe-garcia",
  },
  {
    label: "Dylan & Krishna",
    color: "amber",
    members: ["dylan-munro", "krishna-patel"],
    leadGen: "krishna-patel",
    closer: "dylan-munro",
  },
];

const allSlugs = buddyPairs.flatMap((p) => p.members);

const compMetrics: { key: Metric; label: string; emoji: string; projKey: string }[] = [
  { key: "calls_made", label: "Calls", emoji: "📞", projKey: "calls" },
  { key: "calls", label: "Connected", emoji: "🔗", projKey: "connects" },
  { key: "bookings", label: "Bookings", emoji: "📅", projKey: "bookings" },
  { key: "meetings", label: "Attended", emoji: "🤝", projKey: "attended" },
  { key: "units", label: "Deals", emoji: "🏆", projKey: "deals" },
  { key: "revenue", label: "Revenue", emoji: "💰", projKey: "revenue" },
];

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
    if (now >= new Date(weekConfig[i].start)) return i;
  }
  return 0;
}

function getWorkingDaysElapsed(weekNum: number): number {
  const dates = getWeekDates(weekNum);
  const now = new Date();
  const cw = getCurrentWeek();
  if (weekNum < cw) return 5;
  if (weekNum > cw) return 0;
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
  if (metric === "revenue") return "$" + Math.round(Math.abs(v)).toLocaleString();
  if (metric === "units") return v % 1 !== 0 ? v.toFixed(1) : v.toString();
  return Math.round(v).toString();
}

function fmtVar(v: number, metric: Metric): string {
  const prefix = v >= 0 ? "+" : "";
  if (metric === "revenue") return v >= 0 ? "+$" + Math.round(v).toLocaleString() : "-$" + Math.abs(Math.round(v)).toLocaleString();
  if (metric === "units") return v % 1 !== 0 ? prefix + v.toFixed(1) : prefix + v;
  return prefix + Math.round(v);
}

function pctOf(actual: number, projected: number): number {
  if (projected === 0) return actual > 0 ? 999 : 0;
  return (actual / projected) * 100;
}

function trafficLight(pct: number): { bg: string; text: string; dot: string } {
  if (pct >= 100) return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };
  if (pct >= 75) return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
  return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" };
}

function trendArrow(thisP: number, lastP: number | null): { icon: string; label: string; color: string } {
  if (lastP === null) return { icon: "—", label: "First week", color: "text-gray-400" };
  const diff = thisP - lastP;
  if (diff > 5) return { icon: "↑", label: "Improving", color: "text-emerald-600" };
  if (diff < -5) return { icon: "↓", label: "Slipping", color: "text-red-500" };
  return { icon: "→", label: "Steady", color: "text-gray-500" };
}

const teamColors: Record<string, { header: string; headerRing: string; light: string; border: string; closerBg: string; lgBg: string }> = {
  indigo: { header: "bg-indigo-600", headerRing: "ring-indigo-400", light: "bg-indigo-50", border: "border-indigo-200", closerBg: "bg-indigo-100 text-indigo-700", lgBg: "bg-indigo-50 text-indigo-600" },
  pink: { header: "bg-pink-600", headerRing: "ring-pink-400", light: "bg-pink-50", border: "border-pink-200", closerBg: "bg-pink-100 text-pink-700", lgBg: "bg-pink-50 text-pink-600" },
  amber: { header: "bg-amber-500", headerRing: "ring-amber-400", light: "bg-amber-50", border: "border-amber-200", closerBg: "bg-amber-100 text-amber-700", lgBg: "bg-amber-50 text-amber-600" },
};

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

function PerformanceSummaryContent() {
  const [allData, setAllData] = useState<Map<string, DailyRecord[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const [phoneHours] = usePersistedState("proj-phoneHours", DEFAULT_HOURS);
  const [callsPerHour] = usePersistedState("proj-callsPerHour", DEFAULT_CALLS_PER_HOUR);
  const [connectsPerHour] = usePersistedState("proj-connectsPerHour", DEFAULT_CONNECTS_PER_HOUR);
  const [bookingsPerHour] = usePersistedState("proj-bookingsPerHour", DEFAULT_BOOKINGS_PER_HOUR);
  const [attendanceRate] = usePersistedState("proj-attendanceRate", DEFAULT_ATTENDANCE_RATE);
  const [closeRate] = usePersistedState("proj-closeRate", DEFAULT_CLOSE_RATE);
  const [dealValue] = usePersistedState("proj-dealValue", DEFAULT_DEAL_VALUE);

  const currentWeek = getCurrentWeek();

  // Per-TEAM daily projections
  const projTeamDaily = useMemo(() => {
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
            const res = await fetch("/api/activity/all?trainee_slug=" + slug);
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

  const getPersonWeekTotal = (slug: string, weekNum: number, metric: Metric): number => {
    const dates = getWeekDates(weekNum);
    return dates.reduce((sum, d) => sum + getValue(slug, d, metric), 0);
  };

  const getTeamWeeklyProjected = (weekNum: number, projKey: string): number => {
    const daysElapsed = weekNum < currentWeek ? 5 : getWorkingDaysElapsed(weekNum);
    return ((projTeamDaily as any)[projKey] || 0) * daysElapsed;
  };

  const teamScorecards = useMemo(() => {
    const weeksToShow = Array.from({ length: currentWeek + 1 }, (_, i) => i);

    return buddyPairs.map((pair) => {
      const closerName = getShortName(pair.closer);
      const lgName = getShortName(pair.leadGen);

      const weekData = weeksToShow.map((weekNum) => {
        const daysElapsed = weekNum < currentWeek ? 5 : getWorkingDaysElapsed(weekNum);

        const metricData = compMetrics.map((m) => {
          const closerVal = getPersonWeekTotal(pair.closer, weekNum, m.key);
          const lgVal = getPersonWeekTotal(pair.leadGen, weekNum, m.key);
          const teamActual = closerVal + lgVal;
          const projected = getTeamWeeklyProjected(weekNum, m.projKey);
          const pct = pctOf(teamActual, projected);
          const variance = teamActual - projected;

          // Contribution percentages
          const closerPct = teamActual > 0 ? (closerVal / teamActual) * 100 : 0;
          const lgPct = teamActual > 0 ? (lgVal / teamActual) * 100 : 0;

          return {
            ...m, teamActual, projected, pct, variance, daysElapsed,
            closerVal, lgVal, closerPct, lgPct,
          };
        });

        const weights: Record<string, number> = { calls_made: 0.5, calls: 0.5, bookings: 2, meetings: 1.5, units: 2, revenue: 2.5 };
        const weightedSum = metricData.reduce((s, md) => s + md.pct * (weights[md.key] || 1), 0);
        const totalWeight = metricData.reduce((s, md) => s + (weights[md.key] || 1), 0);
        const overallPct = totalWeight > 0 ? weightedSum / totalWeight : 0;

        return { weekNum, daysElapsed, metricData, overallPct };
      });

      const weekDataWithTrend = weekData.map((wd, idx) => {
        const prevPct = idx > 0 ? weekData[idx - 1].overallPct : null;
        return { ...wd, trend: trendArrow(wd.overallPct, prevPct) };
      });

      return { pair, closerName, lgName, weekData: weekDataWithTrend };
    });
  }, [allData, currentWeek, projTeamDaily]);

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

  const weeklyProj = {
    calls: Math.round(projTeamDaily.calls * 5),
    connects: Math.round(projTeamDaily.connects * 5),
    bookings: Math.round(projTeamDaily.bookings * 5),
    attended: +(projTeamDaily.attended * 5).toFixed(1),
    deals: +(projTeamDaily.deals * 5).toFixed(1),
    revenue: Math.round(projTeamDaily.revenue * 5),
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1500px] mx-auto px-4 py-4">
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
                  Weekly team target: {weeklyProj.calls} calls · {weeklyProj.connects} conn · {weeklyProj.bookings} bkgs · {weeklyProj.attended} att · {weeklyProj.deals} deals · ${weeklyProj.revenue.toLocaleString()} rev
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

      <div className="max-w-[1500px] mx-auto px-4 py-5 space-y-6">

        {teamScorecards.map(({ pair, closerName, lgName, weekData }) => {
          const tc = teamColors[pair.color] || teamColors.indigo;
          const latestWeek = weekData[weekData.length - 1];
          const latestTL = latestWeek ? trafficLight(latestWeek.overallPct) : trafficLight(0);

          return (
            <div key={pair.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              {/* Sticky team header */}
              <div className={tc.header + " text-white px-5 py-3 sticky top-0 z-30"}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold">{pair.label}</h2>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-white/20 px-2 py-0.5 rounded-full">{closerName} <span className="opacity-60">Closer</span></span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full">{lgName} <span className="opacity-60">Lead Gen</span></span>
                    </div>
                  </div>
                  {latestWeek && (
                    <div className="flex items-center gap-3">
                      <span className={latestWeek.trend.color + " text-xs font-bold bg-white/90 px-2 py-0.5 rounded-full"}>
                        {latestWeek.trend.icon} {latestWeek.trend.label}
                      </span>
                      <span className={latestTL.text + " text-xs font-bold bg-white/90 px-2 py-0.5 rounded-full"}>
                        {Math.round(latestWeek.overallPct)}% of target
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-gray-500 font-semibold text-[10px] uppercase tracking-wide w-[80px]">Week</th>
                      {compMetrics.map((m) => (
                        <th key={m.key} className="text-center px-1 py-2 text-gray-500 font-semibold text-[10px] uppercase tracking-wide min-w-[130px]">
                          {m.emoji} {m.label}
                        </th>
                      ))}
                      <th className="text-center px-2 py-2 text-gray-500 font-semibold text-[10px] uppercase tracking-wide w-[60px]">Score</th>
                      <th className="text-center px-2 py-2 text-gray-500 font-semibold text-[10px] uppercase tracking-wide w-[50px]">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.map((wd) => {
                      const wc = weekConfig[wd.weekNum];
                      const isNow = wd.weekNum === currentWeek;
                      const tl = trafficLight(wd.overallPct);
                      const hasData = wd.metricData.some((md) => md.teamActual > 0);

                      return (
                        <tr
                          key={wd.weekNum}
                          className={"border-b border-gray-100 " + (isNow ? "bg-[#E6017D]/5 " : "") + (!hasData ? "opacity-40" : "")}
                        >
                          <td className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap align-top">
                            {wc.shortLabel}
                            {isNow && <span className="ml-1 text-[8px] bg-[#E6017D] text-white px-1 py-0.5 rounded font-bold align-middle">NOW</span>}
                            {isNow && wd.daysElapsed < 5 && <div className="text-gray-400 text-[9px]">{wd.daysElapsed} of 5 days</div>}
                          </td>

                          {wd.metricData.map((md) => {
                            const mtl = trafficLight(md.pct);
                            const hasVal = md.teamActual > 0;

                            return (
                              <td key={md.key} className={"px-1.5 py-2 text-center align-top " + (hasVal ? mtl.bg : "")}>
                                {hasVal ? (
                                  <div>
                                    {/* Team total vs projected */}
                                    <div className="flex items-center justify-center gap-1">
                                      <span className={"text-sm font-black tabular-nums " + mtl.text}>
                                        {fmtVal(md.teamActual, md.key)}
                                      </span>
                                      <span className="text-gray-300">/</span>
                                      <span className="text-gray-400 tabular-nums text-[10px]">
                                        {fmtVal(md.projected, md.key)}
                                      </span>
                                    </div>

                                    {/* Variance */}
                                    <div className={"text-[9px] font-semibold tabular-nums " + (md.variance >= 0 ? "text-emerald-600" : "text-red-500")}>
                                      {fmtVar(md.variance, md.key)}
                                    </div>

                                    {/* Per-person split bar */}
                                    <div className="mt-1.5 mx-auto" style={{ maxWidth: "110px" }}>
                                      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-200">
                                        <div
                                          className="bg-emerald-500 transition-all"
                                          style={{ width: md.closerPct + "%" }}
                                          title={closerName + ": " + fmtVal(md.closerVal, md.key)}
                                        />
                                        <div
                                          className="bg-blue-400 transition-all"
                                          style={{ width: md.lgPct + "%" }}
                                          title={lgName + ": " + fmtVal(md.lgVal, md.key)}
                                        />
                                      </div>
                                      <div className="flex justify-between mt-0.5 text-[9px] tabular-nums">
                                        <span className="text-emerald-600 font-semibold" title={closerName}>
                                          {fmtVal(md.closerVal, md.key)}
                                        </span>
                                        <span className="text-blue-500 font-semibold" title={lgName}>
                                          {fmtVal(md.lgVal, md.key)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-300">–</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="px-2 py-3 text-center align-top">
                            {hasData ? (
                              <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold " + tl.bg + " " + tl.text}>
                                <span className={"w-1.5 h-1.5 rounded-full " + tl.dot}></span>
                                {Math.round(wd.overallPct)}%
                              </span>
                            ) : (
                              <span className="text-gray-300">–</span>
                            )}
                          </td>
                          <td className="px-2 py-3 text-center align-top">
                            {hasData ? (
                              <span className={"text-sm font-bold " + wd.trend.color} title={wd.trend.label}>
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

              {/* Legend for the split bar */}
              <div className="px-5 py-2 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-500">
                <span className="font-semibold">Split:</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> {closerName} (Closer)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400"></span> {lgName} (Lead Gen)</span>
              </div>
            </div>
          );
        })}

        {/* Projection source */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-bold text-gray-500 mb-2">Projection Inputs (per team/day)</div>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 text-center text-[11px]">
            <div><div className="text-gray-400">Phone hrs</div><div className="font-bold text-gray-800">{phoneHours}</div></div>
            <div><div className="text-gray-400">Calls/hr</div><div className="font-bold text-gray-800">{callsPerHour}</div></div>
            <div><div className="text-gray-400">Conn/hr</div><div className="font-bold text-gray-800">{connectsPerHour}</div></div>
            <div><div className="text-gray-400">Bkgs/hr</div><div className="font-bold text-gray-800">{bookingsPerHour}</div></div>
            <div><div className="text-gray-400">Attend %</div><div className="font-bold text-gray-800">{Math.round(attendanceRate * 100)}%</div></div>
            <div><div className="text-gray-400">Close %</div><div className="font-bold text-gray-800">{Math.round(closeRate * 100)}%</div></div>
            <div><div className="text-gray-400">Deal val</div><div className="font-bold text-gray-800">${dealValue}</div></div>
          </div>
          <div className="text-[10px] text-gray-400 mt-2 text-center">
            Change these on the <Link href="/projections" className="underline hover:text-gray-600">Projections page</Link> — this page updates automatically
          </div>
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
