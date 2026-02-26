// app/forecast/page.tsx

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  startDate: string; // YYYY-MM-DD
}

interface WeekProjection {
  weekIndex: number;
  date: Date;
  revenue: number | null; // null = before base date
  newDealsThisWeek: number;
  newRecurringAdded: number;
  csLossThisWeek: number;
  cumulativeNewClients: number;
  cumulativeCsLost: number;
  activeStaff: number;
  isProjected: boolean;
}

type Ratios = typeof DEFAULT_RATIOS;
type Ramp = typeof DEFAULT_RAMP;

// ─── Constants ───
const YEAR = 2026;
const JAN5 = new Date(2026, 0, 5); // First Monday of 2026

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

// ─── Projection Engine ───
function calculateProjections(
  team: TeamMember[],
  ratios: Ratios,
  ramp: Ramp,
  startingBase: number,
  baseDateStr: string,
  csDailyLoss: number,
): WeekProjection[] {
  const baseDate = getMonday(new Date(baseDateStr + "T00:00:00"));
  const baseWeekIdx = weeksBetween(JAN5, baseDate);
  const endDate = new Date(YEAR, 11, 31);
  const totalWeeks = weeksBetween(JAN5, endDate) + 1;

  // Full weekly deals at 100% ramp
  const fullDealsPerWeek =
    ratios.bookingsPerHour *
    ratios.phoneHoursPerDay *
    5 *
    ratios.attendanceRate *
    ratios.closeRate;

  // Weekly recurring value per deal ($400/month = $400 × 12 / 52)
  const weeklyValuePerDeal = (ratios.dealValue * 12) / 52;

  const csWeeklyLoss = csDailyLoss * 5;

  const projections: WeekProjection[] = [];
  let cumulativeNewClients = 0;
  let cumulativeCsLost = 0;

  for (let w = 0; w < totalWeeks; w++) {
    const weekDate = addWeeks(JAN5, w);

    if (w < baseWeekIdx) {
      projections.push({
        weekIndex: w,
        date: weekDate,
        revenue: null,
        newDealsThisWeek: 0,
        newRecurringAdded: 0,
        csLossThisWeek: 0,
        cumulativeNewClients: 0,
        cumulativeCsLost: 0,
        activeStaff: 0,
        isProjected: false,
      });
      continue;
    }

    // Calculate new deals this week from all team members
    let newDeals = 0;
    let activeStaff = 0;

    for (const person of team) {
      const personStart = getMonday(new Date(person.startDate + "T00:00:00"));
      const personWeekIdx = weeksBetween(JAN5, personStart);

      if (w >= personWeekIdx) {
        const weekInRole = w - personWeekIdx + 1;
        const rampPct = getRampPct(weekInRole, ramp);
        if (rampPct > 0) activeStaff++;
        newDeals += fullDealsPerWeek * (rampPct / 100);
      }
    }

    cumulativeNewClients += newDeals;
    cumulativeCsLost += csWeeklyLoss;

    // Revenue = base + all accumulated new recurring - all accumulated CS losses
    const newRecurringTotal = cumulativeNewClients * weeklyValuePerDeal;
    const revenue = startingBase + newRecurringTotal - cumulativeCsLost;

    projections.push({
      weekIndex: w,
      date: weekDate,
      revenue,
      newDealsThisWeek: newDeals,
      newRecurringAdded: newDeals * weeklyValuePerDeal,
      csLossThisWeek: csWeeklyLoss,
      cumulativeNewClients,
      cumulativeCsLost,
      activeStaff,
      isProjected: w > baseWeekIdx,
    });
  }

  return projections;
}

