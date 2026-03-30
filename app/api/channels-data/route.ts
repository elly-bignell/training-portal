import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE = 'DailyActivity';

const LEAD_GEN_STAFF = [
  { slug: 'cindy-rose-rondez-manfre', name: 'Cindy',   avatar: 'C', color: '#7c3aed', startDate: '2026-02-23' },
  { slug: 'krishna-patel',            name: 'Krishna',  avatar: 'K', color: '#0891b2', startDate: '2026-02-23' },
  { slug: 'sydney-arnold',            name: 'Sydney',   avatar: 'S', color: '#059669', startDate: '2026-03-23' },
  { slug: 'riley-kerrison',           name: 'Riley',    avatar: 'R', color: '#d97706', startDate: '2026-03-30' },
];

// How many full weeks since a Monday start date
function weeksOnBoard(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(days / 7);
}

// ISO week key e.g. "2026-W09"
function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getCurrentWeekKey(): string {
  return getWeekKey(new Date().toISOString().slice(0, 10));
}

// Convert ISO week key to a human "W{n}" label relative to a staff start date
function weekLabel(isoWeekKey: string, startDate: string): string {
  // Find the Monday of the ISO week
  const [year, w] = isoWeekKey.split('-W').map(Number);
  const jan4 = new Date(year, 0, 4); // Jan 4 is always in week 1
  const weekOneMonday = new Date(jan4);
  weekOneMonday.setDate(jan4.getDate() - ((jan4.getDay() || 7) - 1));
  const weekMonday = new Date(weekOneMonday);
  weekMonday.setDate(weekOneMonday.getDate() + (w - 1) * 7);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  weekMonday.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((weekMonday.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1; // W1 = first week
  return `W${weekNum}`;
}

async function fetchAllRecords() {
  let records: any[] = [];
  let offset: string | undefined;
  do {
    const params = new URLSearchParams();
    ['trainee_slug', 'date', 'calls', 'bookings', 'meetings'].forEach(f =>
      params.append('fields[]', f)
    );
    params.set('pageSize', '100');
    if (offset) params.set('offset', offset);

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?${params}`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    const data = await res.json();
    records = records.concat(data.records || []);
    offset = data.offset;
  } while (offset);
  return records;
}

const round1 = (n: number | null) => n !== null ? Math.round(n * 10) / 10 : null;

export async function GET() {
  try {
    const records = await fetchAllRecords();
    const slugSet = new Set(LEAD_GEN_STAFF.map(s => s.slug));
    const currentWeek = getCurrentWeekKey();

    const bySlug: Record<string, any[]> = {};
    for (const rec of records) {
      const slug = rec.fields.trainee_slug;
      if (!slug || !slugSet.has(slug)) continue;
      if (!bySlug[slug]) bySlug[slug] = [];
      bySlug[slug].push(rec.fields);
    }

    const result = LEAD_GEN_STAFF.map(staff => {
      const rows = bySlug[staff.slug] || [];

      // ── Channel 1: calls → bookings ──────────────────────────────────
      const c1Days = rows
        .filter(r => (r.calls ?? 0) > 0)
        .map(r => ({
          date:     r.date as string,
          weekKey:  getWeekKey(r.date),
          calls:    r.calls    as number,
          bookings: (r.bookings ?? 0) as number,
          rate:     (r.bookings ?? 0) / r.calls,
        }));

      const c1Calls = c1Days.reduce((s, d) => s + d.calls,    0);
      const c1Books = c1Days.reduce((s, d) => s + d.bookings, 0);

      // Best day — find the day with the highest rate
      let c1BestDayRate: number | null = null;
      let c1BestDayLabel: string | null = null;
      if (c1Days.length > 0) {
        const best = c1Days.reduce((a, b) => b.rate > a.rate ? b : a);
        c1BestDayRate  = round1(best.rate * 100);
        c1BestDayLabel = weekLabel(best.weekKey, staff.startDate);
      }

      // Weekly aggregates
      const c1ByWeek: Record<string, { calls: number; bookings: number }> = {};
      for (const d of c1Days) {
        if (!c1ByWeek[d.weekKey]) c1ByWeek[d.weekKey] = { calls: 0, bookings: 0 };
        c1ByWeek[d.weekKey].calls    += d.calls;
        c1ByWeek[d.weekKey].bookings += d.bookings;
      }

      // Best week
      let c1BestWeekRate: number | null = null;
      let c1BestWeekLabel: string | null = null;
      const c1WeekEntries = Object.entries(c1ByWeek).filter(([, w]) => w.calls > 0);
      if (c1WeekEntries.length > 0) {
        const best = c1WeekEntries.reduce((a, b) =>
          (b[1].bookings / b[1].calls) > (a[1].bookings / a[1].calls) ? b : a
        );
        c1BestWeekRate  = round1((best[1].bookings / best[1].calls) * 100);
        c1BestWeekLabel = weekLabel(best[0], staff.startDate);
      }

      // Current week
      const c1CW = c1ByWeek[currentWeek];
      const c1CurrentWeek = c1CW?.calls > 0 ? round1((c1CW.bookings / c1CW.calls) * 100) : null;
      const c1CurrentWeekLabel = c1CW ? weekLabel(currentWeek, staff.startDate) : null;

      const ch1 = {
        avg:              c1Calls > 0 ? round1((c1Books / c1Calls) * 100) : null,
        bestDay:          c1BestDayRate,
        bestDayWeek:      c1BestDayLabel,
        bestWeek:         c1BestWeekRate,
        bestWeekLabel:    c1BestWeekLabel,
        currentWeek:      c1CurrentWeek,
        currentWeekLabel: c1CurrentWeekLabel,
      };

      // ── Channel 2: bookings → meetings ───────────────────────────────
      const c2Days = rows
        .filter(r => (r.bookings ?? 0) > 0)
        .map(r => ({
          date:     r.date as string,
          weekKey:  getWeekKey(r.date),
          bookings: r.bookings as number,
          meetings: (r.meetings ?? 0) as number,
          rate:     (r.meetings ?? 0) / r.bookings,
        }));

      const c2Books = c2Days.reduce((s, d) => s + d.bookings, 0);
      const c2Meets = c2Days.reduce((s, d) => s + d.meetings, 0);

      let c2BestDayRate: number | null = null;
      let c2BestDayLabel: string | null = null;
      if (c2Days.length > 0) {
        const best = c2Days.reduce((a, b) => b.rate > a.rate ? b : a);
        c2BestDayRate  = round1(best.rate * 100);
        c2BestDayLabel = weekLabel(best.weekKey, staff.startDate);
      }

      const c2ByWeek: Record<string, { bookings: number; meetings: number }> = {};
      for (const d of c2Days) {
        if (!c2ByWeek[d.weekKey]) c2ByWeek[d.weekKey] = { bookings: 0, meetings: 0 };
        c2ByWeek[d.weekKey].bookings += d.bookings;
        c2ByWeek[d.weekKey].meetings += d.meetings;
      }

      let c2BestWeekRate: number | null = null;
      let c2BestWeekLabel: string | null = null;
      const c2WeekEntries = Object.entries(c2ByWeek).filter(([, w]) => w.bookings > 0);
      if (c2WeekEntries.length > 0) {
        const best = c2WeekEntries.reduce((a, b) =>
          (b[1].meetings / b[1].bookings) > (a[1].meetings / a[1].bookings) ? b : a
        );
        c2BestWeekRate  = round1((best[1].meetings / best[1].bookings) * 100);
        c2BestWeekLabel = weekLabel(best[0], staff.startDate);
      }

      const c2CW = c2ByWeek[currentWeek];
      const c2CurrentWeek = c2CW?.bookings > 0 ? round1((c2CW.meetings / c2CW.bookings) * 100) : null;
      const c2CurrentWeekLabel = c2CW ? weekLabel(currentWeek, staff.startDate) : null;

      const ch2 = {
        avg:              c2Books > 0 ? round1((c2Meets / c2Books) * 100) : null,
        bestDay:          c2BestDayRate,
        bestDayWeek:      c2BestDayLabel,
        bestWeek:         c2BestWeekRate,
        bestWeekLabel:    c2BestWeekLabel,
        currentWeek:      c2CurrentWeek,
        currentWeekLabel: c2CurrentWeekLabel,
      };

      return {
        name:         staff.name,
        avatar:       staff.avatar,
        color:        staff.color,
        startDate:    staff.startDate,
        weeksOnBoard: weeksOnBoard(staff.startDate),
        channels:     [ch1, ch2],
      };
    });

    return NextResponse.json({ staff: result });
  } catch (err: any) {
    console.error('channels-data error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
