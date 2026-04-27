// components/PerformanceSummary.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { weeklyStandards, getCurrentWeekNumber, getWeekBoundaries, getDayOfWeek, TRAINEE_WEEK_OVERRIDES } from "@/hooks/useActivityTracking";

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
    members: ["lucas-tirri", "cindy-rose-rondez-manrique", "riley-kerrison"],
  },
  {
    name: "Team 2",
    members: ["felipe-garcia", "sydney-arnold"],
  },
  {
    name: "Team 3",
    members: ["dylan-munro", "krishna-patel"],
  },
  {
    name: "Team 4",
    members: ["thomas-rennie"],
  },
];

// Trainees who carry the 7/day individual booking target
// Buddies (Lucas, Felipe, Dylan) have no individual target — they pick up the slack
const TRAINEES_WITH_TARGET = new Set([
  "cindy-rose-rondez-manrique",
  "sydney-arnold",
  "krishna-patel",
  "thomas-rennie",
]);

// Booking targets
const TRAINEE_BOOKINGS_TARGET_DAILY = 7;
const TEAM_BOOKINGS_TARGET_DAILY = 7;
const TEAM_BOOKINGS_TARGET_EOW = 35; // 7/day × 5 days

// Days of the week
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Week-on-board badges per lead gen trainee
const WEEK_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  "cindy-rose-rondez-manrique": { label: "Wk 6", color: "#16a34a", bg: "#dcfce7" },
  "krishna-patel":              { label: "Wk 6", color: "#16a34a", bg: "#dcfce7" },
  "riley-kerrison":             { label: "Wk 0", color: "#7c3aed", bg: "#ede9fe" },
  "sydney-arnold":              { label: "Wk 1", color: "#2563eb", bg: "#dbeafe" },
};

// Week date ranges for display
const weekDateRanges: Record<number, string> = {
  0: "Mon 16 Feb – Fri 20 Feb",
  1: "Mon 23 Feb – Fri 27 Feb",
  2: "Mon 2 Mar – Fri 6 Mar",
  3: "Mon 9 Mar – Fri 13 Mar",
  4: "Mon 16 Mar – Fri 20 Mar",
  5: "Mon 23 Mar – Fri 27 Mar",
  6: "Mon 30 Mar – Fri 3 Apr",
  7: "Mon 6 Apr – Fri 10 Apr",
  8: "Mon 13 Apr – Fri 17 Apr",
};

// Week 0 ramp booking targets (Mon=0 … Fri=4) — applies to any Week 0 trainee
const WEEK0_TRAINEE_BOOKING_TARGETS = [3, 4, 5, 6, 7];
const WEEK0_BUDDY_BOOKING_TARGETS   = [4, 3, 2, 1, 0];
const WEEK0_TRAINEE_EOW = 25; // 3+4+5+6+7
const WEEK0_BUDDY_EOW   = 10; // 4+3+2+1+0

// Map each Week 0 trainee → the buddy who picks up the slack
const WEEK0_BUDDIES: Record<string, string> = {
  "riley-kerrison": "lucas-tirri",
};

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
  return TRAINEES_WITH_TARGET.has(slug) ? TRAINEE_BOOKINGS_TARGET_DAILY : 0;
}

