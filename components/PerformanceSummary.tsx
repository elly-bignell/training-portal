// components/PerformanceSummary.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { LEAD_GEN_SLUGS } from "@/data/leadGen";
import { weeklyStandards, getCurrentWeekNumber, getWeekBoundaries, getDayOfWeek, TRAINEE_WEEK_OVERRIDES, getTraineeWeek, getYearWeekLabel } from "@/hooks/useActivityTracking";

interface DailyData {
  date: string;
  dayName: string;
  calls: number;
  bookings: number;
  meetings: number;
  units: number;
  revenue: number;
}

interface TraineeWeekData {
  slug: string;
  name: string;
  days: DailyData[];
  totals: {
    calls: number;
    bookings: number;
    meetings: number;
    units: number;
    revenue: number;
  };
}

// Team structure — defines display order and grouping
const teams = [
  {
    name: "Team 1",
    members: ["lucas-tirri", "cindy-rose-rondez-manrique"],
  },
  {
    name: "Team 2",
    members: ["felipe-garcia", "sydney-arnold", "shian-roux"],
  },
  {
    name: "Team 3",
    members: ["dylan-munro", "riley-kerrison", "jade-bautista"],
  },
];

// Trainees who carry the 7/day individual booking target. Sourced from
// data/leadGen.ts so this widget and the Daily Checklist tab list stay in
// sync. Buddies (Lucas, Felipe, Dylan) have no individual target — they
// pick up the slack. Lead-gen trainees in Wk 0 use the special
// WEEK0_TRAINEE_BOOKING_TARGETS ramp instead of 7/day, but once they
// graduate Wk 0 they fall back to this set.
const TRAINEES_WITH_TARGET = new Set<string>(LEAD_GEN_SLUGS);

// Booking targets
const TRAINEE_BOOKINGS_TARGET_DAILY = 7;
const TEAM_BOOKINGS_TARGET_DAILY = 7;
const TEAM_BOOKINGS_TARGET_EOW = 35; // 7/day × 5 days

// Days of the week
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Week-on-board badge for a lead-gen trainee, derived from their startDate
// (1-indexed: their first calendar week on the job = Week 1).
// Returns null for trainees who aren't in the ramp-up flow (buddies, seniors).
// Wk 1 = purple (training/first week), Wk 2–5 = blue (ramp), Wk 6+ = green
// ("The Standard"). The number is shown as-is — e.g. a 10-week veteran reads
// "Wk 10" in the green chip.
function getWeekBadge(slug: string): { label: string; color: string; bg: string } | null {
  const wk = getTraineeWeek(slug);
  if (wk === null || wk < 1) return null;
  if (wk === 1) return { label: "Wk 1", color: "#7c3aed", bg: "#ede9fe" };
  if (wk >= 6) return { label: `Wk ${wk}`, color: "#16a34a", bg: "#dcfce7" };
  return { label: `Wk ${wk}`, color: "#2563eb", bg: "#dbeafe" };
}

// Week 0's Monday — every other week's dates are derived from this so the
// dashboard auto-rolls forward each week (no manual config needed).
const WEEK_0_MONDAY_ISO = "2026-02-16";

// Returns the Monday (as a UTC Date) for a given training week number.
function getWeekMonday(weekNum: number): Date {
  const [year, month, day] = WEEK_0_MONDAY_ISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + weekNum * 7));
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Build a "Mon 27 Apr – Fri 1 May" style label for the given week.
function getWeekDateRange(weekNum: number): string {
  const monday = getWeekMonday(weekNum);
  const friday = new Date(monday);
  friday.setUTCDate(friday.getUTCDate() + 4);
  const fmt = (d: Date, prefix: string) =>
    `${prefix} ${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]}`;
  return `${fmt(monday, "Mon")} – ${fmt(friday, "Fri")}`;
}

