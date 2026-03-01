// app/commissions-new/page.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";
import { usePersistedState } from "@/hooks/usePersistedState";

// ─── Commission Tiers (from How Your Commissions Work) ───
const COMMISSION_TIERS = [
  { tier: 1, minRevenue: 2500, maxRevenue: 4999.99, units: 5, rate: 0.10 },
  { tier: 2, minRevenue: 5000, maxRevenue: 7499.99, units: 10, rate: 0.25 },
  { tier: 3, minRevenue: 7500, maxRevenue: 9999.99, units: 15, rate: 0.40 },
  { tier: 4, minRevenue: 10000, maxRevenue: Infinity, units: 20, rate: 0.50 },
];

function getCommissionTier(revenue: number) {
  if (revenue < 2500) return { tier: 0, rate: 0, commission: 0 };
  for (const t of COMMISSION_TIERS) {
    if (revenue >= t.minRevenue && revenue <= t.maxRevenue) {
      return { tier: t.tier, rate: t.rate, commission: revenue * t.rate };
    }
  }
  const t4 = COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
  return { tier: t4.tier, rate: t4.rate, commission: revenue * t4.rate };
}

function fmtCurrency(v: number): string {
  return "$" + Math.round(v).toLocaleString();
}

// ─── Defaults (same as projections) ───
const DEFAULT_HOURS = 3.5;
const DEFAULT_DEAL_VALUE = 400;
const DEFAULT_BOOKINGS_PER_HOUR = 1.5;
const DEFAULT_ATTENDANCE_RATE = 0.5;
const DEFAULT_CLOSE_RATE = 0.5;
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getBusinessDays(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow >= 1 && dow <= 5) count++;
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

