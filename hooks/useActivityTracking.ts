// hooks/useActivityTracking.ts

import { useState, useEffect, useCallback } from "react";
import { trainees } from "@/data/trainees";

interface DailyActivity {
  calls_made: number;
  calls: number;
  bookings: number;
  follow_up_call_scheduled: number;
  meetings: number;
  units: number;
  revenue: number;
}

interface WeeklyData {
  records: Array<{ date: string } & DailyActivity>;
  weeklyTotals: DailyActivity;
}

// Standards from the roadmap (daily targets)
// Based on 4 hours calling per day
// Per hour: 18 calls → 10 connects (55.6%) → 1.5 bookings (15%) → 0.75 attended (50%) → 0.375 deals (50%)
// Revenue: $350 per deal
export const weeklyStandards: Record<number, DailyActivity> = {
  0: { calls_made: 0, calls: 0, bookings: 0, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 }, // Training
  1: { calls_made: 125, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  2: { calls_made: 72, calls: 40, bookings: 6, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  3: { calls_made: 72, calls: 40, bookings: 6, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  4: { calls_made: 72, calls: 40, bookings: 6, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  5: { calls_made: 72, calls: 40, bookings: 6, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  6: { calls_made: 72, calls: 40, bookings: 6, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 }, // The Standard
  7: { calls_made: 72, calls: 40, bookings: 6, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  8: { calls_made: 72, calls: 40, bookings: 6, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
};

// Lead-gen trainees that participate in the ramp-up flow (badges + week
// overrides). Other trainees (buddies, senior staff) default to the current
// program week and don't get a ramp badge.
export const RAMP_UP_TRAINEE_SLUGS = [
  "cindy-rose-rondez-manrique",
  "krishna-patel",
  "riley-kerrison",
  "sydney-arnold",
];

// Compute a personal training week from a startDate ISO string.
// Convention: Week 1 = the Monday on or after the start date. (1-indexed —
// the trainee's first calendar week on the job is "Week 1".)
// Returns -1 if the start date is in the future.
export function getTraineeWeekForStartDate(startDateISO: string): number {
  const start = new Date(startDateISO + "T00:00:00Z");
  // Use Adelaide-local "today" so the rollover happens at the right local midnight.
  const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
  const today = new Date(todayISO + "T00:00:00Z");

  const startDow = start.getUTCDay(); // Sun=0, Mon=1, ..., Sat=6
  const daysUntilMonday = startDow === 1 ? 0 : (8 - startDow) % 7;
  const week1Monday = new Date(start);
  week1Monday.setUTCDate(week1Monday.getUTCDate() + daysUntilMonday);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((today.getTime() - week1Monday.getTime()) / msPerDay);
  if (diffDays < 0) return -1;
  return Math.floor(diffDays / 7) + 1;
}

// Look up a trainee's personal training week by slug (1-indexed, where their
// start week = Week 1). Returns null if the trainee isn't in the ramp-up flow
// or doesn't have a startDate on file. Display callers should clamp at 6
// ("The Standard") if they want a ramp-style badge.
export function getTraineeWeek(slug: string): number | null {
  if (!RAMP_UP_TRAINEE_SLUGS.includes(slug)) return null;
  const t = trainees.find((tr) => tr.slug === slug);
  if (!t || !t.startDate) return null;
  const wk = getTraineeWeekForStartDate(t.startDate);
  return wk < 0 ? null : wk;
}

// Per-trainee week number overrides for personal scorecard standards.
// Intentionally empty: dashboard booking targets stay flat at 7/day for all
// lead-gen trainees (via TRAINEES_WITH_TARGET in PerformanceSummary). Personal
// scorecard standards default to weeklyStandards[currentWeek] || weeklyStandards[6].
// (The Wk 0 daily-ramp logic in WEEK0_RAMP / WEEK0_TRAINEE_BOOKING_TARGETS is
// retained in code but no longer triggered, since no trainee maps to override===0.)
export const TRAINEE_WEEK_OVERRIDES: Record<string, number> = {};

// Sydney Week 0 ramp-up targets by day (0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri)
export const WEEK0_RAMP: Record<number, DailyActivity> = {
  0: { calls_made: 0, calls: 30, bookings: 3, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
  1: { calls_made: 0, calls: 40, bookings: 4, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
  2: { calls_made: 0, calls: 50, bookings: 5, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
  3: { calls_made: 0, calls: 60, bookings: 6, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
  4: { calls_made: 0, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
};

// Week start dates (Sundays before each Monday)
const weekStartDates: Record<number, string> = {
  0: "2026-02-15", // Training: Sun before Mon 16 Feb
  1: "2026-02-22", // Week 1: Sun before Mon 23 Feb
  2: "2026-03-01",
  3: "2026-03-08",
  4: "2026-03-15",
  5: "2026-03-22",
  6: "2026-03-29",
  7: "2026-04-05",
  8: "2026-04-12",
  9: "2026-04-19",  // Week 9:  Mon 20 Apr
  10: "2026-04-26", // Week 10: Mon 27 Apr
  11: "2026-05-03", // Week 11: Mon 4 May
  12: "2026-05-10", // Week 12: Mon 11 May
  13: "2026-05-17", // Week 13: Mon 18 May
  14: "2026-05-24", // Week 14: Mon 25 May
  15: "2026-05-31", // Week 15: Mon 1 Jun
  16: "2026-06-07", // Week 16: Mon 8 Jun
};

// Header label of the form "Week 18 (32% of year used, 68% remaining)".
// Uses the ISO week number (Mon-anchored, Thursday-of-the-week rule) and the
// fraction of the calendar year elapsed at Adelaide local midnight today.
export function getYearWeekLabel(): string {
  const adelaideISO = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
  const today = new Date(adelaideISO + "T00:00:00Z");

  // ISO week: shift to the Thursday of this week, then count weeks from Jan 1 of that year.
  const thursday = new Date(today);
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const isoYear = thursday.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const isoWeek = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  // Year progress: day-of-year over total days in the year.
  const calendarYear = today.getUTCFullYear();
  const isLeap = (calendarYear % 4 === 0 && calendarYear % 100 !== 0) || calendarYear % 400 === 0;
  const totalDays = isLeap ? 366 : 365;
  const calendarYearStart = new Date(Date.UTC(calendarYear, 0, 1));
  const dayOfYear = Math.floor((today.getTime() - calendarYearStart.getTime()) / 86400000) + 1;
  const usedPct = Math.round((dayOfYear / totalDays) * 100);
  const remainingPct = 100 - usedPct;

  return `Week ${isoWeek} (${usedPct}% of year used, ${remainingPct}% remaining)`;
}

// Get current week number based on Adelaide time
export function getCurrentWeekNumber(): number {
  const now = new Date();
  const adelaide = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Adelaide" }));
  
  for (let i = 16; i >= 0; i--) {
    const weekStart = new Date(weekStartDates[i]);
    if (adelaide >= weekStart) {
      return i;
    }
  }
  return 0;
}

// Get Adelaide date string
function getAdelaideDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
}

// Get week boundaries for a given week number
export function getWeekBoundaries(weekNum: number): { start: string; end: string } {
  const startDate = new Date(weekStartDates[weekNum]);
  startDate.setDate(startDate.getDate() + 1); // Monday
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 4); // Friday
  
  return {
    start: startDate.toISOString().split("T")[0],
    end: endDate.toISOString().split("T")[0],
  };
}

// Get day of week (0 = Monday, 4 = Friday)
export function getDayOfWeek(): number {
  const now = new Date();
  const adelaide = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Adelaide" }));
  const day = adelaide.getDay();
  // Convert: Sun=0 -> -1, Mon=1 -> 0, Tue=2 -> 1, etc.
  return day === 0 ? -1 : day - 1;
}

export function useActivityTracking(traineeSlug: string, traineeName: string) {
  const lastFetchDateRef = { current: getAdelaideDate() };
  const [todayActivity, setTodayActivity] = useState<DailyActivity>({
    calls_made: 0,
    calls: 0,
    bookings: 0,
    follow_up_call_scheduled: 0,
    meetings: 0,
    units: 0,
    revenue: 0,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);

  // Fetch today's activity
  const fetchTodayActivity = useCallback(async () => {
    try {
      const response = await fetch(`/api/activity?trainee_slug=${traineeSlug}`);
      const data = await response.json();
      if (data && !data.error) {
        lastFetchDateRef.current = getAdelaideDate();
        setTodayActivity({
          calls_made: data.calls_made || 0,
          calls: data.calls || 0,
          bookings: data.bookings || 0,
          follow_up_call_scheduled: data.follow_up_call_scheduled || 0,
          meetings: data.meetings || 0,
          units: data.units || 0,
          revenue: data.revenue || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching today's activity:", error);
    }
  }, [traineeSlug]);

  // Fetch weekly activity
  const fetchWeeklyActivity = useCallback(async (weekNum: number) => {
    try {
      const { start, end } = getWeekBoundaries(weekNum);
      const response = await fetch(
        `/api/activity?trainee_slug=${traineeSlug}&week_start=${start}&week_end=${end}`
      );
      const data = await response.json();
      if (data && !data.error) {
        setWeeklyData(data);
      }
    } catch (error) {
      console.error("Error fetching weekly activity:", error);
    }
  }, [traineeSlug]);

  // Initial load
  useEffect(() => {
    const week = getCurrentWeekNumber();
    setCurrentWeek(week);
    
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTodayActivity(), fetchWeeklyActivity(week)]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchTodayActivity, fetchWeeklyActivity]);

  // Save activity to Airtable
  const saveActivity = useCallback(
    async (activity: DailyActivity) => {
      setIsSaving(true);
      try {
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trainee_slug: traineeSlug,
            trainee_name: traineeName,
            ...activity,
          }),
        });
        // Refresh weekly data after save
        await fetchWeeklyActivity(currentWeek);
      } catch (error) {
        console.error("Error saving activity:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [traineeSlug, traineeName, currentWeek, fetchWeeklyActivity]
  );

  // Increment a metric (with day-change protection)
  const incrementMetric = useCallback(
    async (metric: keyof DailyActivity, amount: number = 1) => {
      // Check if the date has changed since we last fetched data
      const now = getAdelaideDate();
      if (now !== lastFetchDateRef.current) {
        // Day changed! Reset to zeros, then re-fetch fresh data
        const fresh: DailyActivity = { calls_made: 0, calls: 0, bookings: 0, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 };
        const newActivity = { ...fresh, [metric]: amount };
        setTodayActivity(newActivity);
        lastFetchDateRef.current = now;
        await saveActivity(newActivity);
        // Also refresh weekly data for the new day
        const week = getCurrentWeekNumber();
        setCurrentWeek(week);
        await fetchWeeklyActivity(week);
        return;
      }
      const newActivity = {
        ...todayActivity,
        [metric]: todayActivity[metric] + amount,
      };
      setTodayActivity(newActivity);
      await saveActivity(newActivity);
    },
    [todayActivity, saveActivity, fetchWeeklyActivity]
  );

  // Set a metric directly (for revenue input, with day-change protection)
  const setMetric = useCallback(
    async (metric: keyof DailyActivity, value: number) => {
      const now = getAdelaideDate();
      if (now !== lastFetchDateRef.current) {
        const fresh: DailyActivity = { calls_made: 0, calls: 0, bookings: 0, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 };
        const newActivity = { ...fresh, [metric]: value };
        setTodayActivity(newActivity);
        lastFetchDateRef.current = now;
        await saveActivity(newActivity);
        return;
      }
      const newActivity = {
        ...todayActivity,
        [metric]: value,
      };
      setTodayActivity(newActivity);
      await saveActivity(newActivity);
    },
    [todayActivity, saveActivity]
  );

  // Get daily standard for current week (respects per-trainee week overrides)
  const getDailyStandard = useCallback((): DailyActivity => {
    const eff = TRAINEE_WEEK_OVERRIDES[traineeSlug] !== undefined
      ? TRAINEE_WEEK_OVERRIDES[traineeSlug]
      : currentWeek;
    if (eff === 0 && traineeSlug in TRAINEE_WEEK_OVERRIDES) {
      const dayIdx = getDayOfWeek();
      const validDay = dayIdx >= 0 && dayIdx <= 4 ? dayIdx : 0;
      return WEEK0_RAMP[validDay];
    }
    return weeklyStandards[eff] || weeklyStandards[6];
  }, [currentWeek, traineeSlug]);

  // Get weekly standard (respects per-trainee week overrides)
  const getWeeklyStandard = useCallback((): DailyActivity => {
    const eff = TRAINEE_WEEK_OVERRIDES[traineeSlug] !== undefined
      ? TRAINEE_WEEK_OVERRIDES[traineeSlug]
      : currentWeek;
    if (eff === 0 && traineeSlug in TRAINEE_WEEK_OVERRIDES) {
      return Object.values(WEEK0_RAMP).reduce(
        (acc, d) => ({
          calls_made: acc.calls_made + d.calls_made,
          calls: acc.calls + d.calls,
          bookings: acc.bookings + d.bookings,
          follow_up_call_scheduled: 0,
          meetings: 0,
          units: 0,
          revenue: 0,
        }),
        { calls_made: 0, calls: 0, bookings: 0, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 }
      );
    }
    const daily = getDailyStandard();
    return {
      calls_made: daily.calls_made * 5,
      calls: daily.calls * 5,
      bookings: daily.bookings * 5,
      follow_up_call_scheduled: 0,
      meetings: daily.meetings * 5,
      units: daily.units * 5,
      revenue: daily.revenue * 5,
    };
  }, [getDailyStandard, currentWeek, traineeSlug]);

  return {
    todayActivity,
    weeklyData,
    isLoading,
    isSaving,
    currentWeek: TRAINEE_WEEK_OVERRIDES[traineeSlug] !== undefined
      ? TRAINEE_WEEK_OVERRIDES[traineeSlug]
      : currentWeek,
    incrementMetric,
    setMetric,
    getDailyStandard,
    getWeeklyStandard,
    refresh: () => {
      fetchTodayActivity();
      fetchWeeklyActivity(currentWeek);
    },
  };
}
