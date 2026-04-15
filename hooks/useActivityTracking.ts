// hooks/useActivityTracking.ts

import { useState, useEffect, useCallback } from "react";

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
  1: { calls_made: 120, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  2: { calls_made: 120, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  3: { calls_made: 120, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  4: { calls_made: 120, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  5: { calls_made: 120, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  6: { calls_made: 120, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  7: { calls_made: 120, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
  8: { calls_made: 120, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 3, units: 1.5, revenue: 525 },
};

// Per-trainee week number overrides (slug → effective week for standards/display)
export const TRAINEE_WEEK_OVERRIDES: Record<string, number> = {
  "sydney-arnold": 1, // Sydney is in Week 1
  "riley-kerrison": 0,  // Riley is in Week 0 (Training Week)
};

// Sydney Week 0 ramp-up targets by day (0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri)
export const WEEK0_RAMP: Record<number, DailyActivity> = {
  0: { calls_made: 0, calls: 30, bookings: 3, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
  1: { calls_made: 0, calls: 40, bookings: 4, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
  2: { calls_made: 0, calls: 50, bookings: 5, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
  3: { calls_made: 0, calls: 60, bookings: 6, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
  4: { calls_made: 0, calls: 70, bookings: 7, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 },
};

// Week 0 started Mon 16 Feb 2026 — all weeks computed dynamically from this base
const WEEK0_MONDAY = new Date(Date.UTC(2026, 1, 16)); // Feb 16 2026

// Get current week number based on Adelaide time (0 = week of Feb 16, unbounded)
export function getCurrentWeekNumber(): number {
  const now = new Date();
  const adelaideStr = now.toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
  const [y, m, d] = adelaideStr.split("-").map(Number);
  const adelaideMidnight = new Date(Date.UTC(y, m - 1, d));
  const diffMs = adelaideMidnight.getTime() - WEEK0_MONDAY.getTime();
  return Math.max(0, Math.floor(diffMs / (7 * 86400000)));
}

// Get Adelaide date string
function getAdelaideDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Adelaide" });
}

// Get week boundaries for a given week number (dynamic)
export function getWeekBoundaries(weekNum: number): { start: string; end: string } {
  const monday = new Date(WEEK0_MONDAY.getTime() + weekNum * 7 * 86400000);
  const friday = new Date(monday.getTime() + 4 * 86400000);
  return {
    start: monday.toISOString().split("T")[0],
    end: friday.toISOString().split("T")[0],
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
