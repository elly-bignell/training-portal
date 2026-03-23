// app/admin/performance-summary/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import PasswordGate from "@/components/PasswordGate";
import { usePersistedState } from "@/hooks/usePersistedState";
import EasterPromoAdmin from "@/components/EasterPromoAdmin";
import PrintButton from "@/components/PrintButton";
import RennieDealTracker from "@/components/RennieDealTracker";

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

interface MetricResult {
  key: Metric;
  label: string;
  emoji: string;
  projKey: string;
  teamActual: number;
  projected: number;
  pct: number;
  variance: number;
  closerVal: number;
  lgVal: number;
  closerPct: number;
  lgPct: number;
  daysElapsed: number;
}

interface WeekData {
  weekNum: number;
  daysElapsed: number;
  metricData: MetricResult[];
  overallPct: number;
  trend: { icon: string; label: string; color: string };
}

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
    startGlobalWeek: 0,
    weekLabelOffset: 0,
  },
  {
    label: "Dylan & Krishna",
    color: "amber",
    members: ["dylan-munro", "krishna-patel"],
    leadGen: "krishna-patel",
    closer: "dylan-munro",
    startGlobalWeek: 0,
    weekLabelOffset: 0,
  },
  {
    label: "Felipe & Sydney",
    color: "pink",
    members: ["felipe-garcia", "sydney-arnold"],
    leadGen: "sydney-arnold",
    closer: "felipe-garcia",
    startGlobalWeek: 5,
    weekLabelOffset: -5,
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

const teamColors: Record<string, { header: string; light: string; border: string; tab: string; tabActive: string }> = {
  indigo: { header: "bg-indigo-600", light: "bg-indigo-50", border: "border-indigo-200", tab: "text-indigo-600 hover:bg-indigo-50", tabActive: "bg-indigo-600 text-white" },
  pink: { header: "bg-pink-600", light: "bg-pink-50", border: "border-pink-200", tab: "text-pink-600 hover:bg-pink-50", tabActive: "bg-pink-600 text-white" },
  amber: { header: "bg-amber-500", light: "bg-amber-50", border: "border-amber-200", tab: "text-amber-600 hover:bg-amber-50", tabActive: "bg-amber-500 text-white" },
};

// ═══════════════════════════════════════════
// EXEC SUMMARY GENERATOR
// ═══════════════════════════════════════════

function generateExecSummary(
  wd: WeekData,
  closerName: string,
  lgName: string,
  currentWeek: number,
  projTeamDaily: Record<string, number>,
  lgMetricData?: { calls_made: number; calls: number; bookings: number; meetings: number; units: number; revenue: number },
): string[] {
  const lines: string[] = [];
  const hasData = wd.metricData.some((md) => md.teamActual > 0);
  if (!hasData) {
    lines.push("No data recorded yet.");
    return lines;
  }

  const isLive = wd.weekNum === currentWeek;
  const dayLabel = isLive ? wd.daysElapsed + " of 5 days" : "5 of 5 days (complete)";

  const revMetric = wd.metricData.find((m) => m.key === "revenue");
  const revPct = revMetric && revMetric.projected > 0 ? Math.round((revMetric.teamActual / revMetric.projected) * 100) : 0;
  const overallWord = revPct >= 100 ? "on track" : revPct >= 75 ? "slightly behind" : "off track";
  lines.push("📋 STATUS: Team is " + overallWord + " — 💰 Revenue at " + revPct + "% of target (" + dayLabel + ")." + (isLive ? " Projections prorated to days elapsed." : ""));

  const calls = wd.metricData.find((m) => m.key === "calls_made");
  const connects = wd.metricData.find((m) => m.key === "calls");
  const bookings = wd.metricData.find((m) => m.key === "bookings");
  const attended = wd.metricData.find((m) => m.key === "meetings");
  const deals = wd.metricData.find((m) => m.key === "units");

  const actualConnRate = calls && calls.teamActual > 0 ? (connects?.teamActual || 0) / calls.teamActual : 0;
  const actualBkgRate = connects && connects.teamActual > 0 ? (bookings?.teamActual || 0) / connects.teamActual : 0;
  const actualAttRate = bookings && bookings.teamActual > 0 ? (attended?.teamActual || 0) / bookings.teamActual : 0;
  const actualCloseRate = attended && attended.teamActual > 0 ? (deals?.teamActual || 0) / attended.teamActual : 0;

  const expConnRate = projTeamDaily.calls > 0 ? projTeamDaily.connects / projTeamDaily.calls : 0;
  const expBkgRate = projTeamDaily.connects > 0 ? projTeamDaily.bookings / projTeamDaily.connects : 0;
  const expAttRate = projTeamDaily.bookings > 0 ? projTeamDaily.attended / projTeamDaily.bookings : 0;
  const expCloseRate = projTeamDaily.attended > 0 ? projTeamDaily.deals / projTeamDaily.attended : 0;

  const rateCheck = (label: string, actual: number, expected: number): string => {
    const aPct = Math.round(actual * 100);
    const ePct = Math.round(expected * 100);
    const diff = aPct - ePct;
    const status = diff >= 0 ? "✅" : diff >= -5 ? "⚠️" : "❌";
    const diffStr = diff >= 0 ? "+" + diff + "pp" : diff + "pp";
    return status + " " + label + ": " + aPct + "% (expected " + ePct + "%) " + diffStr;
  };

  lines.push("");
  if (lgMetricData) {
    const lgCalls = lgMetricData.calls_made;
    const lgConnects = lgMetricData.calls;
    const lgBookings = lgMetricData.bookings;
    const lgAttended = lgMetricData.meetings;
    const lgConnRate = lgCalls > 0 ? lgConnects / lgCalls : 0;
    const lgBkgRate = lgConnects > 0 ? lgBookings / lgConnects : 0;
    const lgAttRate = lgBookings > 0 ? lgAttended / lgBookings : 0;
    lines.push("📊 " + lgName.toUpperCase() + "'S CUT-THROUGH RATES (vs expected):");
    if (lgCalls > 0) lines.push(rateCheck("Calls → Connected", lgConnRate, expConnRate));
    if (lgConnects > 0) lines.push(rateCheck("Connected → Bookings", lgBkgRate, expBkgRate));
    if (lgBookings > 0) lines.push(rateCheck("Bookings → Attended", lgAttRate, expAttRate));
    if (lgAttended > 0) lines.push(rateCheck("Attended → Closed", actualCloseRate, expCloseRate));
  } else {
    lines.push("📊 CUT-THROUGH RATES (actual vs expected):");
    if (calls && calls.teamActual > 0) lines.push(rateCheck("Calls → Connected", actualConnRate, expConnRate));
    if (connects && connects.teamActual > 0) lines.push(rateCheck("Connected → Bookings", actualBkgRate, expBkgRate));
    if (bookings && bookings.teamActual > 0) lines.push(rateCheck("Bookings → Attended", actualAttRate, expAttRate));
    if (attended && attended.teamActual > 0) lines.push(rateCheck("Attended → Closed", actualCloseRate, expCloseRate));
  }

  const ahead = wd.metricData.filter((md) => md.pct >= 100 && md.teamActual > 0);
  const behind = wd.metricData.filter((md) => md.pct < 100 && md.teamActual > 0);

  lines.push("");
  if (ahead.length > 0) {
    lines.push("✅ AHEAD on: " + ahead.map((m) => m.emoji + " " + m.label + " (" + fmtVal(m.teamActual, m.key) + " vs " + fmtVal(m.projected, m.key) + " target, " + fmtVar(m.variance, m.key) + ")").join(", "));
  }
  if (behind.length > 0) {
    lines.push("❌ BEHIND on: " + behind.map((m) => m.emoji + " " + m.label + " (" + fmtVal(m.teamActual, m.key) + " vs " + fmtVal(m.projected, m.key) + " target, " + fmtVar(m.variance, m.key) + ")").join(", "));
  }

  lines.push("");
  lines.push("👥 CONTRIBUTION SPLIT:");
  const keyMetrics = wd.metricData.filter((m) => ["bookings", "meetings", "units", "revenue"].includes(m.key) && m.teamActual > 0);
  for (const m of keyMetrics) {
    const cPct = Math.round(m.closerPct);
    const lPct = Math.round(m.lgPct);
    const dominant = cPct > lPct ? closerName : lPct > cPct ? lgName : "Even";
    lines.push(
      m.emoji + " " + m.label + ": " + closerName + " " + fmtVal(m.closerVal, m.key) + " (" + cPct + "%) · " +
      lgName + " " + fmtVal(m.lgVal, m.key) + " (" + lPct + "%)" +
      (Math.abs(cPct - lPct) > 20 ? " ← " + dominant + " carrying" : "")
    );
  }

  if (wd.trend.icon !== "—") {
    lines.push("");
    lines.push("📈 TREND: " + wd.trend.icon + " " + wd.trend.label + " vs previous week.");
  }

  if (!isLive && wd.weekNum < currentWeek) {
    lines.push("");
    if (revPct >= 100) {
      lines.push("🏁 WRAP-UP: Strong week. Revenue target hit at " + revPct + "% (" + (revMetric ? fmtVal(revMetric.teamActual, "revenue") : "") + ").");
    } else if (revPct >= 75) {
      lines.push("🏁 WRAP-UP: Reasonable week — revenue reached " + revPct + "% of target. Key gaps: " + behind.map((m) => m.label.toLowerCase()).join(", ") + ".");
    } else {
      lines.push("🏁 WRAP-UP: Below expectations — revenue at " + revPct + "% of target. Key gaps: " + behind.slice(0, 3).map((m) => m.label.toLowerCase() + " (" + Math.round(m.pct) + "%)").join(", ") + ".");
    }
  }

  return lines;
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

function PerformanceSummaryContent() {
  const [allData, setAllData] = useState<Map<string, DailyRecord[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTabs, setSelectedTabs] = useState<Record<string, number>>({});
  const [pageTab, setPageTab] = useState<"performance" | "easter">("performance");

  const [phoneHours] = usePersistedState("proj-phoneHours", DEFAULT_HOURS);
  const [callsPerHour] = usePersistedState("proj-callsPerHour", DEFAULT_CALLS_PER_HOUR);
  const [connectsPerHour] = usePersistedState("proj-connectsPerHour", DEFAULT_CONNECTS_PER_HOUR);
  const [bookingsPerHour] = usePersistedState("proj-bookingsPerHour", DEFAULT_BOOKINGS_PER_HOUR);
  const [attendanceRate] = usePersistedState("proj-attendanceRate", DEFAULT_ATTENDANCE_RATE);
  const [closeRate] = usePersistedState("proj-closeRate", DEFAULT_CLOSE_RATE);
  const [dealValue] = usePersistedState("proj-dealValue", DEFAULT_DEAL_VALUE);

  const currentWeek = getCurrentWeek();

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

      const tabs: Record<string, number> = {};
      buddyPairs.forEach((p) => { tabs[p.label] = getCurrentWeek(); });
      setSelectedTabs(tabs);
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
      const pairWeeksToShow = weeksToShow.filter((w) => w >= (pair.startGlobalWeek ?? 0));

      const weekData: WeekData[] = pairWeeksToShow.map((weekNum, idx) => {
        const daysElapsed = weekNum < currentWeek ? 5 : getWorkingDaysElapsed(weekNum);
        const metricData: MetricResult[] = compMetrics.map((m) => {
          const closerVal = getPersonWeekTotal(pair.closer, weekNum, m.key);
          const lgVal = getPersonWeekTotal(pair.leadGen, weekNum, m.key);
          const teamActual = closerVal + lgVal;
          const projected = getTeamWeeklyProjected(weekNum, m.projKey);
          const pct = pctOf(teamActual, projected);
          const variance = teamActual - projected;
          const closerPct = teamActual > 0 ? (closerVal / teamActual) * 100 : 0;
          const lgPct = teamActual > 0 ? (lgVal / teamActual) * 100 : 0;
          return { ...m, teamActual, projected, pct, variance, closerVal, lgVal, closerPct, lgPct, daysElapsed };
        });

        const weights: Record<string, number> = { calls_made: 0.5, calls: 0.5, bookings: 2, meetings: 1.5, units: 2, revenue: 2.5 };
        const weightedSum = metricData.reduce((s, md) => s + md.pct * (weights[md.key] || 1), 0);
        const totalWeight = metricData.reduce((s, md) => s + (weights[md.key] || 1), 0);
        const overallPct = totalWeight > 0 ? weightedSum / totalWeight : 0;

        return { weekNum, daysElapsed, metricData, overallPct, trend: { icon: "—", label: "", color: "" } };
      });

      const weekDataWithTrend: WeekData[] = weekData.map((wd, idx) => {
        const prevPct = idx > 0 ? weekData[idx - 1].overallPct : null;
        return { ...wd, trend: trendArrow(wd.overallPct, prevPct) };
      });

      return { pair, closerName, lgName, weekData: weekDataWithTrend };
    });
  }, [allData, currentWeek, projTeamDaily]);

  if (isLoading && pageTab === "performance") {
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
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {pageTab === "performance" ? "📊 Performance vs Projections" : "🐣 Easter Promotion"}
                </h1>
                {pageTab === "performance" && (
                  <p className="text-slate-400 text-[11px]">
                    Weekly team target: {weeklyProj.calls} calls · {weeklyProj.connects} conn · {weeklyProj.bookings} bkgs · {weeklyProj.attended} att · {weeklyProj.deals} deals · ${weeklyProj.revenue.toLocaleString()} rev
                  </p>
                )}
                {pageTab === "easter" && (
                  <p className="text-slate-400 text-[11px]">
                    3rd March – 1st April 2026 • 10 express build spots • $100 lead gen commission per deal
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pageTab === "performance" && (
                <>
                  <Link href="/projections" className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-600 transition-colors">
                    ⚙️ Edit Projections
                  </Link>
                  <Link href="/admin/performance" className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-600 transition-colors">
                    📋 Full Data →
                  </Link>
                </>
              )}
              <PrintButton />
            </div>
          </div>

          {/* ═══ PAGE TABS ═══ */}
          <div className="flex items-center gap-1 mt-3 border-t border-slate-700 pt-3">
            <button
              onClick={() => setPageTab("performance")}
              className={
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors " +
                (pageTab === "performance"
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white hover:bg-slate-700")
              }
            >
              📊 Performance
            </button>
            <button
              onClick={() => setPageTab("easter")}
              className={
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors " +
                (pageTab === "easter"
                  ? "bg-gradient-to-r from-pink-500 to-[#E6017D] text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700")
              }
            >
              🐣 Easter Promotion
            </button>
          </div>
        </div>
      </header>

      {/* ═══ EASTER PROMOTION TAB ═══ */}
      {pageTab === "easter" && (
        <div className="max-w-[1500px] mx-auto px-4 py-5">
          <EasterPromoAdmin />
        </div>
      )}

      {/* ═══ PERFORMANCE TAB (existing content, unchanged) ═══ */}
      {pageTab === "performance" && (
        <div className="max-w-[1500px] mx-auto px-4 py-5 space-y-6">

          {/* Score explanation */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 text-[10px] text-gray-500 flex items-center gap-4">
            <span className="font-bold text-gray-600">Score = weighted avg across all metrics</span>
            <span>📞🔗 Calls/Connected × 0.5</span>
            <span>📅 Bookings × 2</span>
            <span>🤝 Attended × 1.5</span>
            <span>🏆 Deals × 2</span>
            <span>💰 Revenue × 2.5</span>
          </div>

          {teamScorecards.map(({ pair, closerName, lgName, weekData }) => {
            const tc = teamColors[pair.color] || teamColors.indigo;
            const latestWeek = weekData[weekData.length - 1];
            const latestTL = latestWeek ? trafficLight(latestWeek.overallPct) : trafficLight(0);
            const activeTab = selectedTabs[pair.label] ?? currentWeek;
            const activeWeekData = weekData.find((w) => w.weekNum === activeTab);

            return (
              <div key={pair.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Sticky team header */}
                <div className={tc.header + " text-white px-5 py-3 sticky top-0 z-30"}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-bold">{pair.label}</h2>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-white/20 px-2 py-0.5 rounded-full"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1"></span>{closerName} <span className="opacity-60">Closer</span></span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full"><span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>{lgName} <span className="opacity-60">Lead Gen</span></span>
                      </div>
                    </div>
                    {latestWeek && (
                      <div className="flex items-center gap-3">
                        <span className={latestWeek.trend.color + " text-xs font-bold bg-white/90 px-2 py-0.5 rounded-full"}>
                          {latestWeek.trend.icon} {latestWeek.trend.label}
                        </span>
                        {(() => {
                          const hRevM = latestWeek.metricData.find((m) => m.key === "revenue");
                          const hRevPct = hRevM && hRevM.projected > 0 ? Math.round((hRevM.teamActual / hRevM.projected) * 100) : 0;
                          const htl = trafficLight(hRevPct);
                          return (
                            <span className={htl.text + " text-xs font-bold bg-white/90 px-2 py-0.5 rounded-full"}>
                              💰 {hRevPct}% rev
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scorecard table */}
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
                        const localWC = weekConfig[wd.weekNum + (pair.weekLabelOffset ?? 0)] ?? weekConfig[wd.weekNum];
                        const isNow = wd.weekNum === currentWeek;
                        const isSelected = wd.weekNum === activeTab;
                        const tl = trafficLight(wd.overallPct);
                        const hasData = wd.metricData.some((md) => md.teamActual > 0);

                        return (
                          <tr
                            key={wd.weekNum}
                            className={
                              "border-b border-gray-100 cursor-pointer transition-colors " +
                              (isSelected ? "ring-2 ring-inset ring-slate-400 " : "") +
                              (isNow ? "bg-[#E6017D]/5 " : "") +
                              (!hasData ? "opacity-40 " : "hover:bg-gray-50/70 ")
                            }
                            onClick={() => setSelectedTabs((prev) => ({ ...prev, [pair.label]: wd.weekNum }))}
                          >
                            <td className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap align-top">
                              <div className="flex items-center gap-1">
                                {isSelected && <span className="text-[8px]">▶</span>}
                                {localWC.shortLabel}
                              </div>
                              {isNow && <span className="text-[8px] bg-[#E6017D] text-white px-1 py-0.5 rounded font-bold">NOW</span>}
                              {isNow && wd.daysElapsed < 5 && <div className="text-gray-400 text-[9px]">{wd.daysElapsed}/5 days</div>}
                            </td>

                            {wd.metricData.map((md) => {
                              const mtl = trafficLight(md.pct);
                              const hasVal = md.teamActual > 0;
                              return (
                                <td key={md.key} className={"px-1.5 py-2 text-center align-top " + (hasVal ? mtl.bg : "")}>
                                  {hasVal ? (
                                    <div>
                                      <div className="flex items-center justify-center gap-1">
                                        <span className={"text-sm font-black tabular-nums " + mtl.text}>{fmtVal(md.teamActual, md.key)}</span>
                                        <span className="text-gray-300">/</span>
                                        <span className="text-gray-400 tabular-nums text-[10px]">{fmtVal(md.projected, md.key)}</span>
                                      </div>
                                      <div className={"text-[9px] font-semibold tabular-nums " + (md.variance >= 0 ? "text-emerald-600" : "text-red-500")}>
                                        {fmtVar(md.variance, md.key)}
                                      </div>
                                      <div className="mt-1 mx-auto" style={{ maxWidth: "100px" }}>
                                        <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-200">
                                          <div className="bg-emerald-500 transition-all" style={{ width: md.closerPct + "%" }} title={closerName + ": " + fmtVal(md.closerVal, md.key)} />
                                          <div className="bg-blue-400 transition-all" style={{ width: md.lgPct + "%" }} title={lgName + ": " + fmtVal(md.lgVal, md.key)} />
                                        </div>
                                        <div className="flex justify-between mt-0.5 text-[9px] tabular-nums">
                                          <span className="text-emerald-600 font-semibold">{fmtVal(md.closerVal, md.key)}</span>
                                          <span className="text-blue-500 font-semibold">{fmtVal(md.lgVal, md.key)}</span>
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
                                <span className={"text-sm font-bold " + wd.trend.color} title={wd.trend.label}>{wd.trend.icon}</span>
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

                {/* Split legend */}
                <div className="px-5 py-1.5 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-500">
                  <span className="font-semibold">Split:</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> {closerName} (Closer)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400"></span> {lgName} (Lead Gen)</span>
                  <span className="ml-auto text-gray-400 italic">Click a week row to see exec summary</span>
                </div>

                {/* ═══ TABBED EXEC SUMMARY ═══ */}
                <div className={tc.light + " border-t " + tc.border}>

                  {/* Week tabs */}
                  <div className="flex items-center gap-1 px-5 pt-3 pb-0 overflow-x-auto">
                    {weekData.map((wd) => {
                      const tabWC = weekConfig[wd.weekNum + (pair.weekLabelOffset ?? 0)] ?? weekConfig[wd.weekNum];
                      const isActive = wd.weekNum === activeTab;
                      const hasData = wd.metricData.some((md) => md.teamActual > 0);
                      const isLive = wd.weekNum === currentWeek;
                      const tl = trafficLight(wd.overallPct);

                      return (
                        <button
                          key={wd.weekNum}
                          onClick={() => setSelectedTabs((prev) => ({ ...prev, [pair.label]: wd.weekNum }))}
                          className={
                            "px-3 py-1.5 rounded-t-lg text-xs font-bold transition-colors whitespace-nowrap " +
                            (isActive ? tc.tabActive + " " : hasData ? tc.tab + " " : "text-gray-400 ") +
                            (!hasData ? "opacity-40 " : "")
                          }
                        >
                          {tabWC.shortLabel}
                          {isLive && <span className="ml-1 text-[8px] opacity-70">●</span>}
                          {!isActive && hasData && (
                            <span className={"ml-1 inline-block w-1.5 h-1.5 rounded-full " + tl.dot}></span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Exec summary content */}
                  {activeWeekData && (
                    <div className="px-5 pb-4 pt-2">
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-gray-800">
                            {activeTab === currentWeek ? "📋 Live Summary" : "📋 Week Summary"} — {(weekConfig[activeTab + (pair.weekLabelOffset ?? 0)] ?? weekConfig[activeTab])?.label}
                            {activeTab === currentWeek && <span className="ml-2 text-[10px] font-normal text-gray-400">(updates as data comes in)</span>}
                            {activeTab < currentWeek && <span className="ml-2 text-[10px] font-normal text-gray-400">(final)</span>}
                          </h3>
                          {(() => {
                            const aRevM = activeWeekData.metricData.find((m) => m.key === "revenue");
                            const aRevPct = aRevM && aRevM.projected > 0 ? Math.round((aRevM.teamActual / aRevM.projected) * 100) : 0;
                            const tl = trafficLight(aRevPct);
                            return (
                              <span className={"text-xs font-bold px-2 py-0.5 rounded-full " + tl.bg + " " + tl.text}>
                                💰 {aRevPct}% rev target
                              </span>
                            );
                          })()}
                        </div>

                        <div className="font-mono text-[11px] leading-relaxed text-gray-700 whitespace-pre-wrap">
                          {generateExecSummary(
                            activeWeekData,
                            closerName,
                            lgName,
                            currentWeek,
                            projTeamDaily,
                            {
                              calls_made: getPersonWeekTotal(pair.leadGen, activeTab, "calls_made"),
                              calls: getPersonWeekTotal(pair.leadGen, activeTab, "calls"),
                              bookings: getPersonWeekTotal(pair.leadGen, activeTab, "bookings"),
                              meetings: getPersonWeekTotal(pair.leadGen, activeTab, "meetings"),
                              units: getPersonWeekTotal(pair.leadGen, activeTab, "units"),
                              revenue: getPersonWeekTotal(pair.leadGen, activeTab, "revenue"),
                            }
                          ).map((line, i) => (
                            <div key={i} className={line === "" ? "h-2" : ""}>{line}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}


          {/* ═══ TOM RENNIE (solo + handoffs) ═══ */}
          <RennieDealTracker date={new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" })} />
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
      )}
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
