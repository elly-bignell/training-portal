// lib/funnel.ts

// ─── Benchmarks (per hour, based on top rep best day) ───
export const BENCHMARKS_PER_HOUR = {
  calls: 18,
  connects: 9,
  bookings: 2.5,
  attendance: 1.25,
  sales: 0.625,
} as const;

// ─── Conversion benchmarks ───
export const CONVERSION_BENCHMARKS = {
  connectRate: 0.5,      // Connects ÷ Calls = 50%
  bookingRate: 0.2778,   // Bookings ÷ Connects = 27.78%
  attendanceRate: 0.5,   // Attendance ÷ Bookings = 50%
  closeRate: 0.5,        // Sales ÷ Attendance = 50%
  callToSaleRate: 0.0347, // Sales ÷ Calls = 3.47%
} as const;

// ─── Band thresholds ───
export const BAND_THRESHOLDS = {
  elite: 1.1,    // >= 110% of benchmark
  onTarget: 0.9, // >= 90% of benchmark
} as const;

// ─── Types ───
export type Band = "elite" | "onTarget" | "under";

export interface FunnelStage {
  key: string;
  label: string;
  emoji: string;
  actual: number;
  target: number;
  band: Band;
  percentOfTarget: number;
}

export interface ConversionStep {
  key: string;
  label: string;
  tooltip: string;
  actual: number | null;
  benchmark: number;
  band: Band;
}

export interface FunnelData {
  calls: number;
  connects: number;
  bookings: number;
  attendance: number;
  sales: number;
}

export interface ProjectedResults {
  calls: number;
  connects: number;
  bookings: number;
  attendance: number;
  sales: number;
}

// ─── Target calculations ───
export function calculateTargets(hoursWorked: number): FunnelData {
  return {
    calls: Math.round(BENCHMARKS_PER_HOUR.calls * hoursWorked * 10) / 10,
    connects: Math.round(BENCHMARKS_PER_HOUR.connects * hoursWorked * 10) / 10,
    bookings: Math.round(BENCHMARKS_PER_HOUR.bookings * hoursWorked * 10) / 10,
    attendance: Math.round(BENCHMARKS_PER_HOUR.attendance * hoursWorked * 10) / 10,
    sales: Math.round(BENCHMARKS_PER_HOUR.sales * hoursWorked * 10) / 10,
  };
}

// ─── Band classification ───
export function classifyBand(actual: number, target: number): Band {
  if (target <= 0) return "onTarget"; // neutral if no target yet
  const ratio = actual / target;
  if (ratio >= BAND_THRESHOLDS.elite) return "elite";
  if (ratio >= BAND_THRESHOLDS.onTarget) return "onTarget";
  return "under";
}

// ─── Conversion rate calculation (safe divide) ───
export function safeConversionRate(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return numerator / denominator;
}

// ─── Classify conversion band ───
export function classifyConversionBand(actual: number | null, benchmark: number): Band {
  if (actual === null) return "onTarget"; // neutral if N/A
  const ratio = actual / benchmark;
  if (ratio >= BAND_THRESHOLDS.elite) return "elite";
  if (ratio >= BAND_THRESHOLDS.onTarget) return "onTarget";
  return "under";
}

// ─── Build funnel stages ───
export function buildFunnelStages(actuals: FunnelData, targets: FunnelData): FunnelStage[] {
  const stages: { key: keyof FunnelData; label: string; emoji: string }[] = [
    { key: "calls", label: "Calls", emoji: "📞" },
    { key: "connects", label: "Connects", emoji: "🔗" },
    { key: "bookings", label: "Bookings", emoji: "📅" },
    { key: "attendance", label: "Attendance", emoji: "🤝" },
    { key: "sales", label: "Sales", emoji: "💰" },
  ];

  return stages.map(({ key, label, emoji }) => {
    const actual = actuals[key];
    const target = targets[key];
    const band = classifyBand(actual, target);
    const percentOfTarget = target > 0 ? (actual / target) * 100 : 0;
    return { key, label, emoji, actual, target, band, percentOfTarget };
  });
}