// ─── SVG Chart Component ───
function TrajectoryChart({
  data,
  target,
  targetDateStr,
  team,
  baseDateStr,
}: {
  data: WeekProjection[];
  target: number;
  targetDateStr: string;
  team: TeamMember[];
  baseDateStr: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const baseDate = getMonday(new Date(baseDateStr + "T00:00:00"));
  const baseWeekIdx = weeksBetween(JAN5, baseDate);

  // Only show from 2 weeks before base date
  const startIdx = Math.max(0, baseWeekIdx - 2);
  const visibleData = data.slice(startIdx);

  // Chart dims
  const W = 960, H = 420;
  const PAD = { top: 30, right: 40, bottom: 55, left: 90 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  // Valid (non-null) data points
  const validData = visibleData.filter((d) => d.revenue !== null);
  if (validData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
        <p>Add team members to see the revenue trajectory</p>
      </div>
    );
  }

  const allRevenues = validData.map((d) => d.revenue!);
  const yMin = Math.min(Math.min(...allRevenues), target) * 0.92;
  const yMax = Math.max(Math.max(...allRevenues), target) * 1.08;

  const xScale = (i: number) => PAD.left + (i / Math.max(visibleData.length - 1, 1)) * cw;
  const yScale = (v: number) => PAD.top + ch - ((v - yMin) / (yMax - yMin)) * ch;

  // Revenue line path
  const pathPoints: string[] = [];
  let firstValid = true;
  for (let i = 0; i < visibleData.length; i++) {
    const d = visibleData[i];
    if (d.revenue === null) continue;
    const x = xScale(i);
    const y = yScale(d.revenue);
    pathPoints.push(`${firstValid ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    firstValid = false;
  }
  const pathD = pathPoints.join(" ");

  // Area fill under line
  const firstValidIdx = visibleData.findIndex((d) => d.revenue !== null);
  const lastValidIdx = visibleData.length - 1;
  const areaD =
    pathD +
    ` L ${xScale(lastValidIdx).toFixed(1)} ${(PAD.top + ch).toFixed(1)}` +
    ` L ${xScale(firstValidIdx).toFixed(1)} ${(PAD.top + ch).toFixed(1)} Z`;

  // Target line
  const targetY = yScale(target);

  // Target date marker
  const targetDate = getMonday(new Date(targetDateStr + "T00:00:00"));
  const targetWeekFromStart = weeksBetween(JAN5, targetDate) - startIdx;
  const targetX = targetWeekFromStart >= 0 && targetWeekFromStart < visibleData.length
    ? xScale(targetWeekFromStart) : null;

  // Y axis gridlines
  const yTicks: number[] = [];
  const yStep = Math.pow(10, Math.floor(Math.log10(yMax - yMin))) / 2;
  const yStart = Math.ceil(yMin / yStep) * yStep;
  for (let v = yStart; v <= yMax; v += yStep) yTicks.push(v);

  // Month labels on x-axis
  const monthLabels: { x: number; label: string }[] = [];
  for (let m = 0; m < 12; m++) {
    const firstOfMonth = new Date(YEAR, m, 1);
    const weekOfMonth = weeksBetween(JAN5, getMonday(firstOfMonth)) - startIdx;
    if (weekOfMonth >= 0 && weekOfMonth < visibleData.length) {
      monthLabels.push({
        x: xScale(weekOfMonth),
        label: firstOfMonth.toLocaleDateString("en-AU", { month: "short" }),
      });
    }
  }

  // Person start markers
  const personMarkers = team.map((p) => {
    const pStart = getMonday(new Date(p.startDate + "T00:00:00"));
    const pWeek = weeksBetween(JAN5, pStart) - startIdx;
    if (pWeek < 0 || pWeek >= visibleData.length) return null;
    const d = visibleData[pWeek];
    if (!d || d.revenue === null) return null;
    return { x: xScale(pWeek), y: yScale(d.revenue), label: p.label, week: pWeek };
  }).filter(Boolean) as { x: number; y: number; label: string; week: number }[];

  // Current week marker
  const now = new Date();
  const currentWeekFromStart = weeksBetween(JAN5, getMonday(now)) - startIdx;

  // Hover handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    const relX = mouseX - PAD.left;
    const idx = Math.round((relX / cw) * (visibleData.length - 1));
    if (idx >= 0 && idx < visibleData.length && visibleData[idx].revenue !== null) {
      setHoverIdx(idx);
    } else {
      setHoverIdx(null);
    }
  };

  const hovered = hoverIdx !== null ? visibleData[hoverIdx] : null;

  // Find where line crosses target
  let crossWeekIdx: number | null = null;
  for (let i = 1; i < visibleData.length; i++) {
    const prev = visibleData[i - 1];
    const curr = visibleData[i];
    if (prev.revenue !== null && curr.revenue !== null) {
      if (prev.revenue < target && curr.revenue >= target) {
        crossWeekIdx = i;
        break;
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Weekly Recurring Revenue Trajectory</h2>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-emerald-500 inline-block rounded"></span> Projected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-red-400 inline-block rounded" style={{ borderTop: "2px dashed #f87171" }}></span> Target
          </span>
          {crossWeekIdx !== null && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">
              Target hit: {fmtDate(visibleData[crossWeekIdx].date)}
            </span>
          )}
          {crossWeekIdx === null && validData.length > 0 && validData[validData.length - 1].revenue! < target && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full">
              Target not reached by EOY
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ maxHeight: 420 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Y gridlines */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)} stroke="#f1f5f9" strokeWidth="1" />
              <text x={PAD.left - 8} y={yScale(v) + 4} textAnchor="end" className="text-[11px]" fill="#94a3b8">
                {fmtMoneyK(v)}
              </text>
            </g>
          ))}

          {/* X axis month labels */}
          {monthLabels.map((m, i) => (
            <g key={i}>
              <line x1={m.x} y1={PAD.top} x2={m.x} y2={PAD.top + ch} stroke="#f1f5f9" strokeWidth="1" />
              <text x={m.x} y={H - PAD.bottom + 20} textAnchor="middle" className="text-[11px]" fill="#94a3b8">
                {m.label}
              </text>
            </g>
          ))}

          {/* Target line */}
          <line
            x1={PAD.left}
            y1={targetY}
            x2={W - PAD.right}
            y2={targetY}
            stroke="#f87171"
            strokeWidth="1.5"
            strokeDasharray="8 5"
          />
          <text x={W - PAD.right + 4} y={targetY + 4} className="text-[10px] font-semibold" fill="#f87171">
            {fmtMoneyK(target)}
          </text>

          {/* Target date vertical line */}
          {targetX !== null && (
            <>
              <line x1={targetX} y1={PAD.top} x2={targetX} y2={PAD.top + ch} stroke="#f87171" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
              <text x={targetX} y={H - PAD.bottom + 35} textAnchor="middle" className="text-[10px] font-semibold" fill="#f87171">
                18 Dec
              </text>
            </>
          )}

          {/* Area fill */}
          <path d={areaD} fill="url(#gradient)" opacity="0.15" />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Revenue line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Starting base horizontal reference */}
          {firstValidIdx >= 0 && visibleData[firstValidIdx].revenue !== null && (
            <line
              x1={PAD.left}
              y1={yScale(visibleData[firstValidIdx].revenue!)}
              x2={W - PAD.right}
              y2={yScale(visibleData[firstValidIdx].revenue!)}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          )}

          {/* Person start markers */}
          {personMarkers.map((m, i) => (
            <g key={i}>
              <circle cx={m.x} cy={m.y} r="5" fill="#10b981" stroke="white" strokeWidth="2" />
              <text x={m.x} y={m.y - 12} textAnchor="middle" className="text-[9px] font-bold" fill="#059669">
                +{m.label}
              </text>
            </g>
          ))}

          {/* Current week marker */}
          {currentWeekFromStart >= 0 && currentWeekFromStart < visibleData.length && (
            <line
              x1={xScale(currentWeekFromStart)}
              y1={PAD.top}
              x2={xScale(currentWeekFromStart)}
              y2={PAD.top + ch}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Target cross marker */}
          {crossWeekIdx !== null && (
            <g>
              <circle cx={xScale(crossWeekIdx)} cy={yScale(target)} r="7" fill="#10b981" stroke="white" strokeWidth="2.5" />
              <circle cx={xScale(crossWeekIdx)} cy={yScale(target)} r="3" fill="white" />
            </g>
          )}

          {/* Hover line & tooltip */}
          {hoverIdx !== null && hovered && hovered.revenue !== null && (
            <>
              <line
                x1={xScale(hoverIdx)}
                y1={PAD.top}
                x2={xScale(hoverIdx)}
                y2={PAD.top + ch}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              <circle cx={xScale(hoverIdx)} cy={yScale(hovered.revenue)} r="5" fill="#10b981" stroke="white" strokeWidth="2" />
            </>
          )}

          {/* Invisible hover rect */}
          <rect x={PAD.left} y={PAD.top} width={cw} height={ch} fill="transparent" />
        </svg>

        {/* Tooltip overlay */}
        {hoverIdx !== null && hovered && hovered.revenue !== null && (
          <div
            className="absolute bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none z-10"
            style={{
              left: `${(xScale(hoverIdx) / W) * 100}%`,
              top: `${((yScale(hovered.revenue) - 20) / H) * 100}%`,
              transform: hoverIdx > visibleData.length * 0.7 ? "translate(-110%, -100%)" : "translate(-50%, -100%)",
            }}
          >
            <div className="font-bold text-emerald-300">{fmtMoney(hovered.revenue)}/wk</div>
            <div className="text-gray-300 mt-0.5">
              Week of {fmtDate(hovered.date)} · {hovered.activeStaff} active
            </div>
            <div className="text-gray-400 mt-0.5">
              +{hovered.newDealsThisWeek.toFixed(1)} deals · +{fmtMoney(hovered.newRecurringAdded)} new
              · -{fmtMoney(hovered.csLossThisWeek)} CS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Forecast Content ───
function ForecastContent() {
  const [ratios, setRatios] = usePersistedState<Ratios>("shared-ratios", { ...DEFAULT_RATIOS });
  const [ramp, setRamp] = usePersistedState("shared-ramp", DEFAULT_RAMP.map((r) => ({ ...r })));
  const [startingBase, setStartingBase] = usePersistedState("forecast-startingBase", 152522);
  const [weeklyTarget, setWeeklyTarget] = usePersistedState("forecast-weeklyTarget", 250000);
  const [targetDate, setTargetDate] = usePersistedState("forecast-targetDate", "2026-12-18");
  const [csDailyLoss, setCsDailyLoss] = usePersistedState("forecast-csDailyLoss", 230);
  const [baseDate, setBaseDate] = usePersistedState("forecast-baseDate", "2026-02-23");
  const [team, setTeam] = usePersistedState<TeamMember[]>("forecast-team", []);
  const [showRamp, setShowRamp] = usePersistedState("forecast-showRamp", false);
  const [showRatios, setShowRatios] = usePersistedState("forecast-showRatios", false);

  const nextId = () => `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Team leader capacity check
  const teamLeaders = 3;

  // Calculate projections
  const projections = useMemo(
    () => calculateProjections(team, ratios, ramp, startingBase, baseDate, csDailyLoss),
    [team, ratios, ramp, startingBase, baseDate, csDailyLoss],
  );

  // Summary stats
  const validProjections = projections.filter((p) => p.revenue !== null);
  const currentRevenue = startingBase;
  const gap = weeklyTarget - currentRevenue;

  // Find projected revenue at target date
  const targetDateObj = getMonday(new Date(targetDate + "T00:00:00"));
  const targetWeekIdx = weeksBetween(JAN5, targetDateObj);
  const projectedAtTarget = projections.find((p) => p.weekIndex === targetWeekIdx);
  const projectedRevenue = projectedAtTarget?.revenue ?? null;

  // Find when target is hit
  let targetHitDate: string | null = null;
  for (const p of validProjections) {
    if (p.revenue !== null && p.revenue >= weeklyTarget) {
      targetHitDate = fmtDate(p.date);
      break;
    }
  }

  // EOY stats
  const eoyProjection = projections[projections.length - 1];
  const eoyRevenue = eoyProjection?.revenue ?? null;

  // Full standard weekly new recurring per person
  const fullDealsPerWeek = ratios.bookingsPerHour * ratios.phoneHoursPerDay * 5 * ratios.attendanceRate * ratios.closeRate;
  const weeklyValuePerDeal = (ratios.dealValue * 12) / 52;
  const fullWeeklyNewRecurring = fullDealsPerWeek * weeklyValuePerDeal;

  // CS impact
  const csWeeklyLoss = csDailyLoss * 5;
  const csAnnualLoss = csWeeklyLoss * 52;
  const peopleToOffsetCS = Math.ceil(csWeeklyLoss / fullWeeklyNewRecurring * 10) / 10;

  // Buddy capacity warning
  const buddyWarnings = useMemo(() => {
    // Check each week if more than 3 people are in buddy phase (weeks 1-6)
    const warnings: string[] = [];
    for (const p of projections) {
      if (p.revenue === null) continue;
      let inBuddyPhase = 0;
      for (const person of team) {
        const personStart = getMonday(new Date(person.startDate + "T00:00:00"));
        const personWeekIdx = weeksBetween(JAN5, personStart);
        const weekInRole = p.weekIndex - personWeekIdx + 1;
        if (weekInRole >= 1 && weekInRole <= 6) inBuddyPhase++;
      }
      if (inBuddyPhase > teamLeaders) {
        warnings.push(`Week of ${fmtDate(p.date)}: ${inBuddyPhase} people in buddy phase but only ${teamLeaders} team leaders`);
      }
    }
    return Array.from(new Set(warnings)).slice(0, 3);
  }, [projections, team]);

  // Add person
  const addPerson = () => {
    const num = team.length + 1;
    const today = new Date();
    const nextMon = getMonday(new Date(today.getTime() + 7 * 86400000));
    setTeam((prev: TeamMember[]) => [
      ...prev,
      {
        id: nextId(),
        label: `Person ${num}`,
        startDate: nextMon.toISOString().split("T")[0],
      },
    ]);
  };

  const removePerson = (id: string) => setTeam((prev: TeamMember[]) => prev.filter((p) => p !== prev.find((x) => x.id === id)));

  const updatePerson = (id: string, field: keyof TeamMember, value: string) =>
    setTeam((prev: TeamMember[]) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

  // Get ramp info for person
  const getPersonWeekInRole = (startDate: string) => {
    const start = getMonday(new Date(startDate + "T00:00:00"));
    const now = getMonday(new Date());
    const weeks = weeksBetween(start, now) + 1;
    return weeks;
  };

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1100px] mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">📈 Revenue Forecast</h1>
                <p className="text-sm text-slate-400">Model team growth and project recurring revenue trajectory</p>
              </div>
            </div>
            <Link
              href="/projections"
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              📊 Per-Person Projections →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">

        {/* ─── Summary Cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-black text-slate-800">{fmtMoneyK(currentRevenue)}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Current /wk</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-black text-red-500">{fmtMoneyK(weeklyTarget)}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Target /wk</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-black text-amber-600">{fmtMoneyK(gap)}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Gap to Close</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-black ${projectedRevenue !== null && projectedRevenue >= weeklyTarget ? "text-emerald-600" : "text-slate-600"}`}>
              {projectedRevenue !== null ? fmtMoneyK(projectedRevenue) : "—"}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Projected 18 Dec</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-black text-emerald-600">
              {targetHitDate ?? "—"}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Target Hit Date</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-black text-slate-800">{team.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Team Size</div>
          </div>
        </div>

        {/* ─── Chart ─── */}
        <TrajectoryChart
          data={projections}
          target={weeklyTarget}
          targetDateStr={targetDate}
          team={team}
          baseDateStr={baseDate}
        />

        {/* ─── Key Inputs Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Starting Base */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Revenue Base</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500">Starting Weekly Revenue ($)</label>
                <input
                  type="number"
                  value={startingBase}
                  onChange={(e) => setStartingBase(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500">Base Date (week of)</label>
                <input
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>
          </div>

          {/* Target */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Target</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500">Weekly Revenue Target ($)</label>
                <input
                  type="number"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>
          </div>

          {/* CS Impact */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Customer Service Impact</h3>
            <div>
              <label className="text-[10px] font-semibold text-gray-500">Daily Net Loss (losses - upsells)</label>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-bold text-red-500">-${csDailyLoss}</span>
                <span className="text-xs text-gray-400">/day</span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={10}
                value={csDailyLoss}
                onChange={(e) => setCsDailyLoss(Number(e.target.value))}
                className="w-full mt-2 accent-red-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>$0/day</span>
                <span>$1,000/day</span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Weekly impact:</span>
                  <span className="font-bold text-red-500">-{fmtMoney(csWeeklyLoss)}/wk</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual impact:</span>
                  <span className="font-bold text-red-500">-{fmtMoney(csAnnualLoss)}/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>People to offset:</span>
                  <span className="font-bold text-slate-700">{peopleToOffsetCS.toFixed(1)} fully ramped</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Buddy Capacity Warnings ─── */}
        {buddyWarnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-600 font-bold text-sm">⚠️ Team Leader Capacity</span>
            </div>
            <div className="text-xs text-amber-700 space-y-1">
              {buddyWarnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
              {buddyWarnings.length < team.length && (
                <p className="text-amber-500 italic">...and more weeks affected. Consider staggering start dates.</p>
              )}
            </div>
          </div>
        )}

        {/* ─── Team Builder ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Team Builder</h2>
                <p className="text-xs text-slate-400">
                  {teamLeaders} team leaders available · Each can buddy 1 new hire at a time (Weeks 1–6)
                </p>
              </div>
            </div>
            <button
              onClick={addPerson}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              + Add Person
            </button>
          </div>

          {team.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm">Add team members to model revenue growth</p>
              <p className="text-xs mt-1">Each person generates {fullDealsPerWeek.toFixed(1)} deals/week at full ramp = +{fmtMoney(fullWeeklyNewRecurring)}/wk new recurring</p>
            </div>
          ) : (
            <div className="space-y-3">
              {team.map((person, idx) => {
                const weekInRole = getPersonWeekInRole(person.startDate);
                const hasStarted = weekInRole >= 1;
                const rampPct = hasStarted ? getRampPct(Math.min(weekInRole, 8), ramp) : 0;
                const isBuddyPhase = hasStarted && weekInRole <= 6;
                const isSolo = hasStarted && weekInRole >= 7;
                const fullDate = new Date(person.startDate + "T00:00:00");
                const week8Date = addWeeks(fullDate, 7);

                return (
                  <div key={person.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          isSolo ? "bg-emerald-500" : isBuddyPhase ? "bg-blue-500" : "bg-gray-400"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <input
                        type="text"
                        value={person.label}
                        onChange={(e) => updatePerson(person.id, "label", e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold w-36 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Start:</span>
                        <input
                          type="date"
                          value={person.startDate}
                          onChange={(e) => updatePerson(person.id, "startDate", e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>

                      <span className="text-xs text-gray-400">
                        100% by: <span className="font-bold text-slate-700">{fmtDate(week8Date)}</span>
                      </span>

                      {hasStarted && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            rampPct === 100
                              ? "bg-emerald-100 text-emerald-700"
                              : rampPct >= 75
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          Wk {Math.min(weekInRole, 8)} · {rampPct}%
                        </span>
                      )}

                      {!hasStarted && (
                        <span className="text-xs text-gray-400 italic">Not started</span>
                      )}

                      <button
                        onClick={() => removePerson(person.id)}
                        className="ml-auto text-gray-300 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Ramp bar */}
                    <div className="mt-3 flex gap-1">
                      {ramp.map((r, wi) => {
                        const weekNum = wi + 1;
                        const isActive = hasStarted && weekInRole >= weekNum;
                        const isCurrent = hasStarted && weekInRole === weekNum;
                        return (
                          <div key={wi} className="flex-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isCurrent
                                  ? "bg-emerald-500 ring-2 ring-emerald-300"
                                  : isActive
                                  ? r.pct === 100
                                    ? "bg-emerald-500"
                                    : r.pct >= 75
                                    ? "bg-amber-400"
                                    : "bg-blue-400"
                                  : "bg-gray-200"
                              }`}
                            />
                            <div className="text-center text-[9px] text-gray-400 mt-0.5">W{weekNum}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Per-Person Ratios ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setShowRatios(!showRatios)}
            className="w-full p-5 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚙️</span>
              <div>
                <h2 className="text-base font-bold text-slate-800">Per-Person Ratios</h2>
                <p className="text-xs text-slate-400">
                  {ratios.phoneHoursPerDay}hrs calling · {ratios.bookingsPerHour} bookings/hr ·{" "}
                  {(ratios.attendanceRate * 100).toFixed(0)}% attendance · {(ratios.closeRate * 100).toFixed(0)}% close ·{" "}
                  ${ratios.dealValue}/deal
                </p>
              </div>
            </div>
            <span className="text-gray-400">{showRatios ? "▲" : "▼"}</span>
          </button>

          {showRatios && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 mb-4">
                These ratios are shared with the{" "}
                <Link href="/projections" className="text-emerald-600 underline">Per-Person Projections</Link> page.
                Changes here will reflect there and vice versa.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block">Phone hrs/day</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ratios.phoneHoursPerDay}
                    onChange={(e) => setRatios({ ...ratios, phoneHoursPerDay: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block">Bookings/hr</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ratios.bookingsPerHour}
                    onChange={(e) => setRatios({ ...ratios, bookingsPerHour: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block">Attendance %</label>
                  <input
                    type="number"
                    step="5"
                    min={0}
                    max={100}
                    value={(ratios.attendanceRate * 100).toFixed(0)}
                    onChange={(e) => setRatios({ ...ratios, attendanceRate: Number(e.target.value) / 100 })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block">Close %</label>
                  <input
                    type="number"
                    step="5"
                    min={0}
                    max={100}
                    value={(ratios.closeRate * 100).toFixed(0)}
                    onChange={(e) => setRatios({ ...ratios, closeRate: Number(e.target.value) / 100 })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block">Deal value ($/mo)</label>
                  <input
                    type="number"
                    step="50"
                    value={ratios.dealValue}
                    onChange={(e) => setRatios({ ...ratios, dealValue: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block">Calls/hr</label>
                  <input
                    type="number"
                    value={ratios.callsPerHour}
                    onChange={(e) => setRatios({ ...ratios, callsPerHour: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold mt-1"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                <span className="font-bold">Full standard per person:</span>{" "}
                {fullDealsPerWeek.toFixed(1)} deals/week → +{fmtMoney(fullWeeklyNewRecurring)}/wk new recurring revenue
              </div>
            </div>
          )}
        </div>

        {/* ─── 8-Week Ramp Schedule ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setShowRamp(!showRamp)}
            className="w-full p-5 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📈</span>
              <div>
                <h2 className="text-base font-bold text-slate-800">8-Week Ramp Schedule</h2>
                <p className="text-xs text-slate-400">Configure output % per week during onboarding</p>
              </div>
            </div>
            <span className="text-gray-400">{showRamp ? "▲" : "▼"}</span>
          </button>

          {showRamp && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {ramp.map((r, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[10px] font-bold text-gray-400 mb-1">Week {r.week}</div>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      value={r.pct}
                      onChange={(e) => {
                        const updated = ramp.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x));
                        setRamp(updated);
                      }}
                      className="w-full border border-gray-200 rounded-lg px-1 py-1.5 text-sm font-bold text-center"
                    />
                    <div className="text-[9px] text-gray-400 mt-0.5">{r.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-3">
                Weeks 1–6: New hire books, team leader closes (buddy system). Week 7+: Flying solo.
              </p>
            </div>
          )}
        </div>

        {/* ─── Monthly Breakdown Table ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-x-auto">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Monthly Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="pb-2 text-left text-xs font-semibold text-gray-400">Month</th>
                <th className="pb-2 text-right text-xs font-semibold text-gray-400">Active Staff</th>
                <th className="pb-2 text-right text-xs font-semibold text-gray-400">New Deals</th>
                <th className="pb-2 text-right text-xs font-semibold text-emerald-500">New Recurring</th>
                <th className="pb-2 text-right text-xs font-semibold text-red-400">CS Loss</th>
                <th className="pb-2 text-right text-xs font-semibold text-gray-400">Net Change</th>
                <th className="pb-2 text-right text-xs font-semibold text-slate-700 pl-4">Weekly Rev (EOM)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, m) => {
                const monthStart = new Date(YEAR, m, 1);
                const monthEnd = new Date(YEAR, m + 1, 0);
                const monthName = monthStart.toLocaleDateString("en-AU", { month: "short" });

                // Find last week of this month in projections
                const monthWeeks = projections.filter((p) => {
                  return p.date.getMonth() === m && p.revenue !== null;
                });

                if (monthWeeks.length === 0) return null;

                const lastWeek = monthWeeks[monthWeeks.length - 1];
                const firstWeek = monthWeeks[0];

                // Sum stats for the month
                const monthDeals = monthWeeks.reduce((s, w) => s + w.newDealsThisWeek, 0);
                const monthNewRecurring = monthWeeks.reduce((s, w) => s + w.newRecurringAdded, 0);
                const monthCsLoss = monthWeeks.reduce((s, w) => s + w.csLossThisWeek, 0);
                const netChange = monthNewRecurring - monthCsLoss;

                const eomRevenue = lastWeek.revenue!;
                const isCurrentMonth = new Date().getMonth() === m;
                const hitsTarget = eomRevenue >= weeklyTarget;

                return (
                  <tr
                    key={m}
                    className={`border-b border-gray-100 ${isCurrentMonth ? "bg-indigo-50/50" : ""} ${hitsTarget ? "bg-emerald-50/30" : ""}`}
                  >
                    <td className="py-2.5 font-medium text-gray-700">
                      {monthName}
                      {isCurrentMonth && <span className="ml-1 text-[10px] text-indigo-500">← now</span>}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-gray-600">{lastWeek.activeStaff}</td>
                    <td className="py-2.5 text-right tabular-nums text-gray-600">{monthDeals.toFixed(1)}</td>
                    <td className="py-2.5 text-right tabular-nums text-emerald-600 font-semibold">
                      +{fmtMoney(monthNewRecurring)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-red-500">
                      -{fmtMoney(monthCsLoss)}
                    </td>
                    <td className={`py-2.5 text-right tabular-nums font-semibold ${netChange >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {netChange >= 0 ? "+" : ""}{fmtMoney(netChange)}
                    </td>
                    <td className={`py-2.5 text-right tabular-nums font-bold pl-4 ${hitsTarget ? "text-emerald-600" : "text-slate-800"}`}>
                      {fmtMoney(eomRevenue)}
                      {hitsTarget && <span className="ml-1 text-[10px]">✓</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ─── Key Insights ─── */}
        <div className="bg-slate-800 rounded-2xl p-6 text-white">
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">💡 Key Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Full-ramp person adds:</span>
              <div className="font-bold text-emerald-400">+{fmtMoney(fullWeeklyNewRecurring)}/wk recurring</div>
              <div className="text-xs text-slate-400">{fullDealsPerWeek.toFixed(1)} deals/wk × ${weeklyValuePerDeal.toFixed(2)}/deal/wk</div>
            </div>
            <div>
              <span className="text-slate-400">CS headwind:</span>
              <div className="font-bold text-red-400">-{fmtMoney(csWeeklyLoss)}/wk</div>
              <div className="text-xs text-slate-400">Need {peopleToOffsetCS.toFixed(1)} fully ramped just to break even</div>
            </div>
            <div>
              <span className="text-slate-400">Max onboarding capacity:</span>
              <div className="font-bold text-blue-300">{teamLeaders} at a time (buddy phase)</div>
              <div className="text-xs text-slate-400">New batch every 6 weeks when team leaders free up</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

// ─── Export ───
export default function ForecastPage() {
  return (
    <PasswordGate requireMaster>
      <ForecastContent />
    </PasswordGate>
  );
}
