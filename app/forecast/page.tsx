// app/forecast/page.tsx

"use client";

import { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";
import {
  DEFAULT_RATIOS,
  DEFAULT_RAMP,
  getRampPct,
  calcFullDailyRevenue,
} from "@/lib/projections-config";

// ─── Types ───
interface TeamMember {
  id: string;
  label: string;
  startDate: string; // YYYY-MM-DD
}

interface MonthData {
  month: number; // 0-11
  year: number;
  label: string;
  members: {
    id: string;
    label: string;
    weekInRole: number;
    rampPct: number;
    revenue: number;
  }[];
  grossNew: number;
  cumulativeClients: number;
  churnLoss: number;
  netRevenue: number;
  runningNetRevenue: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmt(v: number): string {
  if (v === 0) return "0";
  if (Number.isInteger(v)) return v.toString();
  return v.toFixed(1);
}

function fmtCurrency(v: number): string {
  return "$" + Math.round(v).toLocaleString();
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

// ─── Get working days in a month ───
function getWorkingDays(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow >= 1 && dow <= 5) count++;
  }
  return count;
}

// ─── Get week number in role for a given month ───
function getWeekInRole(startDate: string, year: number, month: number): number {
  const start = new Date(startDate);
  // Use middle of the target month as reference point
  const mid = new Date(year, month, 15);
  const diffMs = mid.getTime() - start.getTime();
  if (diffMs < 0) return 0; // hasn't started yet
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const weekNum = Math.ceil(diffDays / 7);
  return Math.max(1, weekNum);
}

// ─── Get partial month factor (if starting mid-month) ───
function getPartialMonthFactor(startDate: string, year: number, month: number): number {
  const start = new Date(startDate);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  // If they start after this month, factor is 0
  if (start > monthEnd) return 0;
  // If they started before this month, full month
  if (start <= monthStart) return 1;
  // Partial: count working days from start to end of month
  const totalWorkingDays = getWorkingDays(year, month);
  let workingDaysActive = 0;
  for (let d = start.getDate(); d <= monthEnd.getDate(); d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow >= 1 && dow <= 5) workingDaysActive++;
  }
  return workingDaysActive / totalWorkingDays;
}

