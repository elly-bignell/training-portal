// lib/projections-config.ts

// ─── Default Ratios (per hour at full proficiency) ───
export const DEFAULT_RATIOS = {
  callsPerHour: 18,
  connectsPerHour: 10,
  bookingsPerHour: 1.5,
  attendanceRate: 0.5,   // 50% of bookings attend
  closeRate: 0.5,        // 50% of attended close
  dealValue: 400,        // $ per deal (monthly recurring)
  phoneHoursPerDay: 3.5, // default daily calling hours
};

// ─── 8-Week Ramp Schedule ───
// Percentage of full standard output per week
export const DEFAULT_RAMP = [
  { week: 1, pct: 50, label: "Buddy system" },
  { week: 2, pct: 50, label: "Buddy system" },
  { week: 3, pct: 50, label: "Buddy system" },
  { week: 4, pct: 50, label: "Buddy system" },
  { week: 5, pct: 50, label: "Leading meetings" },
  { week: 6, pct: 50, label: "Leading meetings" },
  { week: 7, pct: 75, label: "Flying solo" },
  { week: 8, pct: 100, label: "Full standard" },
];

// ─── Helper: Get ramp percentage for a given week number ───
export function getRampPct(weekNumber: number, ramp: typeof DEFAULT_RAMP): number {
  if (weekNumber <= 0) return 0;
  if (weekNumber > ramp.length) return 100;
  return ramp[weekNumber - 1].pct;
}

// ─── Helper: Calculate daily revenue at full proficiency ───
export function calcFullDailyRevenue(ratios: typeof DEFAULT_RATIOS): number {
  const dailyBookings = ratios.phoneHoursPerDay * ratios.bookingsPerHour;
  const dailyAttended = dailyBookings * ratios.attendanceRate;
  const dailyDeals = dailyAttended * ratios.closeRate;
  return dailyDeals * ratios.dealValue;
}

// ─── Helper: Calculate monthly revenue for a person at a given ramp % ───
export function calcMonthlyRevenue(
  ratios: typeof DEFAULT_RATIOS,
  rampPct: number,
  workingDays: number = 22
): number {
  return calcFullDailyRevenue(ratios) * (rampPct / 100) * workingDays;
}
