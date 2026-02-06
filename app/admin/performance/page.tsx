// app/admin/performance/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { weeklyStandards } from "@/hooks/useActivityTracking";
import PasswordGate from "@/components/PasswordGate";

interface DailyRecord {
  date: string;
  calls: number;
  bookings: number;
  meetings: number;
  units: number;
  revenue: number;
}

interface WeekData {
  weekNum: number;
  dateRange: string;
  days: DailyRecord[];
  totals: {
    calls: number;
    bookings: number;
    meetings: number;
    units: number;
    revenue: number;
  };
  targets: {
    calls: number;
    bookings: number;
    meetings: number;
    units: number;
    revenue: number;
  };
}

interface TraineeData {
  slug: string;
  name: string;
  weeks: WeekData[];
}

// Week configurations
const weekConfig: Record<number, { start: string; end: string; label: string; dateRange: string }> = {
  0: { start: "2026-02-16", end: "2026-02-20", label: "Training Week", dateRange: "Mon 16 – Fri 20 Feb" },
  1: { start: "2026-02-23", end: "2026-02-27", label: "Week 1", dateRange: "Mon 23 – Fri 27 Feb" },
  2: { start: "2026-03-02", end: "2026-03-06", label: "Week 2", dateRange: "Mon 2 – Fri 6 Mar" },
  3: { start: "2026-03-09", end: "2026-03-13", label: "Week 3", dateRange: "Mon 9 – Fri 13 Mar" },
  4: { start: "2026-03-16", end: "2026-03-20", label: "Week 4", dateRange: "Mon 16 – Fri 20 Mar" },
  5: { start: "2026-03-23", end: "2026-03-27", label: "Week 5", dateRange: "Mon 23 – Fri 27 Mar" },
  6: { start: "2026-03-30", end: "2026-04-03", label: "Week 6 (The Standard)", dateRange: "Mon 30 Mar – Fri 3 Apr" },
  7: { start: "2026-04-06", end: "2026-04-10", label: "Week 7", dateRange: "Mon 6 – Fri 10 Apr" },
  8: { start: "2026-04-13", end: "2026-04-17", label: "Week 8", dateRange: "Mon 13 – Fri 17 Apr" },
};

// Get week number from date
function getWeekNumber(dateStr: string): number {
  const date = new Date(dateStr);
  for (let i = 8; i >= 0; i--) {
    const weekStart = new Date(weekConfig[i].start);
    const weekEnd = new Date(weekConfig[i].end);
    weekEnd.setHours(23, 59, 59);
    if (date >= weekStart && date <= weekEnd) {
      return i;
    }
  }
  return -1; // Outside training period
}

// Format day name
function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", { weekday: "short" });
}

// Format date short
function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

// Status color based on percentage
function getStatusClass(actual: number, target: number): string {
  if (target === 0) return "text-gray-400";
  const pct = (actual / target) * 100;
  if (pct >= 100) return "text-emerald-600 font-semibold";
  if (pct >= 75) return "text-amber-600";
  return "text-red-500";
}