// ─── Bar chart component ───
function BarChart({ data, maxVal }: { data: MonthData[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-1.5 h-48 mt-4">
      {data.map((m, i) => {
        const grossH = maxVal > 0 ? (m.grossNew / maxVal) * 100 : 0;
        const netH = maxVal > 0 ? (m.netRevenue / maxVal) * 100 : 0;
        const isCurrentMonth = m.month === new Date().getMonth() && m.year === new Date().getFullYear();
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-lg">
              <div className="font-bold">{MONTH_FULL[m.month]} {m.year}</div>
              <div>Gross: {fmtCurrency(m.grossNew)}</div>
              <div>Churn: -{fmtCurrency(m.churnLoss)}</div>
              <div className="font-bold border-t border-slate-600 pt-1 mt-1">Net: {fmtCurrency(m.netRevenue)}</div>
              <div className="text-slate-400">Running: {fmtCurrency(m.runningNetRevenue)}</div>
            </div>
            {/* Bars */}
            <div className="w-full flex gap-0.5 items-end" style={{ height: "100%" }}>
              <div
                className="flex-1 bg-emerald-200 rounded-t transition-all duration-300"
                style={{ height: `${grossH}%`, minHeight: grossH > 0 ? "2px" : "0" }}
              />
              <div
                className={`flex-1 rounded-t transition-all duration-300 ${m.netRevenue >= 0 ? "bg-emerald-500" : "bg-red-400"}`}
                style={{ height: `${Math.abs(netH)}%`, minHeight: Math.abs(netH) > 0 ? "2px" : "0" }}
              />
            </div>
            <div className={`text-[9px] font-bold ${isCurrentMonth ? "text-emerald-600" : "text-gray-400"}`}>
              {MONTH_NAMES[m.month]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Content ───
function ForecastContent() {
  const today = new Date();
  const currentYear = today.getFullYear();

  // ─── Ratios (linked to projections defaults) ───
  const [ratios, setRatios] = useLocalStorage("forecast-ratios", { ...DEFAULT_RATIOS });
  const [ramp, setRamp] = useLocalStorage("forecast-ramp", DEFAULT_RAMP.map((r) => ({ ...r })));
  const [churnRate, setChurnRate] = useLocalStorage("forecast-churn", 5); // % monthly client loss
  const [forecastYear, setForecastYear] = useLocalStorage("forecast-year", currentYear);

  // ─── Team Members ───
  const [team, setTeam] = useLocalStorage<TeamMember[]>("forecast-team", [
    { id: generateId(), label: "Person 1", startDate: `${currentYear}-03-01` },
  ]);

  const addMember = () => {
    const num = team.length + 1;
    // Default start: 2 months after last person
    const lastStart = team.length > 0 ? new Date(team[team.length - 1].startDate) : new Date();
    lastStart.setMonth(lastStart.getMonth() + 2);
    const startStr = lastStart.toISOString().split("T")[0];
    setTeam([...team, { id: generateId(), label: `Person ${num}`, startDate: startStr }]);
  };

  const removeMember = (id: string) => {
    if (team.length <= 1) return;
    setTeam(team.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeam(team.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const updateRamp = (weekIndex: number, pct: number) => {
    const newRamp = [...ramp];
    newRamp[weekIndex] = { ...newRamp[weekIndex], pct: Math.min(100, Math.max(0, pct)) };
    setRamp(newRamp);
  };

  // ─── Full daily revenue at 100% standard ───
  const fullDailyRevenue = calcFullDailyRevenue(ratios);

  // ─── Build monthly forecast data ───
  const monthlyData: MonthData[] = useMemo(() => {
    const months: MonthData[] = [];
    let cumulativeClients = 0;
    let runningNet = 0;

    for (let m = 0; m < 12; m++) {
      const workingDays = getWorkingDays(forecastYear, m);
      const memberData = team.map((member) => {
        const weekInRole = getWeekInRole(member.startDate, forecastYear, m);
        const partialFactor = getPartialMonthFactor(member.startDate, forecastYear, m);

        if (weekInRole <= 0 || partialFactor === 0) {
          return { id: member.id, label: member.label, weekInRole: 0, rampPct: 0, revenue: 0 };
        }

        const rampPct = getRampPct(weekInRole, ramp);
        const dailyRev = fullDailyRevenue * (rampPct / 100);
        const monthlyRev = dailyRev * workingDays * partialFactor;

        return { id: member.id, label: member.label, weekInRole, rampPct, revenue: monthlyRev };
      });

      const grossNew = memberData.reduce((sum, md) => sum + md.revenue, 0);

      // Deals closed this month = grossNew / dealValue
      const newDealsThisMonth = ratios.dealValue > 0 ? grossNew / ratios.dealValue : 0;
      cumulativeClients += newDealsThisMonth;

      // Churn: lose X% of cumulative client base each month
      const churnLoss = cumulativeClients * (churnRate / 100) * ratios.dealValue;
      cumulativeClients -= cumulativeClients * (churnRate / 100);

      const netRevenue = grossNew - churnLoss;
      runningNet += netRevenue;

      months.push({
        month: m,
        year: forecastYear,
        label: `${MONTH_NAMES[m]} ${forecastYear}`,
        members: memberData,
        grossNew: Math.round(grossNew),
        cumulativeClients: Math.round(cumulativeClients * 10) / 10,
        churnLoss: Math.round(churnLoss),
        netRevenue: Math.round(netRevenue),
        runningNetRevenue: Math.round(runningNet),
      });
    }

    return months;
  }, [team, ramp, ratios, churnRate, forecastYear, fullDailyRevenue]);

  // ─── Summary Stats ───
  const totalGross = monthlyData.reduce((s, m) => s + m.grossNew, 0);
  const totalChurn = monthlyData.reduce((s, m) => s + m.churnLoss, 0);
  const totalNet = monthlyData.reduce((s, m) => s + m.netRevenue, 0);
  const eoyClients = monthlyData[11]?.cumulativeClients || 0;
  const maxMonthlyGross = Math.max(...monthlyData.map((m) => m.grossNew), 1);
  const peakMonth = monthlyData.reduce((best, m) => (m.netRevenue > best.netRevenue ? m : best), monthlyData[0]);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span>📈</span> Revenue Forecast
              </h1>
              <p className="text-sm text-slate-400">Model team growth and project annual revenue</p>
            </div>
            <Link
              href="/projections"
              className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              📊 Per-Person Projections →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">

        {/* ─── Year Selector + Summary Cards ─── */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={() => setForecastYear(forecastYear - 1)} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">←</button>
            <h2 className="text-2xl font-black text-slate-900 tabular-nums">{forecastYear}</h2>
            <button onClick={() => setForecastYear(forecastYear + 1)} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">→</button>
          </div>
          <div className="flex-1" />
          <div className="text-right text-xs text-gray-400">
            Full standard: {fmtCurrency(fullDailyRevenue)}/day per person
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { emoji: "👥", value: team.length.toString(), label: "Team Size", sub: "people" },
            { emoji: "💰", value: fmtCurrency(totalGross), label: "Gross Revenue", sub: "annual" },
            { emoji: "📉", value: `-${fmtCurrency(totalChurn)}`, label: "Churn Loss", sub: `${churnRate}% monthly`, red: true },
            { emoji: "📊", value: fmtCurrency(totalNet), label: "Net Revenue", sub: "annual" },
            { emoji: "🏢", value: fmt(eoyClients), label: "EOY Clients", sub: "active" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <span className="text-xl">{item.emoji}</span>
              <div className={`text-lg font-black tabular-nums mt-1 ${(item as { red?: boolean }).red ? "text-red-500" : "text-slate-900"}`}>{item.value}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</div>
              {item.sub && <div className="text-[10px] text-gray-400 mt-0.5">{item.sub}</div>}
            </div>
          ))}
        </div>

        {/* ─── Revenue Chart ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Monthly Revenue Trajectory</h3>
            <div className="flex items-center gap-4 text-[10px]">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-200" /> Gross</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> Net</div>
            </div>
          </div>
          <BarChart data={monthlyData} maxVal={maxMonthlyGross} />
        </div>

        {/* ─── Team Builder ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">👥</span>
              <h2 className="text-sm font-bold text-slate-900">Team Builder</h2>
            </div>
            <button
              onClick={addMember}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              + Add Person
            </button>
          </div>

          <div className="space-y-3">
            {team.map((member, idx) => {
              // Find when they hit 100%
              const fullProficiencyDate = new Date(member.startDate);
              fullProficiencyDate.setDate(fullProficiencyDate.getDate() + 8 * 7);
              const weekInRoleNow = getWeekInRole(member.startDate, today.getFullYear(), today.getMonth());
              const currentRampPct = getRampPct(weekInRoleNow, ramp);

              return (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={member.label}
                      onChange={(e) => updateMember(member.id, "label", e.target.value)}
                      className="text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-slate-900 outline-none px-1 py-0.5"
                    />
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Start:</span>
                      <input
                        type="date"
                        value={member.startDate}
                        onChange={(e) => updateMember(member.id, "startDate", e.target.value)}
                        className="text-xs font-semibold text-slate-900 border border-gray-200 rounded px-2 py-1 focus:border-slate-900 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">100% by:</span>
                      <span className="font-bold text-emerald-600">
                        {fullProficiencyDate.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex-1" />
                    {weekInRoleNow > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        currentRampPct >= 100 ? "bg-emerald-100 text-emerald-700" :
                        currentRampPct >= 75 ? "bg-amber-100 text-amber-700" :
                        "bg-sky-100 text-sky-700"
                      }`}>
                        Week {weekInRoleNow} · {currentRampPct}%
                      </span>
                    )}
                    {team.length > 1 && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Mini ramp timeline */}
                  <div className="mt-3 ml-13 flex gap-0.5">
                    {ramp.map((r, wi) => {
                      const isActive = weekInRoleNow > 0 && weekInRoleNow > wi;
                      const isCurrent = weekInRoleNow === wi + 1;
                      return (
                        <div key={wi} className="flex-1 group relative">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isActive
                                ? r.pct >= 100 ? "bg-emerald-500" : r.pct >= 75 ? "bg-amber-400" : "bg-sky-400"
                                : "bg-gray-200"
                            } ${isCurrent ? "ring-2 ring-offset-1 ring-slate-400" : ""}`}
                          />
                          <div className="text-[8px] text-center text-gray-400 mt-0.5">W{wi + 1}</div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[9px] rounded px-2 py-1 whitespace-nowrap z-10">
                            Week {wi + 1}: {r.pct}% — {r.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Ramp Schedule Editor ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">🎯</span>
            <h2 className="text-sm font-bold text-slate-900">8-Week Ramp Schedule</h2>
            <span className="text-[10px] text-gray-400 ml-2">% of full standard output per week</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {ramp.map((r, i) => (
              <div key={i} className={`text-center p-3 rounded-lg border ${
                r.pct >= 100 ? "bg-emerald-50 border-emerald-200" :
                r.pct >= 75 ? "bg-amber-50 border-amber-200" :
                "bg-sky-50 border-sky-200"
              }`}>
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Week {r.week}</div>
                <div className="flex items-center justify-center gap-0.5">
                  <input
                    type="number"
                    value={r.pct}
                    onChange={(e) => updateRamp(i, Number(e.target.value))}
                    min={0}
                    max={100}
                    step={5}
                    className="w-10 text-center text-lg font-black tabular-nums bg-transparent border-b border-gray-300 focus:border-slate-900 outline-none"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
                <div className="text-[9px] text-gray-400 mt-1">{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Retention & Churn ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">📉</span>
            <h2 className="text-sm font-bold text-slate-900">Retention & Churn Allowance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Churn Rate Slider */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Monthly Client Loss Rate</h3>
              <div className="flex items-center gap-4 mb-3">
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={churnRate}
                  onChange={(e) => setChurnRate(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-800 [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex items-center gap-0.5">
                  <input
                    type="number"
                    value={churnRate}
                    onChange={(e) => setChurnRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                    step={0.5}
                    className="w-12 text-center text-xl font-black text-slate-900 tabular-nums bg-transparent border-b-2 border-gray-200 focus:border-slate-900 outline-none"
                  />
                  <span className="text-sm text-gray-400">%</span>
                </div>
              </div>
              <div className="text-[10px] text-gray-400">
                {churnRate === 0
                  ? "No churn — all clients retained (unrealistic but useful as a ceiling)"
                  : `Losing ~${churnRate}% of clients each month. Tightening this improves EOY revenue significantly.`
                }
              </div>
            </div>

            {/* Impact Summary */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Annual Impact</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                  <span className="text-xs text-gray-600">Gross New Revenue</span>
                  <span className="text-sm font-black text-emerald-600 tabular-nums">{fmtCurrency(totalGross)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-xs text-gray-600">Lost to Churn ({churnRate}%)</span>
                  <span className="text-sm font-black text-red-500 tabular-nums">-{fmtCurrency(totalChurn)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <span className="text-xs text-slate-300 font-bold">Net Annual Revenue</span>
                  <span className="text-lg font-black text-emerald-400 tabular-nums">{fmtCurrency(totalNet)}</span>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-gray-400">
                {churnRate > 0 && (
                  <>At {churnRate - 1}% churn, net would be ~{fmtCurrency(totalGross * (1 - ((churnRate - 1) / 100) * 3))} — every 1% matters.</>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Per-Person Ratios (linked to projections) ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">⚙️</span>
              <h2 className="text-sm font-bold text-slate-900">Per-Person Ratios (at full proficiency)</h2>
            </div>
            <Link
              href="/projections"
              className="text-xs text-blue-600 hover:underline"
            >
              Open detailed calculator →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Phone Hrs/Day", value: ratios.phoneHoursPerDay, key: "phoneHoursPerDay", step: 0.5 },
              { label: "Bookings/Hr", value: ratios.bookingsPerHour, key: "bookingsPerHour", step: 0.1 },
              { label: "Attendance %", value: ratios.attendanceRate * 100, key: "attendanceRate", step: 5, isPct: true },
              { label: "Close Rate %", value: ratios.closeRate * 100, key: "closeRate", step: 5, isPct: true },
              { label: "Deal Value", value: ratios.dealValue, key: "dealValue", step: 50, prefix: "$" },
              { label: "Calls/Hr", value: ratios.callsPerHour, key: "callsPerHour", step: 1 },
            ].map((item) => (
              <div key={item.key} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.label}</div>
                <div className="flex items-center justify-center gap-0.5">
                  {item.prefix && <span className="text-xs text-gray-400">{item.prefix}</span>}
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if ((item as { isPct?: boolean }).isPct) {
                        setRatios({ ...ratios, [item.key]: Math.min(1, val / 100) });
                      } else {
                        setRatios({ ...ratios, [item.key]: val });
                      }
                    }}
                    step={item.step}
                    className="w-14 text-center text-lg font-black tabular-nums bg-transparent border-b border-gray-300 focus:border-slate-900 outline-none"
                  />
                  {(item as { isPct?: boolean }).isPct && <span className="text-xs text-gray-400">%</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-[10px] text-gray-400">
            Full daily output: {fmtCurrency(fullDailyRevenue)}/day → {fmtCurrency(fullDailyRevenue * 22)}/month per person at 100%
          </div>
        </div>

        {/* ─── Monthly Breakdown Table ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-slate-900">Monthly Breakdown — {forecastYear}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-400">Month</th>
                  {team.map((m) => (
                    <th key={m.id} className="px-3 py-2.5 text-center font-semibold text-gray-400">{m.label}</th>
                  ))}
                  <th className="px-4 py-2.5 text-center font-semibold text-gray-400">Gross</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-gray-400">Churn</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-emerald-600">Net</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-gray-400">Running</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((md, i) => {
                  const isCurrentMonth = md.month === today.getMonth() && md.year === today.getFullYear();
                  return (
                    <tr key={i} className={`border-b border-gray-100 ${isCurrentMonth ? "bg-emerald-50/50" : ""}`}>
                      <td className={`px-4 py-2.5 font-semibold ${isCurrentMonth ? "text-emerald-700" : "text-gray-700"}`}>
                        {MONTH_FULL[md.month]}
                        {isCurrentMonth && <span className="text-[9px] ml-1 text-emerald-500">●</span>}
                      </td>
                      {md.members.map((mem) => (
                        <td key={mem.id} className="px-3 py-2.5 text-center">
                          {mem.weekInRole > 0 ? (
                            <div>
                              <div className="font-bold text-slate-700 tabular-nums">{fmtCurrency(mem.revenue)}</div>
                              <div className={`text-[9px] ${
                                mem.rampPct >= 100 ? "text-emerald-500" :
                                mem.rampPct >= 75 ? "text-amber-500" :
                                "text-sky-500"
                              }`}>
                                W{mem.weekInRole} · {mem.rampPct}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-center font-bold text-slate-700 tabular-nums">{fmtCurrency(md.grossNew)}</td>
                      <td className="px-4 py-2.5 text-center text-red-400 tabular-nums">-{fmtCurrency(md.churnLoss)}</td>
                      <td className="px-4 py-2.5 text-center font-black text-emerald-600 tabular-nums">{fmtCurrency(md.netRevenue)}</td>
                      <td className="px-4 py-2.5 text-center font-semibold text-gray-500 tabular-nums">{fmtCurrency(md.runningNetRevenue)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800 text-white">
                  <td className="px-4 py-3 font-bold" colSpan={team.length + 1}>Annual Total</td>
                  <td className="px-4 py-3 text-center font-bold tabular-nums">{fmtCurrency(totalGross)}</td>
                  <td className="px-4 py-3 text-center text-red-300 tabular-nums">-{fmtCurrency(totalChurn)}</td>
                  <td className="px-4 py-3 text-center font-black text-emerald-400 tabular-nums">{fmtCurrency(totalNet)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function ForecastPage() {
  return (
    <PasswordGate requireMaster>
      <ForecastContent />
    </PasswordGate>
  );
}
