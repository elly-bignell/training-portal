// components/PerformanceSummary.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { weeklyStandards, getCurrentWeekNumber, getWeekBoundaries } from "@/hooks/useActivityTracking";

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
    members: ["lucas-tirri", "krishna-patel"],
  },
  {
    name: "Team 2",
    members: ["felipe-garcia", "connie-matthews"],
  },
  {
    name: "Team 3",
    members: ["dylan-munro", "cindy-rose-rondez-manrique"],
  },
];

// Booking targets
const TEAM_BOOKINGS_TARGET_EOW = 40;
const PERSON_BOOKINGS_TARGET_WED_FRI = 7;
const TEAM_BOOKINGS_TARGET_WED_FRI = 13;

// Days of the week
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

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

// Check if a day has a booking target (Wed, Thu, Fri)
function hasBookingTarget(dayName: string): boolean {
  return ["Wed", "Thu", "Fri"].includes(dayName);
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
            const response = await fetch(`/api/activity/all?trainee_slug=${trainee.slug}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

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
            <Link href="/roadmap" className="text-sm text-[#E6017D] hover:underline">
              View Standards →
            </Link>
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
              </tr>
            </thead>

            {teams.map((team, teamIndex) => {
              const teamDayTotals = getTeamDayTotals(team.members);
              const teamWeekTotals = getTeamWeekTotals(team.members);

              return (
                <tbody key={team.name} className={teamIndex > 0 ? "border-t-2 border-gray-200" : ""}>
                  {/* Team header */}
                  <tr className="bg-slate-800">
                    <td colSpan={8} className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{team.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-300">
                            Booking target (Wed–Fri): <span className="font-semibold text-white">{TEAM_BOOKINGS_TARGET_WED_FRI}/team</span> · <span className="font-semibold text-white">{PERSON_BOOKINGS_TARGET_WED_FRI}/person</span>
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
                          </td>
                          <td className="px-1 py-1.5 text-center">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Book</span>
                          </td>
                          {td.days.map((day) => {
                            const target = hasBookingTarget(day.dayName) ? PERSON_BOOKINGS_TARGET_WED_FRI : 0;
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
                          <td className={`px-3 py-1.5 text-center font-semibold ${getBookingStatusClass(td.totals.bookings, TEAM_BOOKINGS_TARGET_EOW / 2)}`}>
                            {td.totals.bookings}
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
                      const target = hasBookingTarget(weekDays[idx]) ? TEAM_BOOKINGS_TARGET_WED_FRI : 0;
                      const statusClass = target > 0
                        ? getTeamBookingStatusClass(dayTotal.bookings, target)
                        : "font-semibold text-slate-700";
                      return (
                        <td key={`team-${team.name}-${idx}`} className={`px-2 py-2 text-center text-sm ${statusClass}`}>
                          {dayTotal.bookings}
                          {target > 0 && (
                            <span className="text-gray-400 font-normal text-xs">/{target}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className={`px-3 py-2 text-center text-sm ${getTeamBookingStatusClass(teamWeekTotals.bookings, TEAM_BOOKINGS_TARGET_EOW)}`}>
                      {teamWeekTotals.bookings}
                      <span className="text-gray-400 font-normal text-xs">/{TEAM_BOOKINGS_TARGET_EOW}</span>
                    </td>
                  </tr>
                </tbody>
              );
            })}

            {/* Grand Total — all teams */}
            <tbody className="border-t-4 border-slate-800">
              <tr className="bg-slate-900">
                <td colSpan={8} className="px-4 py-2">
                  <span className="text-sm font-bold text-white">All Teams — Daily Total</span>
                </td>
              </tr>
              <tr className="bg-slate-100">
                <td className="px-4 py-2 text-xs font-bold text-slate-700 uppercase">Bookings</td>
                <td></td>
                {grandDayTotals.map((dayTotal, idx) => {
                  const target = hasBookingTarget(weekDays[idx]) ? TEAM_BOOKINGS_TARGET_WED_FRI * 3 : 0;
                  return (
                    <td key={`grand-book-${idx}`} className={`px-2 py-2 text-center text-sm font-bold ${target > 0 ? getTeamBookingStatusClass(dayTotal.bookings, target) : "text-slate-800"}`}>
                      {dayTotal.bookings}
                      {target > 0 && <span className="text-gray-400 font-normal text-xs">/{target}</span>}
                    </td>
                  );
                })}
                <td className={`px-3 py-2 text-center text-sm font-bold ${getTeamBookingStatusClass(grandWeekTotals.bookings, TEAM_BOOKINGS_TARGET_EOW * 3)}`}>
                  {grandWeekTotals.bookings}
                  <span className="text-gray-400 font-normal text-xs">/{TEAM_BOOKINGS_TARGET_EOW * 3}</span>
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
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Booking targets:</span>{" "}
              {PERSON_BOOKINGS_TARGET_WED_FRI}/person/day (Wed–Fri) · {TEAM_BOOKINGS_TARGET_WED_FRI}/team/day (Wed–Fri)
            </div>
            <div className="font-semibold text-[#E6017D]">
              EOW: {TEAM_BOOKINGS_TARGET_EOW} bookings/team
            </div>
          </div>
        </div>
      </div>

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
