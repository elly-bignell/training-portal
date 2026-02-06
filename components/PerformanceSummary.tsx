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

export default function PerformanceSummary() {
  const [performances, setPerformances] = useState<TraineePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentWeek = getCurrentWeekNumber();

  useEffect(() => {
    const fetchAllPerformances = async () => {
      setIsLoading(true);
      const { start, end } = getWeekBoundaries(currentWeek);

      const results = await Promise.all(
        trainees.map(async (trainee) => {
          try {
            // Fetch today's activity
            const todayRes = await fetch(`/api/activity?trainee_slug=${trainee.slug}`);
            const todayData = await todayRes.json();

            // Fetch weekly activity
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

  // Calculate overall % to standard for each trainee
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
    if (currentWeek === 6) return "The Standard";
    if (currentWeek > 6) return `Week ${currentWeek} (Maintain)`;
    return `Week ${currentWeek} (Ramp)`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">📊 Performance vs Standards</h3>
          <p className="text-sm text-gray-500">{getWeekLabel()} • Daily & Weekly Tracking</p>
        </div>
        <Link
          href="/roadmap"
          className="text-sm text-[#E6017D] hover:underline"
        >
          View Standards →
        </Link>
      </div>

      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Trainee</th>
              <th className="text-center px-2 py-3 font-semibold">Today</th>
              <th className="text-center px-2 py-3 font-semibold">Week</th>
              <th className="text-center px-2 py-3 font-semibold">Calls</th>
              <th className="text-center px-2 py-3 font-semibold">Bookings</th>
              <th className="text-center px-2 py-3 font-semibold">Meetings</th>
              <th className="text-center px-2 py-3 font-semibold">Units</th>
              <th className="text-center px-2 py-3 font-semibold">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performances.map((perf) => {
              const todayPct = getOverallPct(perf, "today");
              const weeklyPct = getOverallPct(perf, "weekly");

              return (
                <tr key={perf.slug} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/trainees/${perf.slug}`}
                      className="font-medium text-gray-900 hover:text-[#E6017D]"
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
                    <span className="text-gray-900">{perf.weekly.calls}</span>
                    <span className="text-gray-400">/{weeklyStandard.calls}</span>
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    <span className="text-gray-900">{perf.weekly.bookings}</span>
                    <span className="text-gray-400">/{weeklyStandard.bookings}</span>
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    <span className="text-gray-900">{perf.weekly.meetings}</span>
                    <span className="text-gray-400">/{weeklyStandard.meetings}</span>
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    <span className="text-gray-900">{perf.weekly.units}</span>
                    <span className="text-gray-400">/{weeklyStandard.units}</span>
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    <span className="text-gray-900">${perf.weekly.revenue}</span>
                    <span className="text-gray-400">/${weeklyStandard.revenue}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with standard reference */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        <span className="font-semibold">Week {currentWeek} Daily Standard:</span>{" "}
        {dailyStandard.calls} calls → {dailyStandard.bookings} bookings → {dailyStandard.meetings} meetings → {dailyStandard.units} units → ${dailyStandard.revenue} revenue
      </div>
    </div>
  );
}