function CommissionsNewContent() {
  // ── Read from projections' localStorage keys (single source of truth) ──
  const [phoneHours] = usePersistedState("proj-phoneHours", DEFAULT_HOURS);
  const [bookingsPerHour] = usePersistedState("proj-bookingsPerHour", DEFAULT_BOOKINGS_PER_HOUR);
  const [attendanceRate] = usePersistedState("proj-attendanceRate", DEFAULT_ATTENDANCE_RATE);
  const [closeRate] = usePersistedState("proj-closeRate", DEFAULT_CLOSE_RATE);
  const [dealValue] = usePersistedState("proj-dealValue", DEFAULT_DEAL_VALUE);

  // ── Commission rate modifier (persisted) ──
  const [commissionPct, setCommissionPct] = usePersistedState("comm-new-ratePct", 100);

  // ── Per-deal bonus (persisted) ──
  const [perDealBonus, setPerDealBonus] = usePersistedState("comm-new-perDealBonus", 100);

  // ── Local state ──
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // ── Derived calculations ──
  const dealsPerDay = bookingsPerHour * phoneHours * attendanceRate * closeRate;
  const revenuePerDay = dealsPerDay * dealValue;
  const businessDays = getBusinessDays(viewYear, viewMonth);
  const monthlyDeals = dealsPerDay * businessDays;
  const monthlyRevenue = revenuePerDay * businessDays;
  const tierResult = getCommissionTier(monthlyRevenue);
  const tier = tierResult.tier;
  const rate = tierResult.rate;
  const commissionFull = tierResult.commission;
  const commission = commissionFull * (commissionPct / 100);

  // ── Per-deal bonus for current month ──
  const monthlyBonusTotal = monthlyDeals * perDealBonus;
  const monthlyTotalEarnings = commission + monthlyBonusTotal;

  // ── 12-month view ──
  const monthlyBreakdown = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const bd = getBusinessDays(viewYear, m);
      const rev = revenuePerDay * bd;
      const deals = dealsPerDay * bd;
      const c = getCommissionTier(rev);
      const comm = c.commission * (commissionPct / 100);
      const bonus = deals * perDealBonus;
      return { month: m, businessDays: bd, revenue: rev, deals, tier: c.tier, rate: c.rate, commissionFull: c.commission, commission: comm, bonus, totalEarnings: comm + bonus };
    });
  }, [viewYear, revenuePerDay, dealsPerDay, commissionPct, perDealBonus]);

  const yearlyRevenue = monthlyBreakdown.reduce((s, m) => s + m.revenue, 0);
  const yearlyCommission = monthlyBreakdown.reduce((s, m) => s + m.commission, 0);
  const yearlyDeals = monthlyBreakdown.reduce((s, m) => s + m.deals, 0);
  const yearlyBonus = monthlyBreakdown.reduce((s, m) => s + m.bonus, 0);
  const yearlyTotalEarnings = yearlyCommission + yearlyBonus;

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };

  const tierColor = (t: number) => {
    if (t === 0) return { bg: "bg-gray-100", text: "text-gray-500", badge: "bg-gray-200 text-gray-600" };
    if (t === 1) return { bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" };
    if (t === 2) return { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" };
    if (t === 3) return { bg: "bg-purple-50", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" };
    return { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" };
  };

  const tc = tierColor(tier);

  // ── SVG bar chart for annual bonus + commission ──
  const maxEarnings = Math.max(...monthlyBreakdown.map((m) => m.totalEarnings), 1);

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1100px] mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">💰 New Starter Commissions</h1>
                <p className="text-sm text-slate-400">Commission tiers + per-deal bonus for new team members</p>
              </div>
            </div>
            <Link href="/projections" className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
              📊 Edit Projections →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">

        {/* Live Inputs from Projections */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔗</span>
              <div>
                <h2 className="text-sm font-bold text-slate-700">Live from Projections</h2>
                <p className="text-[10px] text-slate-400">These values sync automatically from /projections</p>
              </div>
            </div>
            <Link href="/projections" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">Change inputs →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase">Phone hrs/day</div>
              <div className="text-lg font-black text-slate-800">{phoneHours}</div>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase">Bookings/hr</div>
              <div className="text-lg font-black text-slate-800">{bookingsPerHour}</div>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase">Attendance</div>
              <div className="text-lg font-black text-slate-800">{Math.round(attendanceRate * 100)}%</div>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase">Close Rate</div>
              <div className="text-lg font-black text-slate-800">{Math.round(closeRate * 100)}%</div>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase">Deal Value</div>
              <div className="text-lg font-black text-slate-800">${dealValue}</div>
            </div>
          </div>
        </div>

        {/* Commission Rate + Per-Deal Bonus Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Commission Rate Modifier */}
          <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <h2 className="text-sm font-bold text-slate-700">Commission Rate</h2>
                <p className="text-[10px] text-slate-400">% of commission received (100% = full, 50% = half)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[50, 60, 70, 80, 90, 100].map((p) => (
                  <button key={p} onClick={() => setCommissionPct(p)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${commissionPct === p ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {p}%
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                <input type="number" value={commissionPct}
                  onChange={(e) => setCommissionPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                  min={0} max={100} step={1}
                  className="w-20 text-center text-lg font-black text-indigo-700 tabular-nums bg-indigo-50 border-2 border-indigo-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 focus:bg-white outline-none" />
                <span className="text-lg font-bold text-indigo-400">%</span>
              </div>
            </div>
            {commissionPct < 100 && (
              <div className="mt-3 px-3 py-2 bg-indigo-50 rounded-lg text-xs text-indigo-700">
                💡 Commissions scaled to <span className="font-bold">{commissionPct}%</span> of the full tier amount.
              </div>
            )}
          </div>

          {/* Per-Deal Bonus */}
          <div className="bg-white rounded-2xl border-2 border-pink-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎁</span>
              <div>
                <h2 className="text-sm font-bold text-slate-700">Per-Deal Bonus</h2>
                <p className="text-[10px] text-slate-400">Additional bonus paid per closed deal on top of commission</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[50, 100, 150, 200, 250, 300].map((b) => (
                  <button key={b} onClick={() => setPerDealBonus(b)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${perDealBonus === b ? "bg-pink-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    ${b}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                <span className="text-lg font-bold text-pink-400">$</span>
                <input type="number" value={perDealBonus}
                  onChange={(e) => setPerDealBonus(Math.max(0, Number(e.target.value) || 0))}
                  min={0} step={10}
                  className="w-24 text-center text-lg font-black text-pink-700 tabular-nums bg-pink-50 border-2 border-pink-200 rounded-lg px-2 py-1.5 focus:border-pink-500 focus:bg-white outline-none" />
                <span className="text-xs font-semibold text-pink-400">/ deal</span>
              </div>
            </div>
            <div className="mt-3 px-3 py-2 bg-pink-50 rounded-lg text-xs text-pink-700">
              💡 Each closed deal earns an extra <span className="font-bold">{fmtCurrency(perDealBonus)}</span>.
              This month: <span className="font-bold">{monthlyDeals.toFixed(1)} deals × {fmtCurrency(perDealBonus)} = {fmtCurrency(monthlyBonusTotal)}</span>.
            </div>
          </div>
        </div>

        {/* Commission Tier Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-1">How Your Commissions Work</h2>
          <p className="text-xs text-slate-400 mb-5">Once you generate $2,500 in sales revenue, you unlock commissions. Tiers range from 10% to 50%.</p>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className={`grid ${commissionPct < 100 ? "grid-cols-6" : "grid-cols-5"} bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider`}>
              <div className="px-4 py-3 text-center">Commission Tier</div>
              <div className="px-4 py-3 text-center">Sales Revenue ($)</div>
              <div className="px-4 py-3 text-center">Units<br /><span className="font-normal text-slate-400">@ ${dealValue} deal value</span></div>
              <div className="px-4 py-3 text-center text-emerald-300">Commission Rate (%)</div>
              <div className="px-4 py-3 text-center text-emerald-300">Commission @ 100%</div>
              {commissionPct < 100 && <div className="px-4 py-3 text-center text-indigo-300">Commission @ {commissionPct}%</div>}
            </div>
            {COMMISSION_TIERS.map((t, i) => {
              const isActive = tier === t.tier;
              const commissionAmount = t.minRevenue * t.rate;
              const adjustedAmount = commissionAmount * (commissionPct / 100);
              const units = Math.round(t.minRevenue / dealValue);
              return (
                <div key={t.tier} className={`grid ${commissionPct < 100 ? "grid-cols-6" : "grid-cols-5"} border-t border-gray-100 ${isActive ? "bg-emerald-50 ring-2 ring-emerald-400 ring-inset" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <div className="px-4 py-4 flex items-center justify-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${isActive ? "bg-emerald-500 ring-2 ring-emerald-300" : "bg-slate-400"}`}>{t.tier}</span>
                  </div>
                  <div className="px-4 py-4 text-center font-bold text-slate-800 text-lg">{fmtCurrency(t.minRevenue)}</div>
                  <div className="px-4 py-4 text-center text-gray-500">{units}</div>
                  <div className={`px-4 py-4 text-center font-bold text-lg ${isActive ? "text-emerald-600" : "text-emerald-500"}`}>{Math.round(t.rate * 100)}%</div>
                  <div className={`px-4 py-4 text-center font-bold text-lg ${isActive ? "text-emerald-700" : "text-emerald-600"}`}>{fmtCurrency(commissionAmount)}</div>
                  {commissionPct < 100 && <div className={`px-4 py-4 text-center font-bold text-lg ${isActive ? "text-indigo-700" : "text-indigo-500"}`}>{fmtCurrency(adjustedAmount)}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Month Scenario + Tier Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Calculator */}
          <div className={`rounded-2xl border-2 shadow-sm p-6 ${tier > 0 ? "border-emerald-300 bg-gradient-to-br from-white to-emerald-50/30" : "border-gray-200 bg-white"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                📅 {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">←</button>
                <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">→</button>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Business days</span>
                <span className="text-sm font-bold text-slate-800">{businessDays} days</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Deals per day</span>
                <span className="text-sm font-bold text-slate-800">{dealsPerDay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Revenue per day</span>
                <span className="text-sm font-bold text-slate-800">{fmtCurrency(revenuePerDay)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total deals this month</span>
                <span className="text-sm font-bold text-slate-800">{monthlyDeals.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b-2 border-gray-200">
                <span className="text-sm font-bold text-gray-700">Monthly sales revenue</span>
                <span className="text-xl font-black text-slate-900">{fmtCurrency(monthlyRevenue)}</span>
              </div>
            </div>

            {/* Commission result */}
            {tier > 0 ? (
              <div className={`${tc.bg} rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-sm text-gray-700">
                      Revenue of <span className="font-bold text-slate-900">{fmtCurrency(monthlyRevenue)}</span> → <span className={`font-bold ${tc.text}`}>Tier {tier}</span> at <span className={`font-bold ${tc.text}`}>{Math.round(rate * 100)}%</span>
                      {commissionPct < 100 && <span className="text-indigo-600"> × {commissionPct}%</span>}
                    </p>
                  </div>
                </div>
                {commissionPct < 100 && (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase w-36">Full (100%):</span>
                    <span className="text-lg font-bold text-gray-400 line-through">{fmtCurrency(commissionFull)}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-gray-500 uppercase">Commission{commissionPct < 100 ? ` (${commissionPct}%)` : ""}:</span>
                    <span className={`text-2xl font-black ${commissionPct < 100 ? "text-indigo-700" : tc.text}`}>{fmtCurrency(commission)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-pink-500 uppercase">Deal bonus ({monthlyDeals.toFixed(1)} × {fmtCurrency(perDealBonus)}):</span>
                    <span className="text-2xl font-black text-pink-600">{fmtCurrency(monthlyBonusTotal)}</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-700 uppercase">Total Earnings:</span>
                    <span className="text-4xl font-black text-slate-900">{fmtCurrency(monthlyTotalEarnings)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔒</span>
                    <p className="text-sm text-gray-600">Revenue of <span className="font-bold">{fmtCurrency(monthlyRevenue)}</span> is below $2,500 — no tier commission yet.</p>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-pink-500 uppercase">Deal bonus ({monthlyDeals.toFixed(1)} × {fmtCurrency(perDealBonus)}):</span>
                    <span className="text-2xl font-black text-pink-600">{fmtCurrency(monthlyBonusTotal)}</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-700 uppercase">Total Earnings:</span>
                    <span className="text-3xl font-black text-slate-900">{fmtCurrency(monthlyTotalEarnings)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tier Progress Visual */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Tier Progress</h2>
            <p className="text-xs text-slate-400 mb-5">Where you land based on {MONTH_NAMES[viewMonth]} projections</p>
            <div className="space-y-4">
              <div className="relative">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${Math.min((monthlyRevenue / 12000) * 100, 100)}%`,
                    background: tier === 0 ? "#d1d5db" : tier === 1 ? "#10b981" : tier === 2 ? "#3b82f6" : tier === 3 ? "#8b5cf6" : "#f59e0b"
                  }} />
                </div>
                <div className="relative h-6 mt-1">
                  {[0, 2500, 5000, 7500, 10000].map((v) => (
                    <div key={v} className="absolute text-center" style={{ left: `${(v / 12000) * 100}%`, transform: "translateX(-50%)" }}>
                      <div className={`w-0.5 h-2 mx-auto ${monthlyRevenue >= v ? "bg-slate-400" : "bg-gray-200"}`} />
                      <div className="text-[9px] text-gray-400 mt-0.5">{v === 0 ? "$0" : `$${(v / 1000).toFixed(0)}K`}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {COMMISSION_TIERS.map((t) => {
                  const isActive = tier === t.tier;
                  const isBelow = monthlyRevenue < t.minRevenue;
                  const gap = t.minRevenue - monthlyRevenue;
                  const tc2 = tierColor(t.tier);
                  return (
                    <div key={t.tier} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? `${tc2.bg} ring-2 ring-offset-1 ${t.tier === 1 ? "ring-emerald-300" : t.tier === 2 ? "ring-blue-300" : t.tier === 3 ? "ring-purple-300" : "ring-amber-300"}` : "bg-gray-50"}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${isActive ? (t.tier === 1 ? "bg-emerald-500" : t.tier === 2 ? "bg-blue-500" : t.tier === 3 ? "bg-purple-500" : "bg-amber-500") : "bg-gray-300"}`}>{t.tier}</span>
                        <div>
                          <div className={`text-sm font-bold ${isActive ? tc2.text : "text-gray-500"}`}>{fmtCurrency(t.minRevenue)} revenue</div>
                          <div className="text-[10px] text-gray-400">{Math.round(t.rate * 100)}% commission</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {isActive && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tc2.badge}`}>✓ Current</span>}
                        {isBelow && <span className="text-[10px] text-gray-400">{fmtCurrency(gap)} to go</span>}
                        {!isActive && !isBelow && <span className="text-[10px] text-gray-400">✓ Passed</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {tier > 0 && tier < 4 && (() => {
                const nextTier = COMMISSION_TIERS[tier];
                const revenueGap = nextTier.minRevenue - monthlyRevenue;
                const additionalDealsNeeded = revenueGap / dealValue;
                const nextFullComm = monthlyRevenue * nextTier.rate;
                const commGain = (nextFullComm * (commissionPct / 100)) - commission;
                return (
                  <div className="mt-4 p-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl text-white">
                    <div className="text-xs font-bold text-slate-300 uppercase mb-1">🎯 Next Tier Unlock</div>
                    <p className="text-sm">Close <span className="font-bold text-emerald-400">{Math.ceil(additionalDealsNeeded)} more deal{Math.ceil(additionalDealsNeeded) === 1 ? "" : "s"}</span> ({fmtCurrency(revenueGap)} revenue) to reach <span className="font-bold text-emerald-400">Tier {nextTier.tier}</span>.</p>
                    <p className="text-xs text-slate-400 mt-1">Commission jumps from {fmtCurrency(commission)} to <span className="font-bold text-emerald-400">{fmtCurrency(commission + commGain)}</span> (+{fmtCurrency(commGain)}){commissionPct < 100 ? ` at ${commissionPct}% rate` : ""}.</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ANNUAL EARNINGS CHART — Commission + Bonus stacked bars   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{viewYear} Annual Earnings</h2>
              <p className="text-xs text-slate-400">Commission + per-deal bonus across the year</p>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Commission</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-pink-500 inline-block"></span> Deal Bonus</span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2" style={{ height: 220 }}>
            {monthlyBreakdown.map((m) => {
              const totalH = maxEarnings > 0 ? (m.totalEarnings / maxEarnings) * 200 : 0;
              const commH = m.totalEarnings > 0 ? (m.commission / m.totalEarnings) * totalH : 0;
              const bonusH = totalH - commH;
              const isSelected = m.month === viewMonth;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center cursor-pointer group" onClick={() => setViewMonth(m.month)}>
                  <div className={`text-[9px] font-bold mb-1 transition-colors ${isSelected ? "text-slate-800" : "text-gray-400 group-hover:text-gray-600"}`}>
                    {fmtCurrency(m.totalEarnings)}
                  </div>
                  <div className={`w-full rounded-t-md overflow-hidden transition-all ${isSelected ? "ring-2 ring-slate-800 ring-offset-1" : "group-hover:opacity-90"}`} style={{ height: Math.max(totalH, 2) }}>
                    <div className="bg-pink-400 w-full" style={{ height: bonusH }} />
                    <div className="bg-emerald-500 w-full" style={{ height: commH }} />
                  </div>
                  <div className={`text-[10px] mt-1.5 font-semibold ${isSelected ? "text-slate-800" : "text-gray-400"}`}>
                    {MONTH_NAMES[m.month].slice(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase">Annual Commission</div>
              <div className="text-xl font-black text-emerald-600">{fmtCurrency(yearlyCommission)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase">Annual Deal Bonus</div>
              <div className="text-xl font-black text-pink-600">{fmtCurrency(yearlyBonus)}</div>
              <div className="text-[10px] text-gray-400">{yearlyDeals.toFixed(0)} deals × {fmtCurrency(perDealBonus)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase">Total Earnings</div>
              <div className="text-xl font-black text-slate-900">{fmtCurrency(yearlyTotalEarnings)}</div>
            </div>
          </div>
        </div>

        {/* Annual Overview Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{viewYear} Monthly Breakdown</h2>
              <p className="text-xs text-slate-400">Commission + bonus detail per month</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-400 uppercase">Annual Total Earnings</div>
              <div className="text-lg font-black text-slate-900">{fmtCurrency(yearlyTotalEarnings)}</div>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="pb-2 text-left text-xs font-semibold text-gray-400">Month</th>
                <th className="pb-2 text-right text-xs font-semibold text-gray-400">Biz Days</th>
                <th className="pb-2 text-right text-xs font-semibold text-gray-400">Deals</th>
                <th className="pb-2 text-right text-xs font-semibold text-gray-400">Revenue</th>
                <th className="pb-2 text-center text-xs font-semibold text-gray-400">Tier</th>
                <th className="pb-2 text-right text-xs font-semibold text-emerald-500">Commission</th>
                <th className="pb-2 text-right text-xs font-semibold text-pink-500">Deal Bonus</th>
                <th className="pb-2 text-right text-xs font-semibold text-slate-700 pl-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBreakdown.map((m) => {
                const isNow = today.getMonth() === m.month && today.getFullYear() === viewYear;
                const tc3 = tierColor(m.tier);
                return (
                  <tr key={m.month} className={`border-b border-gray-100 ${isNow ? "bg-indigo-50/50" : ""} hover:bg-gray-50/50 cursor-pointer`} onClick={() => setViewMonth(m.month)}>
                    <td className="py-2.5 font-medium text-gray-700">
                      {MONTH_NAMES[m.month].slice(0, 3)} {isNow && <span className="text-[10px] text-indigo-500">← now</span>}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-gray-500">{m.businessDays}</td>
                    <td className="py-2.5 text-right tabular-nums text-gray-600">{m.deals.toFixed(1)}</td>
                    <td className="py-2.5 text-right tabular-nums font-semibold text-slate-800">{fmtCurrency(m.revenue)}</td>
                    <td className="py-2.5 text-center">
                      {m.tier > 0 ? (<span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tc3.badge}`}>T{m.tier}</span>) : (<span className="text-xs text-gray-400">—</span>)}
                    </td>
                    <td className={`py-2.5 text-right tabular-nums font-bold ${m.tier > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                      {m.tier > 0 ? fmtCurrency(m.commission) : "$0"}
                    </td>
                    <td className="py-2.5 text-right tabular-nums font-bold text-pink-600">{fmtCurrency(m.bonus)}</td>
                    <td className="py-2.5 text-right tabular-nums font-black text-slate-800 pl-4">{fmtCurrency(m.totalEarnings)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td className="py-3 font-bold text-slate-800" colSpan={2}>Total</td>
                <td className="py-3 text-right font-bold text-gray-600">{yearlyDeals.toFixed(0)}</td>
                <td className="py-3 text-right font-bold text-slate-800">{fmtCurrency(yearlyRevenue)}</td>
                <td></td>
                <td className="py-3 text-right font-bold text-emerald-600">{fmtCurrency(yearlyCommission)}</td>
                <td className="py-3 text-right font-bold text-pink-600">{fmtCurrency(yearlyBonus)}</td>
                <td className="py-3 text-right font-black text-slate-900 text-lg pl-4">{fmtCurrency(yearlyTotalEarnings)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quick Math */}
        <div className="bg-slate-800 rounded-2xl p-6 text-white">
          <h2 className="text-base font-bold mb-3">💡 Quick Math — {MONTH_NAMES[viewMonth]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Revenue per day:</span>
              <div className="font-bold text-white text-lg">{fmtCurrency(revenuePerDay)}</div>
              <span className="text-[10px] text-slate-500">{dealsPerDay.toFixed(2)} deals × ${dealValue}</span>
            </div>
            <div>
              <span className="text-slate-400">Monthly revenue:</span>
              <div className="font-bold text-white text-lg">{fmtCurrency(monthlyRevenue)}</div>
              <span className="text-[10px] text-slate-500">{businessDays} biz days × {fmtCurrency(revenuePerDay)}</span>
            </div>
            <div>
              <span className="text-slate-400">Commission:</span>
              <div className={`font-bold text-lg ${tier > 0 ? "text-emerald-400" : "text-gray-400"}`}>{fmtCurrency(commission)}</div>
              <span className="text-[10px] text-slate-500">{tier > 0 ? `T${tier} ${Math.round(rate * 100)}%${commissionPct < 100 ? ` × ${commissionPct}%` : ""}` : "Below $2,500"}</span>
            </div>
            <div>
              <span className="text-slate-400">Deal bonus:</span>
              <div className="font-bold text-lg text-pink-400">{fmtCurrency(monthlyBonusTotal)}</div>
              <span className="text-[10px] text-slate-500">{monthlyDeals.toFixed(1)} deals × {fmtCurrency(perDealBonus)}</span>
            </div>
            <div>
              <span className="text-slate-400">Total earnings:</span>
              <div className="font-bold text-2xl text-white">{fmtCurrency(monthlyTotalEarnings)}</div>
              <span className="text-[10px] text-slate-500">commission + bonus</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function CommissionsNewPage() {
  return (<PasswordGate requireMaster><CommissionsNewContent /></PasswordGate>);
}