// Week 0 ramp booking targets (Mon=0 … Fri=4) — applies to any Week 0 trainee
const WEEK0_TRAINEE_BOOKING_TARGETS = [3, 4, 5, 6, 7];
const WEEK0_BUDDY_BOOKING_TARGETS   = [4, 3, 2, 1, 0];
const WEEK0_TRAINEE_EOW = 25; // 3+4+5+6+7
const WEEK0_BUDDY_EOW   = 10; // 4+3+2+1+0

// Map each Week 0 trainee → the buddy who picks up the slack
const WEEK0_BUDDIES: Record<string, string> = {
  "riley-kerrison": "lucas-tirri",
};

// True if today (Adelaide) is on/after the trainee's startDate. Used to gate
// daily/EOW booking targets so trainees who haven't joined yet don't show a
// /7 target (which would otherwise drag their team into red before they
// arrive). Trainees without a startDate on file are treated as already started.
function hasTraineeStarted(slug: string): boolean {
  const t = trainees.find((tr) => tr.slug === slug);
  if (!t || !t.startDate) return true;
  const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
  return t.startDate <= todayISO;
}

function getIndividualDayTarget(slug: string, dayIdx: number): number {
  // Is this slug a Week 0 trainee?
  if (TRAINEE_WEEK_OVERRIDES[slug] === 0) {
    return WEEK0_TRAINEE_BOOKING_TARGETS[dayIdx] ?? 7;
  }
  // Is this slug the buddy of an active Week 0 trainee?
  const week0Trainee = Object.keys(WEEK0_BUDDIES).find(
    (t) => WEEK0_BUDDIES[t] === slug && TRAINEE_WEEK_OVERRIDES[t] === 0
  );
  if (week0Trainee) return WEEK0_BUDDY_BOOKING_TARGETS[dayIdx] ?? 0;
  if (!TRAINEES_WITH_TARGET.has(slug)) return 0;
  if (!hasTraineeStarted(slug)) return 0;
  return TRAINEE_BOOKINGS_TARGET_DAILY;
}

function getIndividualEowTarget(slug: string): number {
  if (TRAINEE_WEEK_OVERRIDES[slug] === 0) return WEEK0_TRAINEE_EOW;
  const week0Trainee = Object.keys(WEEK0_BUDDIES).find(
    (t) => WEEK0_BUDDIES[t] === slug && TRAINEE_WEEK_OVERRIDES[t] === 0
  );
  if (week0Trainee) return WEEK0_BUDDY_EOW;
  if (!TRAINEES_WITH_TARGET.has(slug)) return 0;
  if (!hasTraineeStarted(slug)) return 0;
  return TEAM_BOOKINGS_TARGET_EOW;
}

// Per-team daily and EOW booking targets — summed from each member's individual
// target. Buddies (Lucas, Felipe, Dylan) have no individual target so they
// contribute 0; a two-trainee team like Team 1 (Cindy + Riley) hits 14/day,
// 70/EOW. Single-trainee teams hit 7/day, 35/EOW.
function getTeamDailyTarget(memberSlugs: string[]): number {
  return memberSlugs.reduce((sum, slug) => sum + getIndividualDayTarget(slug, 0), 0);
}

function getTeamEowTarget(memberSlugs: string[]): number {
  return memberSlugs.reduce((sum, slug) => sum + getIndividualEowTarget(slug), 0);
}

// Get booking status colour for a person
function getBookingStatusClass(actual: number, target: number): string {
  if (target === 0) return "text-gray-600";
  const pct = (actual / target) * 100;
  if (pct >= 100) return "text-emerald-600 font-semibold";
  if (pct >= 50) return "text-amber-600";
  return "text-red-500";
}

// Get team booking status colour
function getTeamBookingStatusClass(actual: number, target: number): string {
  if (target === 0) return "text-slate-700";
  const pct = (actual / target) * 100;
  if (pct >= 100) return "text-emerald-600 font-bold";
  if (pct >= 50) return "text-amber-600 font-bold";
  return "text-red-500 font-bold";
}

