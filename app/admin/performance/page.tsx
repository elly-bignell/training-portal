// app/admin/performance/page.tsx

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

// ─── Projection defaults (same as projections page) ───
const DEFAULT_CALLS_PER_HOUR = 18;
const DEFAULT_CONNECTS_PER_HOUR = 10;
const DEFAULT_BOOKINGS_PER_HOUR = 1.5;
const DEFAULT_ATTENDANCE_RATE = 0.5;
const DEFAULT_CLOSE_RATE = 0.5;
const DEFAULT_HOURS = 3.5;
const DEFAULT_DEAL_VALUE = 400;

// ─── Buddy pairs ───
const buddyPairs: { label: string; sublabel?: string; members: string[] }[] = [
  { label: "Lucas, Cindy & Daren", members: ["lucas-tirri", "cindy-rose-rondez-manrique", "daren-ravikumar"] },
  { label: "Felipe, Sydney & Shian", members: ["felipe-garcia", "sydney-arnold", "shian-roux"] },
  { label: "Dylan, Riley & Jade", members: ["dylan-munro", "riley-kerrison", "jade-bautista"] },
];

const allSlugs = buddyPairs.flatMap((p) => p.members);

// ─── Metrics config ───
const metrics: { key: Metric; label: string; shortLabel: string; format: (v: number) => string }[] = [
  { key: "calls_made", label: "Calls", shortLabel: "Calls", format: (v) => v.toString() },
  { key: "calls", label: "Connected", shortLabel: "Conn", format: (v) => v.toString() },
  { key: "bookings", label: "Bookings", shortLabel: "Book", format: (v) => v.toString() },
  { key: "meetings", label: "Meetings", shortLabel: "Meet", format: (v) => v.toString() },
  { key: "units", label: "Sales Units", shortLabel: "Units", format: (v) => v % 1 !== 0 ? (Math.round(v * 100) / 100).toFixed(1) : v.toString() },
  { key: "revenue", label: "Revenue", shortLabel: "Rev", format: (v) => v > 0 ? `$${v.toLocaleString()}` : "$0" },
];

// ─── Week helpers ───
// Week 0 = Mon 16 Feb 2026 (program kickoff). Every other week's dates are
// derived programmatically so the page auto-rolls forward each Monday.
// Trainees have different start dates so we no longer label weeks "Ramp Up"
// vs "Maintaining" — the date range tells the full story.
const WEEK_0_MONDAY_ISO = "2026-02-16";

const DAY_NAMES_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getWeekMonday(weekNum: number): Date {
  const [y, m, d] = WEEK_0_MONDAY_ISO.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + weekNum * 7));
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getWeekDates(weekNum: number): string[] {
  const monday = getWeekMonday(weekNum);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
}

// "Monday 2 March – Friday 6 March" style label for a week's heading.
function getWeekDateRangeLong(weekNum: number): string {
  const monday = getWeekMonday(weekNum);
  const friday = new Date(monday);
  friday.setUTCDate(friday.getUTCDate() + 4);
  const fmt = (d: Date) =>
    `${DAY_NAMES_LONG[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_NAMES_LONG[d.getUTCMonth()]}`;
  return `${fmt(monday)} – ${fmt(friday)}`;
}

function getCurrentWeek(): number {
  const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
  const today = new Date(todayISO + "T00:00:00Z");
  const week0 = getWeekMonday(0);
  const diffDays = Math.floor((today.getTime() - week0.getTime()) / 86400000);
  if (diffDays < 0) return 0;
  return Math.floor(diffDays / 7);
}

function getCellBg(actual: number, target: number): string {
  if (target === 0 || actual === 0) return "";
  const pct = (actual / target) * 100;
  if (pct >= 100) return "bg-emerald-50 text-emerald-700 font-medium";
  if (pct >= 75) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-600";
}