function PerformanceDashboardContent() {
  const [traineeData, setTraineeData] = useState<TraineeData[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);

      const allTraineeData: TraineeData[] = [];

      for (const trainee of trainees) {
        try {
          const response = await fetch(`/api/activity/all?trainee_slug=${trainee.slug}`);
          const data = await response.json();

          // Group records by week
          const weekMap = new Map<number, DailyRecord[]>();

          for (const record of data.records || []) {
            const weekNum = getWeekNumber(record.date);
            if (weekNum >= 0) {
              if (!weekMap.has(weekNum)) {
                weekMap.set(weekNum, []);
              }
              weekMap.get(weekNum)!.push({
                date: record.date,
                calls: record.calls,
                bookings: record.bookings,
                meetings: record.meetings,
                units: record.units,
                revenue: record.revenue,
              });
            }
          }

          // Convert to WeekData array, sorted by week number descending (newest first)
          const weeks: WeekData[] = [];
          for (const [weekNum, days] of weekMap) {
            // Sort days by date ascending within week
            days.sort((a, b) => a.date.localeCompare(b.date));

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

            const dailyTarget = weeklyStandards[weekNum] || weeklyStandards[6];
            const targets = {
              calls: dailyTarget.calls * 5,
              bookings: dailyTarget.bookings * 5,
              meetings: dailyTarget.meetings * 5,
              units: dailyTarget.units * 5,
              revenue: dailyTarget.revenue * 5,
            };

            weeks.push({
              weekNum,
              dateRange: weekConfig[weekNum]?.dateRange || "",
              days,
              totals,
              targets,
            });
          }

          // Sort weeks descending (newest first)
          weeks.sort((a, b) => b.weekNum - a.weekNum);

          allTraineeData.push({
            slug: trainee.slug,
            name: trainee.name,
            weeks,
          });
        } catch (error) {
          console.error(`Error fetching data for ${trainee.slug}:`, error);
          allTraineeData.push({
            slug: trainee.slug,
            name: trainee.name,
            weeks: [],
          });
        }
      }

      setTraineeData(allTraineeData);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  const toggleWeekExpanded = (key: string) => {
    setExpandedWeeks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData =
    selectedTrainee === "all"
      ? traineeData
      : traineeData.filter((t) => t.slug === selectedTrainee);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-gray-500 py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-[#E6017D] rounded-full animate-spin" />
            Loading performance data...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Performance Dashboard</h1>
                <p className="text-slate-400 text-sm">Week-by-week & day-by-day breakdown</p>
              </div>
            </div>
            <Link
              href="/roadmap"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              View Standards →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">View:</label>
          <select
            value={selectedTrainee}
            onChange={(e) => setSelectedTrainee(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 font-medium focus:ring-2 focus:ring-[#E6017D]/20 focus:border-[#E6017D]"
          >
            <option value="all">All Trainees</option>
            {trainees.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Trainee Sections */}
        <div className="space-y-8">
          {filteredData.map((trainee) => (
            <div key={trainee.slug} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Trainee Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E6017D] flex items-center justify-center text-white font-bold">
                    {trainee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{trainee.name}</h2>
                    <p className="text-slate-400 text-sm">{trainee.weeks.length} weeks of data</p>
                  </div>
                </div>
                <Link
                  href={`/scorecard/${trainee.slug}`}
                  className="text-sm text-[#E6017D] hover:text-pink-400 transition-colors"
                >
                  View Scorecard →
                </Link>
              </div>

              {/* Weeks */}
              {trainee.weeks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No activity data recorded yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {trainee.weeks.map((week) => {
                    const weekKey = `${trainee.slug}-${week.weekNum}`;
                    const isExpanded = expandedWeeks[weekKey];

                    return (
                      <div key={week.weekNum}>
                        {/* Week Summary Row */}
                        <button
                          onClick={() => toggleWeekExpanded(weekKey)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-4">
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div>
                              <span className="font-semibold text-gray-900">
                                {weekConfig[week.weekNum]?.label || `Week ${week.weekNum}`}
                              </span>
                              <span className="text-gray-400 text-sm ml-2">{week.dateRange}</span>
                            </div>
                          </div>

                          {/* Week Totals */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className={getStatusClass(week.totals.calls, week.targets.calls)}>
                                {week.totals.calls}/{week.targets.calls}
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase">Calls</div>
                            </div>
                            <div className="text-center">
                              <div className={getStatusClass(week.totals.bookings, week.targets.bookings)}>
                                {week.totals.bookings}/{week.targets.bookings}
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase">Bookings</div>
                            </div>
                            <div className="text-center">
                              <div className={getStatusClass(week.totals.meetings, week.targets.meetings)}>
                                {week.totals.meetings}/{week.targets.meetings}
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase">Meetings</div>
                            </div>
                            <div className="text-center">
                              <div className={getStatusClass(week.totals.units, week.targets.units)}>
                                {week.totals.units}/{week.targets.units}
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase">Units</div>
                            </div>
                            <div className="text-center">
                              <div className={getStatusClass(week.totals.revenue, week.targets.revenue)}>
                                ${week.totals.revenue}/${week.targets.revenue}
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase">Revenue</div>
                            </div>
                          </div>
                        </button>

                        {/* Day-by-day breakdown */}
                        {isExpanded && (
                          <div className="bg-gray-50 px-6 py-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-gray-500 uppercase">
                                  <th className="text-left py-2 font-semibold">Day</th>
                                  <th className="text-center py-2 font-semibold">Calls</th>
                                  <th className="text-center py-2 font-semibold">Bookings</th>
                                  <th className="text-center py-2 font-semibold">Meetings</th>
                                  <th className="text-center py-2 font-semibold">Units</th>
                                  <th className="text-center py-2 font-semibold">Revenue</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {week.days.map((day) => {
                                  const dailyTarget = weeklyStandards[week.weekNum] || weeklyStandards[6];
                                  return (
                                    <tr key={day.date} className="hover:bg-white/50">
                                      <td className="py-2 font-medium text-gray-700">
                                        {getDayName(day.date)} {formatDateShort(day.date)}
                                      </td>
                                      <td className={`py-2 text-center ${getStatusClass(day.calls, dailyTarget.calls)}`}>
                                        {day.calls}
                                      </td>
                                      <td className={`py-2 text-center ${getStatusClass(day.bookings, dailyTarget.bookings)}`}>
                                        {day.bookings}
                                      </td>
                                      <td className={`py-2 text-center ${getStatusClass(day.meetings, dailyTarget.meetings)}`}>
                                        {day.meetings}
                                      </td>
                                      <td className={`py-2 text-center ${getStatusClass(day.units, dailyTarget.units)}`}>
                                        {day.units}
                                      </td>
                                      <td className={`py-2 text-center ${getStatusClass(day.revenue, dailyTarget.revenue)}`}>
                                        ${day.revenue}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 border-gray-300 font-semibold">
                                  <td className="py-2 text-gray-700">Week Total</td>
                                  <td className={`py-2 text-center ${getStatusClass(week.totals.calls, week.targets.calls)}`}>
                                    {week.totals.calls}
                                  </td>
                                  <td className={`py-2 text-center ${getStatusClass(week.totals.bookings, week.targets.bookings)}`}>
                                    {week.totals.bookings}
                                  </td>
                                  <td className={`py-2 text-center ${getStatusClass(week.totals.meetings, week.targets.meetings)}`}>
                                    {week.totals.meetings}
                                  </td>
                                  <td className={`py-2 text-center ${getStatusClass(week.totals.units, week.targets.units)}`}>
                                    {week.totals.units}
                                  </td>
                                  <td className={`py-2 text-center ${getStatusClass(week.totals.revenue, week.targets.revenue)}`}>
                                    ${week.totals.revenue}
                                  </td>
                                </tr>
                                <tr className="text-gray-400 text-xs">
                                  <td className="py-1">Target</td>
                                  <td className="py-1 text-center">{week.targets.calls}</td>
                                  <td className="py-1 text-center">{week.targets.bookings}</td>
                                  <td className="py-1 text-center">{week.targets.meetings}</td>
                                  <td className="py-1 text-center">{week.targets.units}</td>
                                  <td className="py-1 text-center">${week.targets.revenue}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function PerformanceDashboard() {
  return (
    <PasswordGate requireMaster>
      <PerformanceDashboardContent />
    </PasswordGate>
  );
}