// ─── Build conversion steps ───
export function buildConversionSteps(actuals: FunnelData): ConversionStep[] {
  return [
    {
      key: "connectRate",
      label: "Connect Rate",
      tooltip: "Connects ÷ Calls",
      actual: safeConversionRate(actuals.connects, actuals.calls),
      benchmark: CONVERSION_BENCHMARKS.connectRate,
      band: classifyConversionBand(
        safeConversionRate(actuals.connects, actuals.calls),
        CONVERSION_BENCHMARKS.connectRate
      ),
    },
    {
      key: "bookingRate",
      label: "Booking Rate",
      tooltip: "Bookings ÷ Connects",
      actual: safeConversionRate(actuals.bookings, actuals.connects),
      benchmark: CONVERSION_BENCHMARKS.bookingRate,
      band: classifyConversionBand(
        safeConversionRate(actuals.bookings, actuals.connects),
        CONVERSION_BENCHMARKS.bookingRate
      ),
    },
    {
      key: "attendanceRate",
      label: "Attendance Rate",
      tooltip: "Attendance ÷ Bookings",
      actual: safeConversionRate(actuals.attendance, actuals.bookings),
      benchmark: CONVERSION_BENCHMARKS.attendanceRate,
      band: classifyConversionBand(
        safeConversionRate(actuals.attendance, actuals.bookings),
        CONVERSION_BENCHMARKS.attendanceRate
      ),
    },
    {
      key: "closeRate",
      label: "Close Rate",
      tooltip: "Sales ÷ Attendance",
      actual: safeConversionRate(actuals.sales, actuals.attendance),
      benchmark: CONVERSION_BENCHMARKS.closeRate,
      band: classifyConversionBand(
        safeConversionRate(actuals.sales, actuals.attendance),
        CONVERSION_BENCHMARKS.closeRate
      ),
    },
  ];
}

// ─── Detect biggest bottleneck ───
export function detectBottleneck(actuals: FunnelData): { label: string; ratio: number } | null {
  const steps = buildConversionSteps(actuals);
  let worst: { label: string; ratio: number } | null = null;

  for (const step of steps) {
    if (step.actual === null) continue;
    const ratio = step.actual / step.benchmark;
    if (worst === null || ratio < worst.ratio) {
      worst = { label: step.label, ratio };
    }
  }

  return worst;
}

// ─── Project end-of-day results ───
export function projectEndOfDay(actuals: FunnelData, hoursWorked: number, totalHoursInDay: number = 8): ProjectedResults {
  if (hoursWorked <= 0) {
    return { calls: 0, connects: 0, bookings: 0, attendance: 0, sales: 0 };
  }
  const multiplier = totalHoursInDay / hoursWorked;
  return {
    calls: Math.round(actuals.calls * multiplier),
    connects: Math.round(actuals.connects * multiplier),
    bookings: Math.round(actuals.bookings * multiplier * 10) / 10,
    attendance: Math.round(actuals.attendance * multiplier * 10) / 10,
    sales: Math.round(actuals.sales * multiplier * 10) / 10,
  };
}

// ─── Overall band (based on sales pace) ───
export function overallBand(actuals: FunnelData, targets: FunnelData): Band {
  return classifyBand(actuals.sales, targets.sales);
}

// ─── Band display helpers ───
export function bandColor(band: Band): string {
  switch (band) {
    case "elite": return "text-emerald-600";
    case "onTarget": return "text-amber-500";
    case "under": return "text-red-500";
  }
}

export function bandBg(band: Band): string {
  switch (band) {
    case "elite": return "bg-emerald-500";
    case "onTarget": return "bg-amber-400";
    case "under": return "bg-red-500";
  }
}

export function bandBgLight(band: Band): string {
  switch (band) {
    case "elite": return "bg-emerald-50 border-emerald-200";
    case "onTarget": return "bg-amber-50 border-amber-200";
    case "under": return "bg-red-50 border-red-200";
  }
}

export function bandLabel(band: Band): string {
  switch (band) {
    case "elite": return "Elite";
    case "onTarget": return "On Target";
    case "under": return "Under";
  }
}

export function bandEmoji(band: Band): string {
  switch (band) {
    case "elite": return "🟢";
    case "onTarget": return "🟡";
    case "under": return "🔴";
  }
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}