function getIndividualEowTarget(slug: string): number {
  if (TRAINEE_WEEK_OVERRIDES[slug] === 0) return WEEK0_TRAINEE_EOW;
  const week0Trainee = Object.keys(WEEK0_BUDDIES).find(
    (t) => WEEK0_BUDDIES[t] === slug && TRAINEE_WEEK_OVERRIDES[t] === 0
  );
  if (week0Trainee) return WEEK0_BUDDY_EOW;
  return TRAINEES_WITH_TARGET.has(slug) ? TEAM_BOOKINGS_TARGET_EOW : 0;
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

// Generate the 5 weekday dates for a given week
function getWeekDates(weekNum: number): string[] {
  const weekConfigs: Record<number, string> = {
    0: "2026-02-16",
    1: "2026-02-23",
    2: "2026-03-02",
    3: "2026-03-09",
    4: "2026-03-16",
    5: "2026-03-23",
    6: "2026-03-30",
    7: "2026-04-06",
    8: "2026-04-13",
  };
  const startStr = weekConfigs[weekNum] || weekConfigs[0];
  const [year, month, day] = startStr.split("-").map(Number);
  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(Date.UTC(year, month - 1, day + i));
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

  // Grand daily target = number of teams × 7
  const grandDailyTarget = teams.length * TEAM_BOOKINGS_TARGET_DAILY;
  const grandEowTarget = teams.length * TEAM_BOOKINGS_TARGET_EOW;

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
                <span className="text-sm text-gray-600">{getWeekLabel(currentWeek)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{weekDateRanges[currentWeek]}</p>
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

              return (
                <tbody key={team.name} className={teamIndex > 0 ? "border-t-2 border-gray-200" : ""}>
                  {/* Team header */}
                  <tr className="bg-slate-800">
                    <td colSpan={9} className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{team.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-300">
                            Booking target: <span className="font-semibold text-white">{TEAM_BOOKINGS_TARGET_DAILY}/team/day</span> · <span className="font-semibold text-white">{TRAINEE_BOOKINGS_TARGET_DAILY}/trainee</span>
                          </span>
                          <span className="text-xs text-slate-300">
                            EOW: <span className="font-semibold text-white">{TEAM_BOOKINGS_TARGET_EOW} bookings</span>
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
                            {WEEK_BADGES[td.slug] && (
                              <span
                                className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{ color: WEEK_BADGES[td.slug].color, background: WEEK_BADGES[td.slug].bg }}
                              >
                                {WEEK_BADGES[td.slug].label}
                              </span>
                            )}
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
                      const statusClass = getTeamBookingStatusClass(dayTotal.bookings, TEAM_BOOKINGS_TARGET_DAILY);
                      return (
                        <td key={`team-${team.name}-${idx}`} className={`px-2 py-2 text-center text-sm ${statusClass}`}>
                          {dayTotal.bookings}
                          <span className="text-gray-400 font-normal text-xs">/{TEAM_BOOKINGS_TARGET_DAILY}</span>
                        </td>
                      );
                    })}
                    <td className={`px-3 py-2 text-center text-sm ${getTeamBookingStatusClass(teamWeekTotals.bookings, TEAM_BOOKINGS_TARGET_EOW)}`}>
                      {teamWeekTotals.bookings}
                      <span className="text-gray-400 font-normal text-xs">/{TEAM_BOOKINGS_TARGET_EOW}</span>
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
              {TRAINEE_BOOKINGS_TARGET_DAILY}/trainee/day · {TEAM_BOOKINGS_TARGET_DAILY}/team/day (buddy picks up the slack)
            </div>
            <div className="font-semibold text-[#E6017D]">
              EOW: {TEAM_BOOKINGS_TARGET_EOW} bookings/team
            </div>
          </div>
        </div>
      </div>

      {/* ── Efficiency Spotlight ── */}
      {(() => {
        // Find the best conversion rate across all individuals
        const allMemberData = teams.flatMap((t) => t.members).map((s) => dataMap.get(s)).filter(Boolean) as TraineeWeekData[];
        let liveBestRate = 0;
        let liveBestName = "";
        allMemberData.forEach((td) => {
          if (td.totals.calls > 0) {
            const rate = td.totals.bookings / td.totals.calls;
            if (rate > liveBestRate) {
              liveBestRate = rate;
              liveBestName = td.name.split(" ")[0];
            }
          }
        });

        // Persist the highest rate seen — survives week resets
        let bestRate = liveBestRate;
        let bestName = liveBestName;
        try {
          const stored = JSON.parse(localStorage.getItem("spotlight_best") || "{}");
          if (stored.rate && stored.rate > liveBestRate) {
            // Stored rate is higher (e.g. new week, data reset) — keep it
            bestRate = stored.rate;
            bestName = stored.name || "—";
          }
          // Save if current is higher or equal (keeps it fresh)
          if (liveBestRate >= (stored.rate || 0)) {
            localStorage.setItem("spotlight_best", JSON.stringify({ rate: liveBestRate, name: liveBestName }));
          }
        } catch {
          // localStorage unavailable — just use live data
        }

        const bestPct = Math.round(bestRate * 100);
        if (bestPct === 0) return null;

        const targets = [
          { bookings: 6, label: "6 bookings", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: "🔥" },
          { bookings: 5, label: "5 bookings", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: "⚡" },
          { bookings: 4, label: "4 bookings", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: "📞" },
        ];

        return (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">📐 Efficiency Spotlight</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Best call-to-booking rate this week: <span className="text-white font-bold text-sm">{bestPct}%</span> <span className="text-slate-400">({bestName})</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">At this rate, to hit daily targets you need:</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {targets.map((t) => {
                const callsNeeded = Math.ceil(t.bookings / bestRate);
                return (
                  <div key={t.bookings} className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <div className="text-2xl font-bold text-white">{t.bookings} bookings</div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-slate-500">=</span>
                      <span className="text-lg font-bold text-slate-300">{callsNeeded} calls</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">at {bestPct}% conversion</div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 mt-5 pt-4">
              <p className="text-[10px] text-slate-300 uppercase tracking-wide mb-3">At 20% cut through from call:booking</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { bookings: 6, icon: "🔥" },
                  { bookings: 5, icon: "⚡" },
                  { bookings: 4, icon: "📞" },
                ].map((t) => {
                  const callsNeeded = Math.ceil(t.bookings / 0.2);
                  return (
                    <div key={t.bookings} className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">{t.bookings} bookings</div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-slate-400">=</span>
                        <span className="text-sm font-bold text-slate-200">{callsNeeded} calls</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">at 20% conversion</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 text-center">
              As your conversion improves, fewer calls = same bookings. That&apos;s the goal.
            </p>
          </div>
        );
      })()}

      {/* ── Meetings, Units & Revenue Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">📈 Meetings, Units & Revenue</h3>
          <p className="text-sm text-gray-400 mt-1">{weekDateRanges[currentWeek]}</p>
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
