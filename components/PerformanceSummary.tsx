// components/PerformanceSummary.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { weeklyStandards, getCurrentWeekNumber, getWeekBoundaries } from "@/hooks/useActivityTracking";

interface TraineePerformance {
  slug: string;
  name: string;
  week: number;
  today: {
    calls: number;
    bookings: number;
    meetings: number;
    units: number;
    revenue: number;
  };
  weekly: {
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

// Team bookings target: 40 per team EOW, ~13/day Wed–Fri
const TEAM_BOOKINGS_TARGET_EOW = 40;
const TEAM_BOOKINGS_TARGET_DAILY_WED_FRI = 13;

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

function getStatusColor(pct: number): string {
  if (pct >= 100) return "text-emerald-600 bg-emerald-50";
  if (pct >= 75) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function getStatusIcon(pct: number): string {
  if (pct >= 100) return "✓";
  if (pct >= 75) return "→";
  return "!";
}

function getTeamBookingStatusColor(actual: number, target: number): string {
  const pct = target > 0 ? (actual / target) * 100 : 0;
  if (pct >= 100) return "text-emerald-600";
  if (pct >= 50) return "text-amber-600";
  return "text-red-500";
}

export default function PerformanceSummary() {
  const [performances, setPerformances] = useState<TraineePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentWeek = getCurrentWeekNumber();

  // All slugs we want to display (from team definitions)
  const displaySlugs = new Set(teams.flatMap((t) => t.members));

  useEffect(() => {
    const fetchAllPerformances = async () => {
      setIsLoading(true);
      const { start, end } = getWeekBoundaries(currentWeek);

      // Only fetch trainees that are in a team
      const teamTrainees = trainees.filter((t) => displaySlugs.has(t.slug));

      const results = await Promise.all(
        teamTrainees.map(async (trainee) => {
          try {
            const todayRes = await fetch(`/api/activity?trainee_slug=${trainee.slug}`);
            const todayData = await todayRes.json();

            const weekRes = await fetch(
              `/api/activity?trainee_slug=${trainee.slug}&week_start=${start}&week_end=${end}`
            );
            const weekData = await weekRes.json();

            return {
              slug: trainee.slug,
              name: trainee.name,
              week: currentWeek,
              today: {
                calls: todayData.calls || 0,
                bookings: todayData.bookings || 0,
                meetings: todayData.meetings || 0,
                units: todayData.units || 0,
                revenue: todayData.revenue || 0,
              },
              weekly: weekData.weeklyTotals || {
                calls: 0,
                bookings: 0,
                meetings: 0,
                units: 0,
                revenue: 0,
              },
            };
          } catch (error) {
            console.error(`Error fetching performance for ${trainee.slug}:`, error);
            return {
              slug: trainee.slug,
              name: trainee.name,
              week: currentWeek,
              today: { calls: 0, bookings: 0, meetings: 0, units: 0, revenue: 0 },
              weekly: { calls: 0, bookings: 0, meetings: 0, units: 0, revenue: 0 },
            };
          }
        })
      );

      setPerformances(results);
      setIsLoading(false);
    };

    fetchAllPerformances();
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

  const dailyStandard = weeklyStandards[currentWeek] || weeklyStandards[6];
  const weeklyStandard = {
    calls: dailyStandard.calls * 5,
    bookings: dailyStandard.bookings * 5,
    meetings: dailyStandard.meetings * 5,
    units: dailyStandard.units * 5,
    revenue: dailyStandard.revenue * 5,
  };

  const getOverallPct = (perf: TraineePerformance, type: "today" | "weekly") => {
    const data = type === "today" ? perf.today : perf.weekly;
    const standard = type === "today" ? dailyStandard : weeklyStandard;
    const metrics = ["calls", "bookings", "meetings", "units", "revenue"] as const;
    const pcts = metrics.map((m) => {
      const target = standard[m];
      return target > 0 ? Math.min(100, (data[m] / target) * 100) : 100;
    });
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  };

  const getWeekLabel = () => {
    if (currentWeek === 0) return "Training Week";
    if (currentWeek === 6) return "Week 6 — The Standard";
    if (currentWeek > 6) return `Week ${currentWeek} — Maintaining`;
    return `Week ${currentWeek} — Ramp Up`;
  };

  const getWeekPhaseTag = () => {
    if (currentWeek === 0) return { label: "Training", color: "bg-blue-100 text-blue-700" };
    if (currentWeek === 6) return { label: "🎯 The Standard", color: "bg-[#E6017D]/10 text-[#E6017D]" };
    if (currentWeek > 6) return { label: "Maintain", color: "bg-[#84D4BD]/20 text-teal-700" };
    return { label: "Ramp", color: "bg-slate-100 text-slate-600" };
  };

  const phaseTag = getWeekPhaseTag();

  // Lookup map for quick access
  const perfMap = new Map(performances.map((p) => [p.slug, p]));

  // Get team totals
  const getTeamTotals = (memberSlugs: string[]) => {
    const teamPerfs = memberSlugs.map((s) => perfMap.get(s)).filter(Boolean) as TraineePerformance[];
    return {
      calls: teamPerfs.reduce((sum, p) => sum + p.weekly.calls, 0),
      bookings: teamPerfs.reduce((sum, p) => sum + p.weekly.bookings, 0),
      meetings: teamPerfs.reduce((sum, p) => sum + p.weekly.meetings, 0),
      units: teamPerfs.reduce((sum, p) => sum + p.weekly.units, 0),
      revenue: teamPerfs.reduce((sum, p) => sum + p.weekly.revenue, 0),
      todayBookings: teamPerfs.reduce((sum, p) => sum + p.today.bookings, 0),
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">📊 Performance vs Standards</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${phaseTag.color}`}>
                {phaseTag.label}
              </span>
              <span className="text-sm text-gray-600">{getWeekLabel()}</span>
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
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Trainee</th>
              <th className="text-center px-2 py-3 font-semibold">Today</th>
              <th className="text-center px-2 py-3 font-semibold">WTD</th>
              <th className="text-center px-2 py-3 font-semibold">Calls</th>
              <th className="text-center px-2 py-3 font-semibold">Bookings</th>
              <th className="text-center px-2 py-3 font-semibold">Meetings</th>
              <th className="text-center px-2 py-3 font-semibold">Units</th>
              <th className="text-center px-2 py-3 font-semibold">Revenue</th>
            </tr>
          </thead>
            {teams.map((team, teamIndex) => {
              const teamTotals = getTeamTotals(team.members);

              return (
                <tbody key={team.name} className={teamIndex > 0 ? "border-t-2 border-gray-200" : ""}>
                  {/* Team header row */}
                  <tr className="bg-slate-800">
                    <td colSpan={8} className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{team.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-300">
                            Daily target (Wed–Fri): <span className="font-semibold text-white">{TEAM_BOOKINGS_TARGET_DAILY_WED_FRI} bookings/team</span>
                          </span>
                          <span className="text-xs text-slate-300">
                            EOW target: <span className="font-semibold text-white">{TEAM_BOOKINGS_TARGET_EOW} bookings</span>
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Team member rows */}
                  {team.members.map((slug) => {
                    const perf = perfMap.get(slug);
                    if (!perf) return null;

                    const todayPct = getOverallPct(perf, "today");
                    const weeklyPct = getOverallPct(perf, "weekly");

                    return (
                      <tr key={perf.slug} className="hover:bg-gray-50 border-b border-gray-100">
                        <td className="px-4 py-3">
                          <Link
                            href={`/scorecard/${perf.slug}`}
                            className="font-medium text-gray-900 hover:text-[#E6017D] transition-colors"
                          >
                            {perf.name}
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(todayPct)}`}>
                            {getStatusIcon(todayPct)} {todayPct}%
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(weeklyPct)}`}>
                            {getStatusIcon(weeklyPct)} {weeklyPct}%
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center text-sm">
                          <span className="text-gray-900 font-medium">{perf.weekly.calls}</span>
                          <span className="text-gray-400">/{weeklyStandard.calls}</span>
                        </td>
                        <td className="px-2 py-3 text-center text-sm">
                          <span className="text-gray-900 font-medium">{perf.weekly.bookings}</span>
                          <span className="text-gray-400">/{weeklyStandard.bookings}</span>
                        </td>
                        <td className="px-2 py-3 text-center text-sm">
                          <span className="text-gray-900 font-medium">{perf.weekly.meetings}</span>
                          <span className="text-gray-400">/{weeklyStandard.meetings}</span>
                        </td>
                        <td className="px-2 py-3 text-center text-sm">
                          <span className="text-gray-900 font-medium">{perf.weekly.units}</span>
                          <span className="text-gray-400">/{weeklyStandard.units}</span>
                        </td>
                        <td className="px-2 py-3 text-center text-sm">
                          <span className="text-gray-900 font-medium">${perf.weekly.revenue}</span>
                          <span className="text-gray-400">/${weeklyStandard.revenue}</span>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Team totals row */}
                  <tr className="bg-slate-50">
                    <td className="px-4 py-2.5 text-sm font-semibold text-slate-700">
                      {team.name} Total
                    </td>
                    <td colSpan={2}></td>
                    <td className="px-2 py-2.5 text-center text-sm font-semibold text-slate-700">
                      {teamTotals.calls}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm font-bold">
                      <span className={getTeamBookingStatusColor(teamTotals.bookings, TEAM_BOOKINGS_TARGET_EOW)}>
                        {teamTotals.bookings}
                      </span>
                      <span className="text-gray-400 font-normal">/{TEAM_BOOKINGS_TARGET_EOW}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm font-semibold text-slate-700">
                      {teamTotals.meetings}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm font-semibold text-slate-700">
                      {teamTotals.units}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm font-semibold text-slate-700">
                      ${teamTotals.revenue}
                    </td>
                  </tr>
                </tbody>
              );
            })}
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">Week {currentWeek} Target:</span>{" "}
            {weeklyStandard.calls} calls → {weeklyStandard.bookings} bookings → {weeklyStandard.meetings} meetings → {weeklyStandard.units} units → ${weeklyStandard.revenue} revenue
          </div>
          <div className="font-semibold text-[#E6017D]">
            Team Bookings: {TEAM_BOOKINGS_TARGET_EOW}/team EOW • {TEAM_BOOKINGS_TARGET_DAILY_WED_FRI}/team/day (Wed–Fri)
          </div>
        </div>
      </div>
    </div>
  );
}