function getVarClass(variance: number): string {
  if (variance > 0) return "text-emerald-600 font-semibold";
  if (variance === 0) return "text-gray-400";
  return "text-red-500 font-semibold";
}

function formatVar(rawV: number, metric: Metric): string {
  const v = Math.round(rawV * 100) / 100;
  const prefix = v > 0 ? "+" : "";
  if (metric === "revenue") {
    return v >= 0 ? `+$${v.toLocaleString()}` : `-$${Math.abs(v).toLocaleString()}`;
  }
  if (metric === "units") {
    return v % 1 !== 0 ? `${prefix}${v.toFixed(1)}` : `${prefix}${v}`;
  }
  return `${prefix}${v}`;
}

function getShortName(slug: string): string {
  const t = trainees.find((t) => t.slug === slug);
  if (!t) return slug;
  return t.name.split(" ")[0];
}

function fmtTarget(v: number): string {
  if (Number.isInteger(v)) return v.toString();
  return v % 1 !== 0 ? v.toFixed(1) : v.toString();
}

// ─── Main Component ───
function PerformanceDashboardContent() {
  const [allData, setAllData] = useState<Map<string, DailyRecord[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Persist which weeks are collapsed across page reloads. First-time visitors
  // see only the current week expanded — every past week starts collapsed —
  // matching the "clean by default" view. After that, any change persists.
  const initialCollapsedDefault = (() => {
    const cw = getCurrentWeek();
    return Array.from({ length: cw }, (_, i) => i);
  })();
  const [collapsedWeeks, setCollapsedWeeks] = usePersistedState<number[]>(
    "perf-collapsedWeeks",
    initialCollapsedDefault
  );

  // ─── Pull from same persisted state as projections page ───
  const [phoneHours] = usePersistedState("proj-phoneHours", DEFAULT_HOURS);
  const [callsPerHour] = usePersistedState("proj-callsPerHour", DEFAULT_CALLS_PER_HOUR);
  const [connectsPerHour] = usePersistedState("proj-connectsPerHour", DEFAULT_CONNECTS_PER_HOUR);
  const [bookingsPerHour] = usePersistedState("proj-bookingsPerHour", DEFAULT_BOOKINGS_PER_HOUR);
  const [attendanceRate] = usePersistedState("proj-attendanceRate", DEFAULT_ATTENDANCE_RATE);
  const [closeRate] = usePersistedState("proj-closeRate", DEFAULT_CLOSE_RATE);
  const [dealValue] = usePersistedState("proj-dealValue", DEFAULT_DEAL_VALUE);

  // ─── Computed daily team targets from projections ───
  const dailyTeamTargets: Record<Metric, number> = useMemo(() => {
    const dailyBookings = phoneHours * bookingsPerHour;
    const dailyAttended = dailyBookings * attendanceRate;
    const dailyDeals = dailyAttended * closeRate;
    const dailyRevenue = dailyDeals * dealValue;
    return {
      calls_made: Math.round(phoneHours * callsPerHour),
      calls: Math.round(phoneHours * connectsPerHour),
      bookings: Math.round(dailyBookings * 10) / 10,
      meetings: Math.round(dailyAttended * 10) / 10,
      units: Math.round(dailyDeals * 10) / 10,
      revenue: Math.round(dailyRevenue),
    };
  }, [phoneHours, callsPerHour, connectsPerHour, bookingsPerHour, attendanceRate, closeRate, dealValue]);

  const currentWeek = getCurrentWeek();

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

  const toggleWeek = (weekNum: number) => {
    setCollapsedWeeks((prev) =>
      prev.includes(weekNum)
        ? prev.filter((w) => w !== weekNum)
        : [...prev, weekNum]
    );
  };

  const getValue = (slug: string, date: string, metric: Metric): number => {
    const records = allData.get(slug) || [];
    const rec = records.find((r) => r.date === date);
    if (!rec) return 0;
    return (rec as any)[metric] || 0;
  };

  const getTeamDayTotal = (members: string[], date: string, metric: Metric): number => {
    return members.reduce((sum, slug) => sum + getValue(slug, date, metric), 0);
  };

  const getTeamWeekTotal = (members: string[], weekNum: number, metric: Metric): number => {
    const dates = getWeekDates(weekNum);
    return dates.reduce((sum, d) => sum + getTeamDayTotal(members, d, metric), 0);
  };

  const getPersonWeekTotal = (slug: string, weekNum: number, metric: Metric): number => {
    const dates = getWeekDates(weekNum);
    return dates.reduce((sum, d) => sum + getValue(slug, d, metric), 0);
  };

  const weeksToShow = Array.from({ length: currentWeek + 1 }, (_, i) => i);
  const totalDataCols = buddyPairs.reduce((sum, p) => sum + p.members.length + 1, 0);

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
        <div className="max-w-[1900px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Performance Dashboard</h1>
              <p className="text-slate-400 text-[11px]">
                Daily team target: {fmtTarget(dailyTeamTargets.calls_made)} calls · {fmtTarget(dailyTeamTargets.calls)} connected · {fmtTarget(dailyTeamTargets.bookings)} bookings · {fmtTarget(dailyTeamTargets.meetings)} meetings · {fmtTarget(dailyTeamTargets.units)} units · ${dailyTeamTargets.revenue.toLocaleString()} rev
              </p>
              <p className="text-slate-500 text-[10px]">
                Targets from <Link href="/projections" className="underline hover:text-slate-300">Projections</Link>: {phoneHours}hrs × {callsPerHour} calls/hr · {connectsPerHour} conn/hr · {bookingsPerHour} bkgs/hr · {Math.round(attendanceRate * 100)}% attend · {Math.round(closeRate * 100)}% close · ${dealValue}/deal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/performance-summary" className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">
              📊 vs Projections
            </Link>
            <Link href="/projections" className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-600 transition-colors">
              ⚙️ Edit Projections
            </Link>
            <Link href="/roadmap" className="text-xs text-slate-400 hover:text-white">
              Standards →
            </Link>
          </div>
        </div>
      </header>

      {/* Table */}
      <div className="max-w-[1900px] mx-auto px-3 py-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
            <table className="w-full text-[11px] border-collapse" style={{ minWidth: "1100px" }}>
              <thead className="sticky top-0 z-40">
                {/* Row 1: Buddy pair group headers */}
                <tr className="bg-slate-800">
                  <th className="sticky left-0 z-50 bg-slate-800 text-left px-2 py-2 text-slate-400 text-[10px] font-semibold uppercase tracking-wide w-[100px] border-r border-slate-700" rowSpan={2}>
                    Day
                  </th>
                  <th className="sticky left-[100px] z-50 bg-slate-800 text-center px-1 py-2 text-slate-400 text-[10px] font-semibold uppercase tracking-wide w-[56px] border-r border-slate-700" rowSpan={2}>
                    Metric
                  </th>
                  {buddyPairs.map((pair, pIdx) => (
                    <th
                      key={pair.label}
                      colSpan={pair.members.length + 1}
                      className={`text-center px-1 py-2 text-white font-bold text-xs ${
                        pIdx < buddyPairs.length - 1 ? "border-r-2 border-slate-600" : ""
                      }`}
                    >
                      <div>{pair.label}</div>
                      {pair.sublabel && <div className="text-[9px] font-normal text-slate-300 mt-0.5">{pair.sublabel}</div>}
                    </th>
                  ))}
                </tr>
                {/* Row 2: Individual names + Var */}
                <tr className="bg-slate-700">
                  {buddyPairs.map((pair, pIdx) => (
                    <React.Fragment key={pair.label}>
                      {pair.members.map((slug) => (
                        <th key={slug} className="text-center px-1 py-1.5 min-w-[62px]">
                          <Link
                            href={`/scorecard/${slug}`}
                            className="text-slate-200 hover:text-white font-semibold text-[11px] transition-colors"
                          >
                            {getShortName(slug)}
                          </Link>
                        </th>
                      ))}
                      <th
                        className={`text-center px-1 py-1.5 min-w-[52px] text-slate-400 text-[10px] font-semibold ${
                          pIdx < buddyPairs.length - 1 ? "border-r-2 border-slate-600" : ""
                        }`}
                      >
                        ±Var
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody>
                {weeksToShow.map((weekNum) => {
                  const dates = getWeekDates(weekNum);
                  const weekRangeLabel = getWeekDateRangeLong(weekNum);
                  const isCollapsed = collapsedWeeks.includes(weekNum);
                  const isCurrentWeek = weekNum === currentWeek;
                  const totalCols = 2 + totalDataCols;

                  return (
                    <React.Fragment key={weekNum}>
                      {/* Week header */}
                      <tr
                        className={`cursor-pointer select-none border-t-2 border-slate-300 ${
                          isCurrentWeek ? "bg-[#E6017D]/10 hover:bg-[#E6017D]/15" : "bg-slate-100 hover:bg-slate-200/70"
                        }`}
                        onClick={() => toggleWeek(weekNum)}
                      >
                        <td colSpan={totalCols} className="px-2 py-2 font-bold text-sm">
                          <div className="flex items-center gap-2">
                            <svg
                              className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className={isCurrentWeek ? "text-[#E6017D]" : "text-slate-800"}>
                              {weekRangeLabel}
                            </span>
                            {isCurrentWeek && (
                              <span className="text-[9px] bg-[#E6017D] text-white px-1.5 py-0.5 rounded-full font-semibold">
                                CURRENT
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Day rows */}
                      {!isCollapsed && (
                        <>
                          {dates.map((date, dayIdx) => {
                            const dayLabel = `${dayNames[dayIdx]} ${formatDateShort(date)}`;

                            return metrics.map((m, mIdx) => {
                              const isFirstMetric = mIdx === 0;
                              const isLastMetric = mIdx === metrics.length - 1;
                              const target = dailyTeamTargets[m.key];

                              return (
                                <tr
                                  key={`${date}-${m.key}`}
                                  className={`${
                                    isLastMetric ? "border-b-2 border-gray-200" : "border-b border-gray-50"
                                  } hover:bg-gray-50/50`}
                                >
                                  {isFirstMetric && (
                                    <td
                                      rowSpan={metrics.length}
                                      className="sticky left-0 z-10 bg-white px-2 py-1 text-gray-700 font-medium border-r border-gray-100 align-top whitespace-nowrap text-[11px]"
                                    >
                                      {dayLabel}
                                    </td>
                                  )}

                                  <td className="sticky left-[100px] z-10 bg-white px-1 py-1 border-r border-gray-100 whitespace-nowrap">
                                    <span className="text-[10px] text-gray-500 font-semibold">
                                      {m.shortLabel}
                                    </span>
                                  </td>

                                  {buddyPairs.map((pair, pIdx) => {
                                    const teamTotal = getTeamDayTotal(pair.members, date, m.key);
                                    const variance = Math.round((teamTotal - target) * 100) / 100;
                                    const isLast = pIdx < buddyPairs.length - 1;

                                    return (
                                      <React.Fragment key={pair.label}>
                                        {pair.members.map((slug) => {
                                          const val = getValue(slug, date, m.key);
                                          const indivTarget = target / pair.members.length;
                                          const cellBg = val > 0 ? getCellBg(val, indivTarget) : "";
                                          return (
                                            <td key={slug} className={`px-1 py-1 text-center tabular-nums ${cellBg}`}>
                                              {val > 0 ? m.format(val) : <span className="text-gray-300">–</span>}
                                            </td>
                                          );
                                        })}
                                        <td
                                          className={`px-1 py-1 text-center tabular-nums text-[10px] bg-gray-50/80 ${getVarClass(variance)} ${
                                            isLast ? "border-r-2 border-gray-200" : ""
                                          }`}
                                        >
                                          {teamTotal > 0 ? formatVar(variance, m.key) : <span className="text-gray-300">–</span>}
                                        </td>
                                      </React.Fragment>
                                    );
                                  })}
                                </tr>
                              );
                            });
                          })}

                          {/* Week totals */}
                          {metrics.map((m, mIdx) => {
                            const isFirstMetric = mIdx === 0;
                            const isLastMetric = mIdx === metrics.length - 1;
                            const weeklyTarget = dailyTeamTargets[m.key] * 5;

                            return (
                              <tr
                                key={`total-${weekNum}-${m.key}`}
                                className={`bg-slate-100 ${
                                  isLastMetric ? "border-b-2 border-slate-400" : "border-b border-slate-200"
                                }`}
                              >
                                {isFirstMetric && (
                                  <td
                                    rowSpan={metrics.length}
                                    className="sticky left-0 z-10 bg-slate-100 px-2 py-1 font-bold text-slate-700 uppercase text-[10px] border-r border-gray-200 tracking-wide align-top whitespace-nowrap"
                                  >
                                    Week Total
                                  </td>
                                )}
                                <td className="sticky left-[100px] z-10 bg-slate-100 px-1 py-1 border-r border-gray-200 whitespace-nowrap">
                                  <span className="text-[10px] text-slate-600 font-bold">{m.shortLabel}</span>
                                </td>
                                {buddyPairs.map((pair, pIdx) => {
                                  const teamWeekTotal = getTeamWeekTotal(pair.members, weekNum, m.key);
                                  const weekVar = Math.round((teamWeekTotal - weeklyTarget) * 100) / 100;
                                  const isLast = pIdx < buddyPairs.length - 1;

                                  return (
                                    <React.Fragment key={pair.label}>
                                      {pair.members.map((slug) => {
                                        const total = getPersonWeekTotal(slug, weekNum, m.key);
                                        const indivTarget = weeklyTarget / pair.members.length;
                                        const cellBg = total > 0 ? getCellBg(total, indivTarget) : "";
                                        return (
                                          <td key={slug} className={`px-1 py-1 text-center tabular-nums font-bold ${cellBg}`}>
                                            {total > 0 ? m.format(total) : <span className="text-gray-400">0</span>}
                                          </td>
                                        );
                                      })}
                                      <td
                                        className={`px-1 py-1 text-center tabular-nums text-[10px] bg-slate-50 font-bold ${getVarClass(weekVar)} ${
                                          isLast ? "border-r-2 border-gray-200" : ""
                                        }`}
                                      >
                                        {teamWeekTotal > 0 ? formatVar(weekVar, m.key) : <span className="text-gray-400">0</span>}
                                      </td>
                                    </React.Fragment>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-gray-500 px-1">
          <span className="font-semibold">Key:</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200"></span> ≥100%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200"></span> ≥75%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border border-red-200"></span> &lt;75%</span>
          <span className="ml-2 font-semibold">±Var = team actual − daily target ({fmtTarget(dailyTeamTargets.calls_made)}/{fmtTarget(dailyTeamTargets.calls)}/{fmtTarget(dailyTeamTargets.bookings)}/{fmtTarget(dailyTeamTargets.meetings)}/{fmtTarget(dailyTeamTargets.units)}/${dailyTeamTargets.revenue})</span>
          <span className="ml-auto text-gray-400">
            Targets from <Link href="/projections" className="underline hover:text-gray-600">Projections page</Link>
          </span>
        </div>
      </div>
    </main>
  );
}

export default function PerformanceDashboard() {
  return (
    <PasswordGate requireMaster>
      <PerformanceDashboardContent />
    </PasswordGate>
  );
}