function getWeekLabel(currentWeek: number) {
  if (currentWeek === 0) return "Training Week";
  if (currentWeek === 6) return "Week 6 — The Standard";
  if (currentWeek > 6) return `Week ${currentWeek} — Maintaining`;
  return `Week ${currentWeek} — Ramp Up`;
}

function getWeekPhaseTag(currentWeek: number) {
  if (currentWeek === 0) return { label: "Training", color: "bg-blue-100 text-blue-700" };
  if (currentWeek === 6) return { label: "🎯 The Standard", color: "bg-[#E6017D]/10 text-[#E6017D]" };
  if (currentWeek > 6) return { label: "Maintain", color: "bg-[#84D4BD]/20 text-teal-700" };
  return { label: "Ramp", color: "bg-slate-100 text-slate-600" };
}

// Generate the 5 weekday ISO dates (Mon–Fri) for a given week
function getWeekDates(weekNum: number): string[] {
  const monday = getWeekMonday(weekNum);
  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export default function PerformanceSummary() {
  const [weekData, setWeekData] = useState<TraineeWeekData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const currentWeek = getCurrentWeekNumber();

  // All slugs we want to display (from team definitions)
  const displaySlugs = new Set(teams.flatMap((t) => t.members));

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      const weekDates = getWeekDates(currentWeek);

      // Only fetch trainees that are in a team
      const teamTrainees = trainees.filter((t) => displaySlugs.has(t.slug));

      const results = await Promise.all(
        teamTrainees.map(async (trainee) => {
          try {
            const response = await fetch(`/api/activity/all?trainee_slug=${trainee.slug}`, { cache: "no-store" });
            const data = await response.json();
            const records = data.records || [];

            // Map each weekday to its data
            const days: DailyData[] = weekDates.map((date, idx) => {
              const record = records.find((r: { date: string }) => r.date === date);
              return {
                date,
                dayName: weekDays[idx],
                calls: record?.calls || 0,
                bookings: record?.bookings || 0,
                meetings: record?.meetings || 0,
                units: record?.units || 0,
                revenue: record?.revenue || 0,
              };
            });

            const totals = days.reduce(
              (acc, day) => ({
                calls: acc.calls + day.calls,
                bookings: acc.bookings + day.bookings,
                meetings: acc.meetings + day.meetings,
                units: acc.units + day.units,
                revenue: acc.revenue + day.revenue,
              }),
              { calls: 0, bookings: 0, meetings: 0, units: 0, revenue: 0 }
            );

            return {
              slug: trainee.slug,
              name: trainee.name,
              days,
              totals,
            };
          } catch (error) {
            console.error(`Error fetching data for ${trainee.slug}:`, error);
            return {
              slug: trainee.slug,
              name: trainee.name,
              days: weekDates.map((date, idx) => ({
                date,
                dayName: weekDays[idx],
                calls: 0,
                bookings: 0,
                meetings: 0,
                units: 0,
                revenue: 0,
              })),
              totals: { calls: 0, bookings: 0, meetings: 0, units: 0, revenue: 0 },
            };
          }
        })
      );

      setWeekData(results);
      setIsLoading(false);
    };

    fetchAllData();
    const interval = setInterval(() => setRefreshTick((t) => t + 1), 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek, refreshTick]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Performance vs Standards</h3>
        <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Loading performance data...
        </div>
      </div>
    );
  }

  const phaseTag = getWeekPhaseTag(currentWeek);
  const dataMap = new Map(weekData.map((t) => [t.slug, t]));

  // Get team day totals
  const getTeamDayTotals = (memberSlugs: string[]) => {
    const memberData = memberSlugs.map((s) => dataMap.get(s)).filter(Boolean) as TraineeWeekData[];
    return weekDays.map((_, idx) => ({
      calls: memberData.reduce((sum, m) => sum + (m.days[idx]?.calls || 0), 0),
      bookings: memberData.reduce((sum, m) => sum + (m.days[idx]?.bookings || 0), 0),
    }));
  };

  const getTeamWeekTotals = (memberSlugs: string[]) => {
    const memberData = memberSlugs.map((s) => dataMap.get(s)).filter(Boolean) as TraineeWeekData[];
    return {
      calls: memberData.reduce((sum, m) => sum + m.totals.calls, 0),
      bookings: memberData.reduce((sum, m) => sum + m.totals.bookings, 0),
      meetings: memberData.reduce((sum, m) => sum + m.totals.meetings, 0),
      units: memberData.reduce((sum, m) => sum + m.totals.units, 0),
      revenue: memberData.reduce((sum, m) => sum + m.totals.revenue, 0),
    };
  };

  // Grand totals across all teams
  const allMembers = teams.flatMap((t) => t.members);
  const grandDayTotals = (() => {
    const memberData = allMembers.map((s) => dataMap.get(s)).filter(Boolean) as TraineeWeekData[];
    return weekDays.map((_, idx) => ({
      calls: memberData.reduce((sum, m) => sum + (m.days[idx]?.calls || 0), 0),
      bookings: memberData.reduce((sum, m) => sum + (m.days[idx]?.bookings || 0), 0),
    }));
  })();
  const grandWeekTotals = (() => {
    const memberData = allMembers.map((s) => dataMap.get(s)).filter(Boolean) as TraineeWeekData[];
    return {
      calls: memberData.reduce((sum, m) => sum + m.totals.calls, 0),
      bookings: memberData.reduce((sum, m) => sum + m.totals.bookings, 0),
    };
  })();

  // Grand daily/EOW target = sum across all teams (each team's target is
  // sum of its trainees' individual targets). Today: Team 1 (Cindy+Riley) 14
  // + Team 2 (Sydney) 7 + Team 3 (Krishna) 7 + Team 4 (Thomas) 7 = 35/day,
  // 175/EOW. Auto-adjusts as TRAINEES_WITH_TARGET membership changes.
  const grandDailyTarget = teams.reduce((sum, t) => sum + getTeamDailyTarget(t.members), 0);
  const grandEowTarget = teams.reduce((sum, t) => sum + getTeamEowTarget(t.members), 0);

  return (
    <div className="space-y-6">
      {/* ── Calls & Bookings Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">📊 Calls & Bookings</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${phaseTag.color}`}>
                  {phaseTag.label}
                </span>
                <span className="text-sm text-gray-600">{getYearWeekLabel()}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{getWeekDateRange(currentWeek)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRefreshTick((t) => t + 1)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh data"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <Link href="/roadmap" className="text-sm text-[#E6017D] hover:underline">
                View Standards →
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-semibold min-w-[160px]">Trainee</th>
                <th className="text-center px-1 py-3 font-semibold w-[50px]"></th>
                {weekDays.map((day) => (
                  <th key={day} className="text-center px-2 py-3 font-semibold">
                    {day}
                  </th>
                ))}
                <th className="text-center px-3 py-3 font-semibold">Total</th>
                <th className="text-center px-2 py-3 font-semibold">%</th>
              </tr>
            </thead>

            {teams.map((team, teamIndex) => {
              const teamDayTotals = getTeamDayTotals(team.members);
              const teamWeekTotals = getTeamWeekTotals(team.members);
              const teamDailyTarget = getTeamDailyTarget(team.members);
              const teamEowTarget = getTeamEowTarget(team.members);

              return (
                <tbody key={team.name} className={teamIndex > 0 ? "border-t-2 border-gray-200" : ""}>
                  {/* Team header */}
                  <tr className="bg-slate-800">
                    <td colSpan={9} className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{team.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-300">
                            Booking target: <span className="font-semibold text-white">{teamDailyTarget}/team/day</span> · <span className="font-semibold text-white">{TRAINEE_BOOKINGS_TARGET_DAILY}/trainee</span>
                          </span>
                          <span className="text-xs text-slate-300">
                            EOW: <span className="font-semibold text-white">{teamEowTarget} bookings</span>
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Team members */}
                  {team.members.map((slug) => {
                    const td = dataMap.get(slug);
                    if (!td) return null;

                    return (
                      <React.Fragment key={td.slug}>
                        {/* Bookings row */}
                        <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td rowSpan={2} className="px-4 py-2 align-middle border-b border-gray-100">
                            <Link
                              href={`/scorecard/${td.slug}`}
                              className="font-medium text-gray-900 hover:text-[#E6017D] transition-colors"
                            >
                              {td.name}
                            </Link>
                            {(() => {
                              const badge = getWeekBadge(td.slug);
                              if (!badge) return null;
                              return (
                                <span
                                  className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
                                  style={{ color: badge.color, background: badge.bg }}
                                >
                                  {badge.label}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-1 py-1.5 text-center">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Book</span>
                          </td>
                          {td.days.map((day, dayIdx) => {
                            const target = getIndividualDayTarget(td.slug, dayIdx);
                            const statusClass = target > 0
                              ? getBookingStatusClass(day.bookings, target)
                              : "text-gray-700";
                            return (
                              <td key={`${td.slug}-book-${day.date}`} className={`px-2 py-1.5 text-center ${statusClass}`}>
                                {day.bookings > 0 ? day.bookings : <span className="text-gray-300">–</span>}
                                {target > 0 && (
                                  <span className="text-gray-300 text-[10px]">/{target}</span>
                                )}
                              </td>
                            );
                          })}
                          <td className={`px-3 py-1.5 text-center font-semibold ${getIndividualEowTarget(td.slug) > 0 ? getBookingStatusClass(td.totals.bookings, getIndividualEowTarget(td.slug)) : "text-gray-800"}`}>
                            {td.totals.bookings}
                          </td>
                          <td className="px-2 py-1.5 text-center text-xs font-semibold text-gray-600">
                            {td.totals.calls > 0 ? `${Math.round((td.totals.bookings / td.totals.calls) * 100)}%` : <span className="text-gray-300">–</span>}
                          </td>
                        </tr>
                        {/* Calls row */}
                        <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="px-1 py-1.5 text-center">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Calls</span>
                          </td>
                          {td.days.map((day) => (
                            <td key={`${td.slug}-calls-${day.date}`} className="px-2 py-1.5 text-center text-gray-700">
                              {day.calls > 0 ? day.calls : <span className="text-gray-300">–</span>}
                            </td>
                          ))}
                          <td className="px-3 py-1.5 text-center font-semibold text-gray-800">
                            {td.totals.calls}
                          </td>
                          <td></td>
                        </tr>
                      </React.Fragment>
                    );
                  })}

                  {/* Team totals */}
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <td className="px-4 py-2 text-xs font-bold text-slate-600 uppercase">
                      {team.name} Total
                    </td>
                    <td className="px-1 py-2 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Book</span>
                    </td>
                    {teamDayTotals.map((dayTotal, idx) => {
                      const statusClass = getTeamBookingStatusClass(dayTotal.bookings, teamDailyTarget);
                      return (
                        <td key={`team-${team.name}-${idx}`} className={`px-2 py-2 text-center text-sm ${statusClass}`}>
                          {dayTotal.bookings}
                          <span className="text-gray-400 font-normal text-xs">/{teamDailyTarget}</span>
                        </td>
                      );
                    })}
                    <td className={`px-3 py-2 text-center text-sm ${getTeamBookingStatusClass(teamWeekTotals.bookings, teamEowTarget)}`}>
                      {teamWeekTotals.bookings}
                      <span className="text-gray-400 font-normal text-xs">/{teamEowTarget}</span>
                    </td>
                    <td className="px-2 py-2 text-center text-xs font-bold text-slate-600">
                      {teamWeekTotals.calls > 0 ? `${Math.round((teamWeekTotals.bookings / teamWeekTotals.calls) * 100)}%` : "–"}
                    </td>
                  </tr>
                </tbody>
              );
            })}

            {/* Grand Total — all teams */}
            <tbody className="border-t-4 border-slate-800">
              <tr className="bg-slate-900">
                <td colSpan={9} className="px-4 py-2">
                  <span className="text-sm font-bold text-white">All Teams — Daily Total</span>
                </td>
              </tr>
              <tr className="bg-slate-100">
                <td className="px-4 py-2 text-xs font-bold text-slate-700 uppercase">Bookings</td>
                <td></td>
                {grandDayTotals.map((dayTotal, idx) => (
                  <td key={`grand-book-${idx}`} className={`px-2 py-2 text-center text-sm font-bold ${getTeamBookingStatusClass(dayTotal.bookings, grandDailyTarget)}`}>
                    {dayTotal.bookings}
                    <span className="text-gray-400 font-normal text-xs">/{grandDailyTarget}</span>
                  </td>
                ))}
                <td className={`px-3 py-2 text-center text-sm font-bold ${getTeamBookingStatusClass(grandWeekTotals.bookings, grandEowTarget)}`}>
                  {grandWeekTotals.bookings}
                  <span className="text-gray-400 font-normal text-xs">/{grandEowTarget}</span>
                </td>
                <td className="px-2 py-2 text-center text-xs font-bold text-slate-800">
                  {grandWeekTotals.calls > 0 ? `${Math.round((grandWeekTotals.bookings / grandWeekTotals.calls) * 100)}%` : "–"}
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="px-4 py-2 text-xs font-bold text-slate-700 uppercase">Calls</td>
                <td></td>
                {grandDayTotals.map((dayTotal, idx) => (
                  <td key={`grand-calls-${idx}`} className="px-2 py-2 text-center text-sm font-bold text-slate-800">
                    {dayTotal.calls}
                  </td>
                ))}
                <td className="px-3 py-2 text-center text-sm font-bold text-slate-800">
                  {grandWeekTotals.calls}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Booking targets:</span>{" "}
              {TRAINEE_BOOKINGS_TARGET_DAILY}/trainee/day · {grandDailyTarget}/all-teams/day (buddies pick up the slack)
            </div>
            <div className="font-semibold text-[#E6017D]">
              EOW: {grandEowTarget} bookings total
            </div>
          </div>
        </div>
      </div>

      {/* ── Meetings, Units & Revenue Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">📈 Meetings, Units & Revenue</h3>
          <p className="text-sm text-gray-400 mt-1">{getWeekDateRange(currentWeek)}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-semibold min-w-[160px]">Trainee</th>
                <th className="text-center px-1 py-3 font-semibold w-[50px]"></th>
                {weekDays.map((day) => (
                  <th key={day} className="text-center px-2 py-3 font-semibold">{day}</th>
                ))}
                <th className="text-center px-3 py-3 font-semibold">Total</th>
              </tr>
            </thead>

            {teams.map((team, teamIndex) => {
              const teamWeekTotals = getTeamWeekTotals(team.members);
              const memberData = team.members.map((s) => dataMap.get(s)).filter(Boolean) as TraineeWeekData[];
              const teamDayMeetings = weekDays.map((_, idx) => memberData.reduce((sum, m) => sum + (m.days[idx]?.meetings || 0), 0));
              const teamDayUnits = weekDays.map((_, idx) => memberData.reduce((sum, m) => sum + (m.days[idx]?.units || 0), 0));
              const teamDayRevenue = weekDays.map((_, idx) => memberData.reduce((sum, m) => sum + (m.days[idx]?.revenue || 0), 0));

              return (
                <tbody key={team.name} className={teamIndex > 0 ? "border-t-2 border-gray-200" : ""}>
                  {/* Team header */}
                  <tr className="bg-slate-800">
                    <td colSpan={8} className="px-4 py-2">
                      <span className="text-sm font-bold text-white">{team.name}</span>
                    </td>
                  </tr>

                  {/* Members */}
                  {team.members.map((slug) => {
                    const td = dataMap.get(slug);
                    if (!td) return null;
                    return (
                      <React.Fragment key={td.slug}>
                        {/* Meetings row */}
                        <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td rowSpan={3} className="px-4 py-2 align-middle border-b border-gray-100">
                            <span className="font-medium text-gray-900">{td.name}</span>
                          </td>
                          <td className="px-1 py-1.5 text-center">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Attended</span>
                          </td>
                          {td.days.map((day) => (
                            <td key={`${td.slug}-meet-${day.date}`} className="px-2 py-1.5 text-center text-gray-700">
                              {day.meetings > 0 ? day.meetings : <span className="text-gray-300">–</span>}
                            </td>
                          ))}
                          <td className="px-3 py-1.5 text-center font-semibold text-gray-800">{td.totals.meetings}</td>
                        </tr>
                        {/* Units row */}
                        <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-1 py-1.5 text-center">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Units</span>
                          </td>
                          {td.days.map((day) => (
                            <td key={`${td.slug}-units-${day.date}`} className="px-2 py-1.5 text-center text-gray-700">
                              {day.units > 0 ? day.units : <span className="text-gray-300">–</span>}
                            </td>
                          ))}
                          <td className="px-3 py-1.5 text-center font-semibold text-gray-800">{td.totals.units}</td>
                        </tr>
                        {/* Revenue row */}
                        <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="px-1 py-1.5 text-center">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Rev ($)</span>
                          </td>
                          {td.days.map((day) => (
                            <td key={`${td.slug}-rev-${day.date}`} className="px-2 py-1.5 text-center text-gray-700">
                              {day.revenue > 0 ? `$${day.revenue.toLocaleString()}` : <span className="text-gray-300">–</span>}
                            </td>
                          ))}
                          <td className="px-3 py-1.5 text-center font-semibold text-gray-800">
                            {td.totals.revenue > 0 ? `$${td.totals.revenue.toLocaleString()}` : "$0"}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}

                  {/* Team totals */}
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <td rowSpan={3} className="px-4 py-2 text-xs font-bold text-slate-600 uppercase align-middle">{team.name} Total</td>
                    <td className="px-1 py-1.5 text-center"><span className="text-[10px] text-slate-400 uppercase font-semibold">Attended</span></td>
                    {teamDayMeetings.map((val, idx) => (
                      <td key={`team-meet-${team.name}-${idx}`} className="px-2 py-1.5 text-center font-semibold text-slate-700">{val}</td>
                    ))}
                    <td className="px-3 py-1.5 text-center font-semibold text-slate-700">{teamWeekTotals.meetings}</td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <td className="px-1 py-1.5 text-center"><span className="text-[10px] text-slate-400 uppercase font-semibold">Units</span></td>
                    {teamDayUnits.map((val, idx) => (
                      <td key={`team-units-${team.name}-${idx}`} className="px-2 py-1.5 text-center font-semibold text-slate-700">{val}</td>
                    ))}
                    <td className="px-3 py-1.5 text-center font-semibold text-slate-700">{teamWeekTotals.units}</td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <td className="px-1 py-1.5 text-center"><span className="text-[10px] text-slate-400 uppercase font-semibold">Rev ($)</span></td>
                    {teamDayRevenue.map((val, idx) => (
                      <td key={`team-rev-${team.name}-${idx}`} className="px-2 py-1.5 text-center font-semibold text-slate-700">
                        {val > 0 ? `$${val.toLocaleString()}` : "$0"}
                      </td>
                    ))}
                    <td className="px-3 py-1.5 text-center font-semibold text-slate-700">
                      {teamWeekTotals.revenue > 0 ? `$${teamWeekTotals.revenue.toLocaleString()}` : "$0"}
                    </td>
                  </tr>
                </tbody>
              );
            })}
          </table>
        </div>
      </div>
    </div>
  );
}
