// hooks/useActivityTracking.ts

import { useState, useEffect, useCallback } from "react";

interface DailyActivity {
  calls_made: number;
  calls: number;
  bookings: number;
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
  0: { calls_made: 0, calls: 0, bookings: 0, meetings: 0, units: 0, revenue: 0 }, // Training
  1: { calls_made: 72, calls: 40, bookings: 6, meetings: 3, units: 1.5, revenue: 525 },
  2: { calls_made: 72, calls: 40, bookings: 6, meetings: 3, units: 1.5, revenue: 525 },
  3: { calls_made: 72, calls: 40, bookings: 6, meetings: 3, units: 1.5, revenue: 525 },
  4: { calls_made: 72, calls: 40, bookings: 6, meetings: 3, units: 1.5, revenue: 525 },
  5: { calls_made: 72, calls: 40, bookings: 6, meetings: 3, units: 1.5, revenue: 525 },
  6: { calls_made: 72, calls: 40, bookings: 6, meetings: 3, units: 1.5, revenue: 525 }, // The Standard
  7: { calls_made: 72, calls: 40, bookings: 6, meetings: 3, units: 1.5, revenue: 525 },
  8: { calls_made: 72, calls: 40, bookings: 6, meetings: 3, units: 1.5, revenue: 525 },
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
};

// Get current week number based on Adelaide time
export function getCurrentWeekNumber(): number {
  const now = new Date();
  const adelaide = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Adelaide" }));
  
  for (let i = 8; i >= 0; i--) {
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
        const fresh: DailyActivity = { calls_made: 0, calls: 0, bookings: 0, meetings: 0, units: 0, revenue: 0 };
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
        const fresh: DailyActivity = { calls_made: 0, calls: 0, bookings: 0, meetings: 0, units: 0, revenue: 0 };
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

  // Get daily standard for current week
  const getDailyStandard = useCallback((): DailyActivity => {
    return weeklyStandards[currentWeek] || weeklyStandards[6];
  }, [currentWeek]);

  // Get weekly standard (daily * 5)
  const getWeeklyStandard = useCallback((): DailyActivity => {
    const daily = getDailyStandard();
    return {
      calls_made: daily.calls_made * 5,
      calls: daily.calls * 5,
      bookings: daily.bookings * 5,
      meetings: daily.meetings * 5,
      units: daily.units * 5,
      revenue: daily.revenue * 5,
    };
  }, [getDailyStandard]);

  return {
    todayActivity,
    weeklyData,
    isLoading,
    isSaving,
    currentWeek,
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
