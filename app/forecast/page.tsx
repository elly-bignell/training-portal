// app/forecast/page.tsx

"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  DEFAULT_RATIOS,
  DEFAULT_RAMP,
  getRampPct,
} from "@/lib/projections-config";

// ─── Types ───
interface TeamMember {
  id: string;
  label: string;
  startDate: string;
}

interface WeekProjection {
  weekIndex: number;
  date: Date;
  revenue: number;
  newDealsThisWeek: number;
  newRecurringAdded: number;
  churnLossThisWeek: number;
  activeStaff: number;
  isProjected: boolean;
}

type Ratios = typeof DEFAULT_RATIOS;
type Ramp = typeof DEFAULT_RAMP;

// ─── Helpers ───
const YEAR = 2026;
const JAN5 = new Date(2026, 0, 5);

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}
function weeksBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (7 * 86400000));
}
function addWeeks(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 7 * 86400000);
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}
function fmtMoney(v: number): string {
  if (Math.abs(v) >= 1000) return "$" + Math.round(v).toLocaleString();
  return "$" + v.toFixed(0);
}
function fmtMoneyK(v: number): string {
  if (Math.abs(v) >= 1000000) return "$" + (v / 1000000).toFixed(2) + "M";
  if (Math.abs(v) >= 1000) return "$" + (v / 1000).toFixed(1) + "K";
  return "$" + v.toFixed(0);
}

// ═══════════════════════════════════════════════════════════════════
// PROJECTION ENGINE
// ═══════════════════════════════════════════════════════════════════

function calculateProjections(
  team: TeamMember[], numLeaders: number, ratios: Ratios, ramp: Ramp,
  currentBase: number, baseDateStr: string, soyBase: number,
  monthlyChurnPct: number, buddyWeeks: number,
): WeekProjection[] {
  const baseDate = getMonday(new Date(baseDateStr + "T00:00:00"));
  const baseWeekIdx = weeksBetween(JAN5, baseDate);
  const totalWeeks = weeksBetween(JAN5, new Date(YEAR, 11, 31)) + 1;

  const fullDealsPerWeek = ratios.bookingsPerHour * ratios.phoneHoursPerDay * 5 * ratios.attendanceRate * ratios.closeRate;
  const weeklyValuePerDeal = (ratios.dealValue * 12) / 52;
  const weeklyRetention = monthlyChurnPct > 0 ? Math.pow(1 - monthlyChurnPct / 100, 1 / 4.333) : 1;

  const projections: WeekProjection[] = [];
  let runningRevenue = currentBase;

  for (let w = 0; w < totalWeeks; w++) {
    const weekDate = addWeeks(JAN5, w);

    // YTD Actuals: interpolate SOY → current base
    if (w < baseWeekIdx) {
      const t = baseWeekIdx > 0 ? w / baseWeekIdx : 1;
      projections.push({ weekIndex: w, date: weekDate, revenue: soyBase + (currentBase - soyBase) * t, newDealsThisWeek: 0, newRecurringAdded: 0, churnLossThisWeek: 0, activeStaff: 0, isProjected: false });
      continue;
    }

    if (w === baseWeekIdx) runningRevenue = currentBase;

    // Production
    let hiresInBuddyPhase = 0, newHireDeals = 0, activeStaff = 0;
    for (const person of team) {
      const pw = weeksBetween(JAN5, getMonday(new Date(person.startDate + "T00:00:00")));
      if (w >= pw) {
        const wir = w - pw + 1;
        const pct = getRampPct(wir, ramp);
        if (wir <= buddyWeeks) hiresInBuddyPhase++;
        newHireDeals += fullDealsPerWeek * (pct / 100);
        if (pct > 0) activeStaff++;
      }
    }
    const freeLeaders = numLeaders - Math.min(hiresInBuddyPhase, numLeaders);
    activeStaff += freeLeaders;
    const totalDeals = freeLeaders * fullDealsPerWeek + newHireDeals;
    const newRec = totalDeals * weeklyValuePerDeal;

    // Churn then add
    const churnLoss = runningRevenue * (1 - weeklyRetention);
    runningRevenue = runningRevenue * weeklyRetention + newRec;

    projections.push({ weekIndex: w, date: weekDate, revenue: runningRevenue, newDealsThisWeek: totalDeals, newRecurringAdded: newRec, churnLossThisWeek: churnLoss, activeStaff, isProjected: w > baseWeekIdx });
  }
  return projections;
}

