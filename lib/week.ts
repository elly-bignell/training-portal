// lib/week.ts
//
// Week utilities for the Daily Checklist.
// Business rule: a checklist week starts on Monday and runs Mon–Fri.
// The week "resets" at Sunday 12:00am Adelaide time — i.e. on Sunday
// we already show the NEW (upcoming) Monday as the week start, so a
// fresh blank checklist appears before Monday morning.

const TZ = "Australia/Adelaide";

// Format a Date as "YYYY-MM-DD" in Adelaide local time.
function toLocalISODate(d: Date): string {
  return d.toLocaleDateString("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Parse "YYYY-MM-DD" as a Date at Adelaide midnight (approx; we use UTC
// and add no time component — all comparisons stay in date-only land).
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// Get the Monday of the given ISO date (Adelaide week).
// If `iso` is itself a Sunday, returns the FOLLOWING Monday (so Sunday
// displays the next upcoming week).
export function mondayOf(iso: string): string {
  const d = parseISODate(iso);
  const dow = d.getUTCDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  let delta: number;
  if (dow === 0) {
    delta = 1;                // Sunday → next Monday
  } else {
    delta = 1 - dow;          // Mon → 0, Tue → -1, ... Sat → -5
  }
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// Monday ISO string for the current week (Adelaide local), using the
// Sunday-rollover rule.
export function getCurrentWeekStart(): string {
  return mondayOf(toLocalISODate(new Date()));
}

// Return Monday ISO strings for the last N weeks INCLUDING this one,
// newest first. Useful for the admin week-picker dropdown.
export function recentWeekStarts(count: number): string[] {
  const out: string[] = [];
  const cur = parseISODate(getCurrentWeekStart());
  for (let i = 0; i < count; i++) {
    const iso = cur.toISOString().slice(0, 10);
    out.push(iso);
    cur.setUTCDate(cur.getUTCDate() - 7);
  }
  return out;
}

// Format a Monday ISO as a friendly label like "Mon 21 Apr – Fri 25 Apr 2026".
export function formatWeekRange(mondayISO: string): string {
  const mon = parseISODate(mondayISO);
  const fri = new Date(mon);
  fri.setUTCDate(fri.getUTCDate() + 4);
  const month = (d: Date) =>
    d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
  const day = (d: Date) => d.getUTCDate();
  const year = fri.getUTCFullYear();
  return `Mon ${day(mon)} ${month(mon)} – Fri ${day(fri)} ${month(fri)} ${year}`;
}

// Date label for a specific day column: "Mon 21 Apr".
export function dayLabel(mondayISO: string, offsetDays: number): string {
  const d = parseISODate(mondayISO);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
