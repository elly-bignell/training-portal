// app/admin/performance/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { weeklyStandards } from "@/hooks/useActivityTracking";
import PasswordGate from "@/components/PasswordGate";

// ─── Types ───
interface DailyRecord {
  date: string;
  calls: number;
  bookings: number;
  meetings: number;
  units: number;
  revenue: number;
}

type Metric = "calls" | "bookings" | "meetings" | "units" | "revenue";

// ─── Buddy pairs (display order) ───
const buddyPairs = [
  { label: "Lucas & Cindy", members: ["lucas-tirri", "cindy-rose-rondez-manrique"] },
  { label: "Felipe & Connie", members: ["felipe-garcia", "connie-matthews"] },
  { label: "Dylan & Krishna", members: ["dylan-munro", "krishna-patel"] },
  { label: "Tom", members: ["thomas-rennie"] },
];

const allSlugs = buddyPairs.flatMap((p) => p.members);

// ─── Week configs ───
const weekConfig: Record<number, { start: string; label: string; shortLabel: string }> = {
  0: { start: "2026-02-16", label: "Training Week", shortLabel: "TW" },
  1: { start: "2026-02-23", label: "Week 1 — Ramp Up", shortLabel: "W1" },
  2: { start: "2026-03-02", label: "Week 2 — Ramp Up", shortLabel: "W2" },
  3: { start: "2026-03-09", label: "Week 3 — Ramp Up", shortLabel: "W3" },
  4: { start: "2026-03-16", label: "Week 4 — Ramp Up", shortLabel: "W4" },
  5: { start: "2026-03-23", label: "Week 5 — Ramp Up", shortLabel: "W5" },
  6: { start: "2026-03-30", label: "Week 6 — The Standard", shortLabel: "W6" },
  7: { start: "2026-04-06", label: "Week 7 — Maintaining", shortLabel: "W7" },
  8: { start: "2026-04-13", label: "Week 8 — Maintaining", shortLabel: "W8" },
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getWeekDates(weekNum: number): string[] {
  const startStr = weekConfig[weekNum]?.start || "2026-02-16";
  const [y, m, d] = startStr.split("-").map(Number);
  return Array.from({ length: 5 }, (_, i) => {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    return dt.toISOString().split("T")[0];
  });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
}

// ─── Metric config ───
const metricConfig: Record<Metric, { label: string; emoji: string; format: (v: number) => string }> = {
  calls: { label: "Calls", emoji: "📞", format: (v) => v.toString() },
  bookings: { label: "Bookings", emoji: "📅", format: (v) => v.toString() },
  meetings: { label: "Meetings", emoji: "🤝", format: (v) => v.toString() },
  units: { label: "Units", emoji: "📦", format: (v) => v.toString() },
  revenue: { label: "Revenue", emoji: "💰", format: (v) => (v > 0 ? `$${v.toLocaleString()}` : "$0") },
};

const metricKeys: Metric[] = ["calls", "bookings", "meetings", "units", "revenue"];

// ─── Status colour ───
function getCellClass(actual: number, target: number): string {
  if (target === 0) return "";
  const pct = (actual / target) * 100;
  if (pct >= 100) return "bg-emerald-50 text-emerald-700 font-semibold";
  if (pct >= 75) return "bg-amber-50 text-amber-700";
  if (pct >= 50) return "bg-orange-50 text-orange-600";
  return "bg-red-50 text-red-600";
}

function getTotalClass(actual: number, target: number): string {
  if (target === 0) return "font-bold text-slate-800";
  const pct = (actual / target) * 100;
  if (pct >= 100) return "font-bold text-emerald-700";
  if (pct >= 75) return "font-bold text-amber-700";
  return "font-bold text-red-600";
}

// ─── Determine which weeks have data or are current/past ───
function getCurrentWeek(): number {
  const now = new Date();
  for (let i = 8; i >= 0; i--) {
    const start = new Date(weekConfig[i].start);
    if (now >= start) return i;
  }
  return 0;
}

// ─── Main Component ───
function PerformanceDashboardContent() {
  const [allData, setAllData] = useState<Map<string, DailyRecord[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<Metric | "all">("all");
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<number>>(new Set());

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
    setCollapsedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  };

  // Get a trainee's value for a date+metric
  const getValue = (slug: string, date: string, metric: Metric): number => {
    const records = allData.get(slug) || [];
    const rec = records.find((r) => r.date === date);
    return rec ? (rec[metric] || 0) : 0;
  };

  // Get trainee's week total for a metric
  const getWeekTotal = (slug: string, weekNum: number, metric: Metric): number => {
    const dates = getWeekDates(weekNum);
    return dates.reduce((sum, d) => sum + getValue(slug, d, metric), 0);
  };

  // Get daily target for a metric in a given week
  const getDailyTarget = (weekNum: number, metric: Metric): number => {
    const std = weeklyStandards[weekNum] || weeklyStandards[6];
    return std[metric] || 0;
  };

  // Get short name
  const getShortName = (slug: string): string => {
    const t = trainees.find((t) => t.slug === slug);
    if (!t) return slug;
    return t.name.split(" ")[0];
  };

  const getFullName = (slug: string): string => {
    const t = trainees.find((t) => t.slug === slug);
    return t?.name || slug;
  };

  // Weeks to show (0 through current)
  const weeksToShow = Array.from({ length: currentWeek + 1 }, (_, i) => i);

  // Active metrics for rendering
  const activeMetrics: Metric[] = selectedMetric === "all" ? metricKeys : [selectedMetric];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500 py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#E6017D] rounded-full animate-spin" />
          Loading performance data...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold">Performance Dashboard</h1>
                <p className="text-slate-400 text-xs">90-Day Training Cycle · All Metrics</p>
              </div>
            </div>
            <Link href="/roadmap" className="text-xs text-slate-400 hover:text-white transition-colors">
              Standards →
            </Link>
          </div>
        </div>
      </header>

      {/* Metric Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-20">
        <div className="max-w-[1800px] mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setSelectedMetric("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
              selectedMetric === "all"
                ? "bg-slate-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📊 All Metrics
          </button>
          {metricKeys.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedMetric === m
                  ? "bg-[#E6017D] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {metricConfig[m].emoji} {metricConfig[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              {/* ─── Header: Buddy pair groupings ─── */}
              <thead className="sticky top-[104px] z-10">
                {/* Buddy pair row */}
                <tr className="bg-slate-800">
                  <th className="sticky left-0 z-20 bg-slate-800 px-3 py-2 text-left text-slate-400 font-semibold min-w-[140px] border-r border-slate-700">
                    Week / Day
                  </th>
                  {selectedMetric === "all" && (
                    <th className="bg-slate-800 px-1 py-2 text-slate-400 font-semibold w-[50px] border-r border-slate-700"></th>
                  )}
                  {buddyPairs.map((pair, pIdx) => (
                    <th
                      key={pair.label}
                      colSpan={pair.members.length}
                      className={`px-2 py-2 text-center text-white font-bold text-sm ${
                        pIdx < buddyPairs.length - 1 ? "border-r-2 border-slate-600" : ""
                      }`}
                    >
                      {pair.label}
                    </th>
                  ))}
                </tr>
                {/* Individual names row */}
                <tr className="bg-slate-700">
                  <th className="sticky left-0 z-20 bg-slate-700 px-3 py-2 text-left text-slate-300 font-medium border-r border-slate-600">
                    <span className="text-[10px] uppercase tracking-wide">Date</span>
                  </th>
                  {selectedMetric === "all" && (
                    <th className="bg-slate-700 px-1 py-2 text-slate-300 font-medium border-r border-slate-600">
                      <span className="text-[10px] uppercase tracking-wide">Metric</span>
                    </th>
                  )}
                  {buddyPairs.map((pair, pIdx) =>
                    pair.members.map((slug, mIdx) => (
                      <th
                        key={slug}
                        className={`px-2 py-2 text-center min-w-[70px] ${
                          mIdx === pair.members.length - 1 && pIdx < buddyPairs.length - 1
                            ? "border-r-2 border-slate-600"
                            : ""
                        }`}
                      >
                        <Link
                          href={`/scorecard/${slug}`}
                          className="text-slate-200 hover:text-white font-semibold transition-colors"
                        >
                          {getShortName(slug)}
                        </Link>
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              <tbody>
                {weeksToShow.map((weekNum) => {
                  const dates = getWeekDates(weekNum);
                  const wc = weekConfig[weekNum];
                  const isCollapsed = collapsedWeeks.has(weekNum);
                  const isCurrentWeek = weekNum === currentWeek;
                  const totalCols = allSlugs.length + 1 + (selectedMetric === "all" ? 1 : 0);

                  return (
                    <React.Fragment key={weekNum}>
                      {/* ─── Week header row ─── */}
                      <tr
                        className={`cursor-pointer select-none ${
                          isCurrentWeek
                            ? "bg-[#E6017D]/10 hover:bg-[#E6017D]/15"
                            : "bg-slate-100 hover:bg-slate-200"
                        }`}
                        onClick={() => toggleWeek(weekNum)}
                      >
                        <td
                          colSpan={totalCols}
                          className="px-3 py-2.5 font-bold text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className={isCurrentWeek ? "text-[#E6017D]" : "text-slate-800"}>
                              {wc.label}
                            </span>
                            {isCurrentWeek && (
                              <span className="text-[10px] bg-[#E6017D] text-white px-2 py-0.5 rounded-full font-semibold">
                                CURRENT
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* ─── Day rows (if expanded) ─── */}
                      {!isCollapsed && (
                        <>
                          {dates.map((date, dayIdx) => {
                            const dayLabel = `${dayNames[dayIdx]} ${formatDateShort(date)}`;

                            if (selectedMetric !== "all") {
                              // Single metric view — one row per day
                              const metric = selectedMetric;
                              const dailyTarget = getDailyTarget(weekNum, metric);
                              return (
                                <tr key={date} className="border-b border-gray-100 hover:bg-gray-50/50">
                                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-gray-700 font-medium border-r border-gray-100 whitespace-nowrap">
                                    {dayLabel}
                                  </td>
                                  {buddyPairs.map((pair, pIdx) =>
                                    pair.members.map((slug, mIdx) => {
                                      const val = getValue(slug, date, metric);
                                      const cellClass = val > 0 ? getCellClass(val, dailyTarget) : "";
                                      return (
                                        <td
                                          key={slug}
                                          className={`px-2 py-2 text-center tabular-nums ${cellClass} ${
                                            mIdx === pair.members.length - 1 && pIdx < buddyPairs.length - 1
                                              ? "border-r-2 border-gray-200"
                                              : ""
                                          }`}
                                        >
                                          {val > 0 ? metricConfig[metric].format(val) : <span className="text-gray-300">–</span>}
                                        </td>
                                      );
                                    })
                                  )}
                                </tr>
                              );
                            }

                            // All metrics view — multiple rows per day
                            return activeMetrics.map((metric, metricIdx) => (
                              <tr
                                key={`${date}-${metric}`}
                                className={`${
                                  metricIdx === activeMetrics.length - 1 ? "border-b border-gray-200" : "border-b border-gray-50"
                                } hover:bg-gray-50/50`}
                              >
                                {metricIdx === 0 && (
                                  <td
                                    rowSpan={activeMetrics.length}
                                    className="sticky left-0 z-10 bg-white px-3 py-1.5 text-gray-700 font-medium border-r border-gray-100 align-top whitespace-nowrap"
                                  >
                                    {dayLabel}
                                  </td>
                                )}
                                <td className="px-1 py-1 text-center">
                                  <span className="text-[9px] text-gray-400 uppercase font-semibold tracking-wide">
                                    {metric === "revenue" ? "Rev" : metric === "bookings" ? "Book" : metric === "meetings" ? "Meet" : metric.charAt(0).toUpperCase() + metric.slice(1)}
                                  </span>
                                </td>
                                {buddyPairs.map((pair, pIdx) =>
                                  pair.members.map((slug, mIdx) => {
                                    const val = getValue(slug, date, metric);
                                    const dailyTarget = getDailyTarget(weekNum, metric);
                                    const cellClass = val > 0 ? getCellClass(val, dailyTarget) : "";
                                    return (
                                      <td
                                        key={slug}
                                        className={`px-2 py-1 text-center tabular-nums ${cellClass} ${
                                          mIdx === pair.members.length - 1 && pIdx < buddyPairs.length - 1
                                            ? "border-r-2 border-gray-200"
                                            : ""
                                        }`}
                                      >
                                        {val > 0 ? metricConfig[metric].format(val) : <span className="text-gray-300">–</span>}
                                      </td>
                                    );
                                  })
                                )}
                              </tr>
                            ));
                          })}

                          {/* ─── Week totals row ─── */}
                          {selectedMetric !== "all" ? (
                            <tr className="bg-slate-50 border-b-2 border-slate-300">
                              <td className="sticky left-0 z-10 bg-slate-50 px-3 py-2 font-bold text-slate-700 uppercase text-[10px] border-r border-gray-200 tracking-wide">
                                {wc.shortLabel} Total
                              </td>
                              {buddyPairs.map((pair, pIdx) =>
                                pair.members.map((slug, mIdx) => {
                                  const total = getWeekTotal(slug, weekNum, selectedMetric);
                                  const weeklyTarget = getDailyTarget(weekNum, selectedMetric) * 5;
                                  return (
                                    <td
                                      key={slug}
                                      className={`px-2 py-2 text-center tabular-nums ${getTotalClass(total, weeklyTarget)} ${
                                        mIdx === pair.members.length - 1 && pIdx < buddyPairs.length - 1
                                          ? "border-r-2 border-gray-200"
                                          : ""
                                      }`}
                                    >
                                      {metricConfig[selectedMetric].format(total)}
                                      <span className="text-gray-400 font-normal text-[10px]">
                                        /{metricConfig[selectedMetric].format(weeklyTarget)}
                                      </span>
                                    </td>
                                  );
                                })
                              )}
                            </tr>
                          ) : (
                            // All metrics — totals for each metric
                            metricKeys.map((metric, metricIdx) => (
                              <tr
                                key={`total-${metric}`}
                                className={`bg-slate-50 ${
                                  metricIdx === metricKeys.length - 1 ? "border-b-2 border-slate-300" : "border-b border-slate-200"
                                }`}
                              >
                                {metricIdx === 0 && (
                                  <td
                                    rowSpan={metricKeys.length}
                                    className="sticky left-0 z-10 bg-slate-50 px-3 py-1.5 font-bold text-slate-700 uppercase text-[10px] border-r border-gray-200 tracking-wide align-top"
                                  >
                                    {wc.shortLabel} Total
                                  </td>
                                )}
                                <td className="px-1 py-1 text-center bg-slate-50">
                                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wide">
                                    {metric === "revenue" ? "Rev" : metric === "bookings" ? "Book" : metric === "meetings" ? "Meet" : metric.charAt(0).toUpperCase() + metric.slice(1)}
                                  </span>
                                </td>
                                {buddyPairs.map((pair, pIdx) =>
                                  pair.members.map((slug, mIdx) => {
                                    const total = getWeekTotal(slug, weekNum, metric);
                                    const weeklyTarget = getDailyTarget(weekNum, metric) * 5;
                                    return (
                                      <td
                                        key={slug}
                                        className={`px-2 py-1 text-center tabular-nums ${getTotalClass(total, weeklyTarget)} ${
                                          mIdx === pair.members.length - 1 && pIdx < buddyPairs.length - 1
                                            ? "border-r-2 border-gray-200"
                                            : ""
                                        }`}
                                      >
                                        {metricConfig[metric].format(total)}
                                      </td>
                                    );
                                  })
                                )}
                              </tr>
                            ))
                          )}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
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