// ═══════════════════════════════════════════════════════════════════
// SVG CHART
// ═══════════════════════════════════════════════════════════════════

function TrajectoryChart({ data, target, targetDateStr, team, baseDateStr }: {
  data: WeekProjection[]; target: number; targetDateStr: string; team: TeamMember[]; baseDateStr: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const baseWeekIdx = weeksBetween(JAN5, getMonday(new Date(baseDateStr + "T00:00:00")));

  const W = 960, H = 420;
  const PAD = { top: 30, right: 40, bottom: 55, left: 90 };
  const cw = W - PAD.left - PAD.right, ch = H - PAD.top - PAD.bottom;

  const allRev = data.map((d) => d.revenue);
  if (!allRev.length) return <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">Add team members to see trajectory</div>;

  const yMin = Math.min(Math.min(...allRev), target) * 0.95;
  const yMax = Math.max(Math.max(...allRev), target) * 1.05;
  const xS = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * cw;
  const yS = (v: number) => PAD.top + ch - ((v - yMin) / (yMax - yMin)) * ch;

  // Split actual vs projected paths
  const actualPath: string[] = [], projPath: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const pt = `${xS(i).toFixed(1)} ${yS(data[i].revenue).toFixed(1)}`;
    if (data[i].weekIndex <= baseWeekIdx) actualPath.push(`${actualPath.length === 0 ? "M" : "L"} ${pt}`);
    if (data[i].weekIndex >= baseWeekIdx) projPath.push(`${projPath.length === 0 ? "M" : "L"} ${pt}`);
  }

  const projStart = data.findIndex((d) => d.weekIndex >= baseWeekIdx);
  const areaD = projPath.join(" ") + ` L ${xS(data.length - 1).toFixed(1)} ${(PAD.top + ch).toFixed(1)} L ${xS(projStart).toFixed(1)} ${(PAD.top + ch).toFixed(1)} Z`;

  const targetY = yS(target);
  const targetWk = weeksBetween(JAN5, getMonday(new Date(targetDateStr + "T00:00:00")));
  const targetX = targetWk >= 0 && targetWk < data.length ? xS(targetWk) : null;

  const yRange = yMax - yMin;
  const yStep = yRange > 200000 ? 50000 : yRange > 100000 ? 25000 : yRange > 50000 ? 10000 : 5000;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);

  const monthLabels = Array.from({ length: 12 }, (_, m) => {
    const wk = weeksBetween(JAN5, getMonday(new Date(YEAR, m, 1)));
    return wk >= 0 && wk < data.length ? { x: xS(wk), label: new Date(YEAR, m, 1).toLocaleDateString("en-AU", { month: "short" }) } : null;
  }).filter(Boolean) as { x: number; label: string }[];

  const pMarkers = team.map((p) => {
    const pw = weeksBetween(JAN5, getMonday(new Date(p.startDate + "T00:00:00")));
    return pw >= 0 && pw < data.length ? { x: xS(pw), y: yS(data[pw].revenue), label: p.label } : null;
  }).filter(Boolean) as { x: number; y: number; label: string }[];

  const nowWk = weeksBetween(JAN5, getMonday(new Date()));
  let crossIdx: number | null = null;
  for (let i = 1; i < data.length; i++) { if (data[i - 1].revenue < target && data[i].revenue >= target) { crossIdx = i; break; } }

  const handleMM = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * W;
    const idx = Math.round(((mx - PAD.left) / cw) * (data.length - 1));
    setHoverIdx(idx >= 0 && idx < data.length ? idx : null);
  };
  const hov = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-slate-800">Weekly Recurring Revenue Trajectory</h2>
        <div className="flex items-center gap-4 text-xs flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-slate-400 inline-block rounded"></span> Actual (YTD)</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-500 inline-block rounded"></span> Projected</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 inline-block rounded" style={{ borderTop: "2px dashed #f87171" }}></span> Target</span>
          {crossIdx !== null && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">Target hit: {fmtDate(data[crossIdx].date)}</span>}
          {crossIdx === null && data[data.length - 1].revenue < target && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full">Target not reached by EOY</span>}
        </div>
      </div>
      <div className="relative">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 420 }} onMouseMove={handleMM} onMouseLeave={() => setHoverIdx(null)}>
          {yTicks.map((v, i) => (<g key={i}><line x1={PAD.left} y1={yS(v)} x2={W - PAD.right} y2={yS(v)} stroke="#f1f5f9" strokeWidth="1" /><text x={PAD.left - 8} y={yS(v) + 4} textAnchor="end" className="text-[11px]" fill="#94a3b8">{fmtMoneyK(v)}</text></g>))}
          {monthLabels.map((m, i) => (<g key={i}><line x1={m.x} y1={PAD.top} x2={m.x} y2={PAD.top + ch} stroke="#f1f5f9" strokeWidth="1" /><text x={m.x} y={H - PAD.bottom + 20} textAnchor="middle" className="text-[11px]" fill="#94a3b8">{m.label}</text></g>))}
          <line x1={PAD.left} y1={targetY} x2={W - PAD.right} y2={targetY} stroke="#f87171" strokeWidth="1.5" strokeDasharray="8 5" />
          <text x={W - PAD.right + 4} y={targetY + 4} className="text-[10px] font-semibold" fill="#f87171">{fmtMoneyK(target)}</text>
          {targetX !== null && (<><line x1={targetX} y1={PAD.top} x2={targetX} y2={PAD.top + ch} stroke="#f87171" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" /><text x={targetX} y={H - PAD.bottom + 35} textAnchor="middle" className="text-[10px] font-semibold" fill="#f87171">18 Dec</text></>)}
          <path d={areaD} fill="url(#pg)" opacity="0.12" />
          <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
          <path d={actualPath.join(" ")} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="6 3" />
          <path d={projPath.join(" ")} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
          {baseWeekIdx >= 0 && baseWeekIdx < data.length && <line x1={xS(baseWeekIdx)} y1={PAD.top} x2={xS(baseWeekIdx)} y2={PAD.top + ch} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 3" />}
          {pMarkers.map((m, i) => (<g key={i}><circle cx={m.x} cy={m.y} r="5" fill="#10b981" stroke="white" strokeWidth="2" /><text x={m.x} y={m.y - 12} textAnchor="middle" className="text-[9px] font-bold" fill="#059669">+{m.label}</text></g>))}
          {nowWk >= 0 && nowWk < data.length && (<><line x1={xS(nowWk)} y1={PAD.top} x2={xS(nowWk)} y2={PAD.top + ch} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 3" /><text x={xS(nowWk)} y={H - PAD.bottom + 35} textAnchor="middle" className="text-[9px] font-bold" fill="#6366f1">Today</text></>)}
          {crossIdx !== null && (<g><circle cx={xS(crossIdx)} cy={yS(target)} r="7" fill="#10b981" stroke="white" strokeWidth="2.5" /><circle cx={xS(crossIdx)} cy={yS(target)} r="3" fill="white" /></g>)}
          {hoverIdx !== null && hov && (<><line x1={xS(hoverIdx)} y1={PAD.top} x2={xS(hoverIdx)} y2={PAD.top + ch} stroke="#334155" strokeWidth="1" strokeDasharray="3 2" /><circle cx={xS(hoverIdx)} cy={yS(hov.revenue)} r="5" fill={hov.isProjected ? "#10b981" : "#64748b"} stroke="white" strokeWidth="2" /></>)}
          <rect x={PAD.left} y={PAD.top} width={cw} height={ch} fill="transparent" />
        </svg>
        {hoverIdx !== null && hov && (
          <div className="absolute bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none z-10" style={{ left: `${(xS(hoverIdx) / W) * 100}%`, top: `${((yS(hov.revenue) - 20) / H) * 100}%`, transform: hoverIdx > data.length * 0.7 ? "translate(-110%, -100%)" : "translate(-50%, -100%)" }}>
            <div className="font-bold text-emerald-300">{fmtMoney(hov.revenue)}/wk</div>
            <div className="text-gray-300 mt-0.5">Week of {fmtDate(hov.date)} {!hov.isProjected && hov.weekIndex > 0 ? "(actual)" : ""} · {hov.activeStaff} producing</div>
            {hov.isProjected && <div className="text-gray-400 mt-0.5">+{hov.newDealsThisWeek.toFixed(1)} deals · +{fmtMoney(hov.newRecurringAdded)} new · -{fmtMoney(hov.churnLossThisWeek)} churn</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

function ForecastContent() {
  const [ratios, setRatios] = usePersistedState<Ratios>("shared-ratios", { ...DEFAULT_RATIOS });
  const [ramp, setRamp] = usePersistedState("shared-ramp", DEFAULT_RAMP.map((r) => ({ ...r })));
  const [currentBase, setCurrentBase] = usePersistedState("forecast-currentBase2", 145000);
  const [soyBase, setSoyBase] = usePersistedState("forecast-soyBase", 152522);
  const [weeklyTarget, setWeeklyTarget] = usePersistedState("forecast-weeklyTarget", 250000);
  const [targetDate, setTargetDate] = usePersistedState("forecast-targetDate", "2026-12-18");
  const [monthlyChurnPct, setMonthlyChurnPct] = usePersistedState("forecast-churnPct", 3.5);
  const [baseDate, setBaseDate] = usePersistedState("forecast-baseDate2", "2026-02-24");
  const [team, setTeam] = usePersistedState<TeamMember[]>("forecast-team", []);
  const [numLeaders, setNumLeaders] = usePersistedState("forecast-numLeaders", 3);
  const [buddyWeeks, setBuddyWeeks] = usePersistedState("forecast-buddyWeeks", 6);
  const [showRamp, setShowRamp] = usePersistedState("forecast-showRamp3", false);
  const [showRatios, setShowRatios] = usePersistedState("forecast-showRatios3", false);

  const nextId = () => `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const projections = useMemo(
    () => calculateProjections(team, numLeaders, ratios, ramp, currentBase, baseDate, soyBase, monthlyChurnPct, buddyWeeks),
    [team, numLeaders, ratios, ramp, currentBase, baseDate, soyBase, monthlyChurnPct, buddyWeeks],
  );

  const gap = weeklyTarget - currentBase;
  const fullDpw = ratios.bookingsPerHour * ratios.phoneHoursPerDay * 5 * ratios.attendanceRate * ratios.closeRate;
  const wvpd = (ratios.dealValue * 12) / 52;
  const fullWNR = fullDpw * wvpd;
  const wRet = monthlyChurnPct > 0 ? Math.pow(1 - monthlyChurnPct / 100, 1 / 4.333) : 1;
  const wChurn = currentBase * (1 - wRet);
  const mChurn = currentBase * (monthlyChurnPct / 100);
  const aChurn = currentBase * (1 - Math.pow(1 - monthlyChurnPct / 100, 12));
  const pOffset = wChurn > 0 ? wChurn / fullWNR : 0;

  const tWk = weeksBetween(JAN5, getMonday(new Date(targetDate + "T00:00:00")));
  const projAtT = projections.find((p) => p.weekIndex === tWk);
  const projRev = projAtT?.revenue ?? null;
  let hitDate: string | null = null;
  for (const p of projections) { if (p.revenue >= weeklyTarget && p.isProjected) { hitDate = fmtDate(p.date); break; } }

  const bWarn = useMemo(() => {
    const w: string[] = [];
    for (const p of projections) {
      let ib = 0;
      for (const t of team) { const pw = weeksBetween(JAN5, getMonday(new Date(t.startDate + "T00:00:00"))); const wr = p.weekIndex - pw + 1; if (wr >= 1 && wr <= buddyWeeks) ib++; }
      if (ib > numLeaders) w.push(`Week of ${fmtDate(p.date)}: ${ib} in buddy phase but only ${numLeaders} leaders`);
    }
    return Array.from(new Set(w)).slice(0, 3);
  }, [projections, team, numLeaders, buddyWeeks]);

  const addPerson = () => {
    const nm = team.length + 1;
    const nxt = getMonday(new Date(Date.now() + 7 * 86400000));
    setTeam((prev: TeamMember[]) => [...prev, { id: nextId(), label: `Person ${nm}`, startDate: nxt.toISOString().split("T")[0] }]);
  };
  const remPerson = (id: string) => setTeam((prev: TeamMember[]) => prev.filter((p) => p.id !== id));
  const updPerson = (id: string, f: keyof TeamMember, v: string) => setTeam((prev: TeamMember[]) => prev.map((p) => (p.id === id ? { ...p, [f]: v } : p)));
  const getWIR = (sd: string) => weeksBetween(getMonday(new Date(sd + "T00:00:00")), getMonday(new Date())) + 1;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1100px] mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></Link>
              <div><h1 className="text-xl font-bold flex items-center gap-2">📈 Revenue Forecast</h1><p className="text-sm text-slate-400">Model team growth and project recurring revenue trajectory</p></div>
            </div>
            <Link href="/projections" className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">📊 Per-Person Projections →</Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-xl font-black text-slate-800">{fmtMoneyK(currentBase)}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Current /wk</div>
            {currentBase < soyBase && <div className="text-[10px] text-red-400">↓ {fmtMoneyK(soyBase - currentBase)} from SOY</div>}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><div className="text-xl font-black text-red-500">{fmtMoneyK(weeklyTarget)}</div><div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Target /wk</div></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><div className="text-xl font-black text-amber-600">{fmtMoneyK(gap)}</div><div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Gap to Close</div></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><div className={`text-xl font-black ${projRev !== null && projRev >= weeklyTarget ? "text-emerald-600" : "text-slate-600"}`}>{projRev !== null ? fmtMoneyK(projRev) : "—"}</div><div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Projected 18 Dec</div></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><div className="text-xl font-black text-emerald-600">{hitDate ?? "—"}</div><div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Target Hit Date</div></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><div className="text-xl font-black text-slate-800">{team.length}</div><div className="text-[10px] font-bold text-slate-400 uppercase mt-1">New Hires</div></div>
        </div>

        {/* Chart */}
        <TrajectoryChart data={projections} target={weeklyTarget} targetDateStr={targetDate} team={team} baseDateStr={baseDate} />

        {/* Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Revenue Base</h3>
            <div className="space-y-3">
              <div><label className="text-[10px] font-semibold text-gray-500">Start of Year Weekly Rev ($)</label><input type="number" value={soyBase} onChange={(e) => setSoyBase(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold mt-1" /></div>
              <div><label className="text-[10px] font-semibold text-gray-500">Current Weekly Revenue ($)</label><input type="number" value={currentBase} onChange={(e) => setCurrentBase(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold mt-1" /></div>
              <div><label className="text-[10px] font-semibold text-gray-500">As At Date</label><input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Target</h3>
            <div className="space-y-3">
              <div><label className="text-[10px] font-semibold text-gray-500">Weekly Revenue Target ($)</label><input type="number" value={weeklyTarget} onChange={(e) => setWeeklyTarget(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold mt-1" /></div>
              <div><label className="text-[10px] font-semibold text-gray-500">Target Date</label><input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div className="pt-2 border-t border-gray-100">
                <label className="text-[10px] font-semibold text-gray-500">Team Leaders</label>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setNumLeaders(Math.max(0, numLeaders - 1))} className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-sm font-bold">−</button>
                  <span className="text-xl font-black text-slate-800 w-6 text-center">{numLeaders}</span>
                  <button onClick={() => setNumLeaders(numLeaders + 1)} className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-sm font-bold">+</button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Buddy phase: {buddyWeeks} wks <button onClick={() => setBuddyWeeks(Math.max(1, buddyWeeks - 1))} className="ml-2 px-1 bg-slate-100 rounded text-[10px]">−</button><button onClick={() => setBuddyWeeks(buddyWeeks + 1)} className="ml-1 px-1 bg-slate-100 rounded text-[10px]">+</button></p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Monthly Churn Rate</h3>
            <div className="flex items-center gap-3"><span className="text-2xl font-black text-red-500">{monthlyChurnPct}%</span><span className="text-xs text-gray-400">/month of base</span></div>
            <input type="range" min={0} max={10} step={0.1} value={monthlyChurnPct} onChange={(e) => setMonthlyChurnPct(Number(e.target.value))} className="w-full mt-2 accent-red-500" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>0%</span><span>10%</span></div>
            <div className="mt-3 space-y-1 text-xs text-gray-500">
              <div className="flex justify-between"><span>Weekly (at current):</span><span className="font-bold text-red-500">-{fmtMoney(wChurn)}/wk</span></div>
              <div className="flex justify-between"><span>Monthly:</span><span className="font-bold text-red-500">-{fmtMoney(mChurn)}/mo</span></div>
              <div className="flex justify-between"><span>Annual (compounded):</span><span className="font-bold text-red-500">-{fmtMoney(aChurn)}/yr</span></div>
              <div className="flex justify-between"><span>People to offset:</span><span className="font-bold text-slate-700">{pOffset.toFixed(1)} fully ramped</span></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">As revenue grows, churn $ grows too — this compounds.</p>
          </div>
        </div>

        {bWarn.length > 0 && (<div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><span className="text-amber-600 font-bold text-sm">⚠️ Team Leader Capacity</span><div className="text-xs text-amber-700 space-y-1 mt-2">{bWarn.map((w, i) => <p key={i}>{w}</p>)}</div></div>)}

        {/* Team Builder */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3"><span className="text-2xl">👥</span><div><h2 className="text-lg font-bold text-slate-800">Team Builder — New Hires</h2><p className="text-xs text-slate-400">{numLeaders} leaders · Each locks to a hire for Wk 1–{buddyWeeks}</p></div></div>
            <button onClick={addPerson} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors">+ Add Person</button>
          </div>
          {team.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><p className="text-3xl mb-2">👆</p><p className="text-sm">Add team members to model revenue growth</p><p className="text-xs mt-1">Each produces {fullDpw.toFixed(1)} deals/wk at 100% = +{fmtMoney(fullWNR)}/wk</p></div>
          ) : (
            <div className="space-y-3">{team.map((person, idx) => {
              const wir = getWIR(person.startDate); const hs = wir >= 1;
              const rP = hs ? getRampPct(Math.min(wir, 8), ramp) : 0;
              const iB = hs && wir <= buddyWeeks; const iS = hs && wir > buddyWeeks;
              const w8 = addWeeks(new Date(person.startDate + "T00:00:00"), 7);
              return (
                <div key={person.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${iS ? "bg-emerald-500" : iB ? "bg-blue-500" : "bg-gray-400"}`}>{idx + 1}</span>
                    <input type="text" value={person.label} onChange={(e) => updPerson(person.id, "label", e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold w-36 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    <div className="flex items-center gap-2"><span className="text-xs text-gray-400">Start:</span><input type="date" value={person.startDate} onChange={(e) => updPerson(person.id, "startDate", e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" /></div>
                    <span className="text-xs text-gray-400">100% by: <span className="font-bold text-slate-700">{fmtDate(w8)}</span></span>
                    {hs && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rP === 100 ? "bg-emerald-100 text-emerald-700" : rP >= 75 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>Wk {Math.min(wir, 8)} · {rP}%</span>}
                    {!hs && <span className="text-xs text-gray-400 italic">Not started</span>}
                    <button onClick={() => remPerson(person.id)} className="ml-auto text-gray-300 hover:text-red-500">✕</button>
                  </div>
                  <div className="mt-3 flex gap-1">{ramp.map((r, wi) => {
                    const wn = wi + 1; const isA = hs && wir >= wn; const isC = hs && wir === wn;
                    return (<div key={wi} className="flex-1"><div className={`h-2 rounded-full ${isC ? "bg-emerald-500 ring-2 ring-emerald-300" : isA ? (r.pct === 100 ? "bg-emerald-500" : r.pct >= 75 ? "bg-amber-400" : "bg-blue-400") : "bg-gray-200"}`} /><div className="text-center text-[9px] text-gray-400 mt-0.5">W{wn}</div></div>);
                  })}</div>
                </div>
              );
            })}</div>
          )}
        </div>

        {/* Ratios */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <button onClick={() => setShowRatios(!showRatios)} className="w-full p-5 flex items-center justify-between text-left">
            <div className="flex items-center gap-3"><span className="text-xl">⚙️</span><div><h2 className="text-base font-bold text-slate-800">Per-Person Ratios</h2><p className="text-xs text-slate-400">{ratios.phoneHoursPerDay}hrs · {ratios.bookingsPerHour} bkgs/hr · {(ratios.attendanceRate * 100).toFixed(0)}% att · {(ratios.closeRate * 100).toFixed(0)}% close · ${ratios.dealValue}/deal</p></div></div>
            <span className="text-gray-400">{showRatios ? "▲" : "▼"}</span>
          </button>
          {showRatios && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 mb-4">Shared with <Link href="/projections" className="text-emerald-600 underline">Projections</Link>. Changes sync.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {([["Phone hrs/day","phoneHoursPerDay",0.5],["Bookings/hr","bookingsPerHour",0.1],["Attendance %","attendanceRate",5,true],["Close %","closeRate",5,true],["Deal value ($/mo)","dealValue",50],["Calls/hr","callsPerHour",1]] as [string,keyof Ratios,number,boolean?][]).map(([lbl,key,step,isPct]) => (
                  <div key={key}><label className="text-[10px] font-semibold text-gray-500 block">{lbl}</label><input type="number" step={step} value={isPct ? ((ratios[key] as number) * 100).toFixed(0) : ratios[key]} onChange={(e) => setRatios({ ...ratios, [key]: isPct ? Number(e.target.value) / 100 : Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold mt-1" /></div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600"><span className="font-bold">Full standard:</span> {fullDpw.toFixed(1)} deals/wk → +{fmtMoney(fullWNR)}/wk new recurring</div>
            </div>
          )}
        </div>

        {/* Ramp */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <button onClick={() => setShowRamp(!showRamp)} className="w-full p-5 flex items-center justify-between text-left">
            <div className="flex items-center gap-3"><span className="text-xl">📈</span><div><h2 className="text-base font-bold text-slate-800">8-Week Ramp Schedule</h2><p className="text-xs text-slate-400">Output % per week</p></div></div>
            <span className="text-gray-400">{showRamp ? "▲" : "▼"}</span>
          </button>
          {showRamp && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">{ramp.map((r, i) => (<div key={i} className="text-center"><div className="text-[10px] font-bold text-gray-400 mb-1">Wk {r.week}</div><input type="number" min={0} max={100} step={5} value={r.pct} onChange={(e) => setRamp(ramp.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x)))} className="w-full border border-gray-200 rounded-lg px-1 py-1.5 text-sm font-bold text-center" /><div className="text-[9px] text-gray-400 mt-0.5">{r.label}</div></div>))}</div>
            </div>
          )}
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-x-auto">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Monthly Breakdown</h2>
          <p className="text-xs text-slate-400 mb-4">Per-week averages (normalized — unaffected by 4 vs 5 week months)</p>
          <table className="w-full text-sm">
            <thead><tr className="border-b-2 border-gray-200">
              <th className="pb-2 text-left text-xs font-semibold text-gray-400">Month</th>
              <th className="pb-2 text-right text-xs font-semibold text-gray-400">Staff</th>
              <th className="pb-2 text-right text-xs font-semibold text-gray-400">Deals/wk</th>
              <th className="pb-2 text-right text-xs font-semibold text-emerald-500">New Rec/wk</th>
              <th className="pb-2 text-right text-xs font-semibold text-red-400">Churn/wk</th>
              <th className="pb-2 text-right text-xs font-semibold text-gray-400">Net/wk</th>
              <th className="pb-2 text-right text-xs font-semibold text-slate-700 pl-4">Rev EOM</th>
            </tr></thead>
            <tbody>{Array.from({ length: 12 }, (_, m) => {
              const mW = projections.filter((p) => p.date.getMonth() === m);
              if (!mW.length) return null;
              const proj = mW.filter((p) => p.isProjected);
              const last = mW[mW.length - 1];
              const mn = new Date(YEAR, m, 1).toLocaleDateString("en-AU", { month: "short" });
              const isNow = new Date().getMonth() === m;
              const hit = last.revenue >= weeklyTarget;

              if (proj.length === 0) {
                return (<tr key={m} className={`border-b border-gray-100 ${isNow ? "bg-indigo-50/50" : "bg-gray-50/50"}`}>
                  <td className="py-2.5 font-medium text-gray-400">{mn} {isNow && <span className="text-[10px] text-indigo-500">← now</span>}</td>
                  <td className="py-2.5 text-right text-gray-400 italic" colSpan={5}>Actual</td>
                  <td className="py-2.5 text-right font-bold text-gray-400 pl-4">{fmtMoney(last.revenue)}</td>
                </tr>);
              }

              const n = proj.length;
              const aD = proj.reduce((s, w) => s + w.newDealsThisWeek, 0) / n;
              const aNR = proj.reduce((s, w) => s + w.newRecurringAdded, 0) / n;
              const aC = proj.reduce((s, w) => s + w.churnLossThisWeek, 0) / n;
              const aNet = aNR - aC;
              const aS = Math.round(proj.reduce((s, w) => s + w.activeStaff, 0) / n);

              return (<tr key={m} className={`border-b border-gray-100 ${isNow ? "bg-indigo-50/50" : ""} ${hit ? "bg-emerald-50/30" : ""}`}>
                <td className="py-2.5 font-medium text-gray-700">{mn} {isNow && <span className="text-[10px] text-indigo-500">← now</span>}</td>
                <td className="py-2.5 text-right tabular-nums text-gray-600">{aS}</td>
                <td className="py-2.5 text-right tabular-nums text-gray-600">{aD.toFixed(1)}</td>
                <td className="py-2.5 text-right tabular-nums text-emerald-600 font-semibold">+{fmtMoney(aNR)}</td>
                <td className="py-2.5 text-right tabular-nums text-red-500">-{fmtMoney(aC)}</td>
                <td className={`py-2.5 text-right tabular-nums font-semibold ${aNet >= 0 ? "text-emerald-600" : "text-red-500"}`}>{aNet >= 0 ? "+" : ""}{fmtMoney(aNet)}</td>
                <td className={`py-2.5 text-right tabular-nums font-bold pl-4 ${hit ? "text-emerald-600" : "text-slate-800"}`}>{fmtMoney(last.revenue)}{hit && <span className="ml-1 text-[10px]">✓</span>}</td>
              </tr>);
            })}</tbody>
          </table>
        </div>

        {/* Rules of Thumb */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">📘 Rules of Thumb</h2>
          <p className="text-xs text-slate-400 mb-5">How the model works</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">The 8-Week Timeline</h3>
              <div className="space-y-2">
                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg"><span className="text-xs font-bold text-blue-600 w-20 shrink-0">Wk 1–{buddyWeeks}</span><div className="text-xs text-slate-600"><span className="font-bold">Buddy Phase.</span> New hire books. Leader closes + fills shortfall. Pair output at ramp %. Leader&apos;s solo production absorbed.</div></div>
                <div className="flex gap-3 p-3 bg-amber-50 rounded-lg"><span className="text-xs font-bold text-amber-600 w-20 shrink-0">Wk {buddyWeeks + 1}</span><div className="text-xs text-slate-600"><span className="font-bold">Solo launch.</span> Hire takes own meetings. Leader <span className="font-bold">freed up</span> to produce again or take next hire.</div></div>
                <div className="flex gap-3 p-3 bg-emerald-50 rounded-lg"><span className="text-xs font-bold text-emerald-600 w-20 shrink-0">Wk 8+</span><div className="text-xs text-slate-600"><span className="font-bold">Full proficiency.</span> Hire at 100% — books AND closes independently.</div></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Revenue Production Logic</h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs font-bold text-slate-700">Leader alone =</div><div className="text-xs text-slate-500">100% output. Calls + closes.</div></div>
                <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs font-bold text-slate-700">Leader + hire (buddy) =</div><div className="text-xs text-slate-500">Pair at ramp % (e.g. {ramp[0].pct}% Wk 1). Leader at 0% solo. <span className="font-bold text-amber-600">Temporary revenue dip.</span></div></div>
                <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs font-bold text-slate-700">After buddy phase =</div><div className="text-xs text-slate-500">Hire solo + leader free. <span className="font-bold text-emerald-600">2 producers where there was 1.</span></div></div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="text-xs text-amber-800"><span className="font-bold">⚡ The Trade-Off:</span> Every new hire temporarily reduces output. After {buddyWeeks} weeks the pair splits into 2 producers — doubling that slot. Chart shows <span className="font-bold">dip then accelerate</span>.</div>
          </div>
        </div>

        {/* Key Numbers */}
        <div className="bg-slate-800 rounded-2xl p-6 text-white">
          <h2 className="text-base font-bold mb-3">💡 Key Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div><span className="text-slate-400">{numLeaders} leaders (free):</span><div className="font-bold text-emerald-400">+{fmtMoney(numLeaders * fullWNR)}/wk</div></div>
            <div><span className="text-slate-400">Onboarding cost/hire:</span><div className="font-bold text-amber-400">-{fmtMoney(fullWNR * (1 - ramp[0].pct / 100))}/wk × {buddyWeeks} wks</div></div>
            <div><span className="text-slate-400">Churn headwind:</span><div className="font-bold text-red-400">-{fmtMoney(wChurn)}/wk ({monthlyChurnPct}%/mo)</div></div>
            <div><span className="text-slate-400">Ramped hire adds:</span><div className="font-bold text-emerald-400">+{fmtMoney(fullWNR)}/wk recurring</div></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ForecastPage() {
  return (<PasswordGate requireMaster><ForecastContent /></PasswordGate>);
}
