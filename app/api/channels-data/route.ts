import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE = 'DailyActivity';

const LEAD_GEN_STAFF = [
  { slug: 'cindy-rose-rondez-manfre', name: 'Cindy',  avatar: 'C', color: '#7c3aed', startDate: '2026-02-23' },
  { slug: 'krishna-patel',            name: 'Krishna', avatar: 'K', color: '#0891b2', startDate: '2026-02-23' },
  { slug: 'sydney-arnold',            name: 'Sydney',  avatar: 'S', color: '#059669', startDate: '2026-03-23' },
  { slug: 'riley-kerrison',           name: 'Riley',   avatar: 'R', color: '#d97706', startDate: '2026-03-30' },
];

function weeksOnBoard(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  // Zero out time so we measure full days only
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(days / 7);
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

const round1 = (n: number | null) => n !== null ? Math.round(n * 10) / 10 : null;

export async function GET() {
  try {
    const records = await fetchAllRecords();
    const slugSet = new Set(LEAD_GEN_STAFF.map(s => s.slug));
    const currentWeek = getCurrentWeekKey();

    // Group by slug
    const bySlug: Record<string, any[]> = {};
    for (const rec of records) {
      const slug = rec.fields.trainee_slug;
      if (!slug || !slugSet.has(slug)) continue;
      if (!bySlug[slug]) bySlug[slug] = [];
      bySlug[slug].push(rec.fields);
    }

    const result = LEAD_GEN_STAFF.map(staff => {
      const rows = bySlug[staff.slug] || [];
      const weeks = weeksOnBoard(staff.startDate);

      // ── Channel 1: calls → bookings ──────────────────────────────────
      const c1 = rows.filter(r => (r.calls ?? 0) > 0).map(r => ({
        week:     getWeekKey(r.date),
        calls:    r.calls    as number,
        bookings: r.bookings as number ?? 0,
        rate:     (r.bookings ?? 0) / r.calls,
      }));

      const c1Calls = c1.reduce((s, d) => s + d.calls,    0);
      const c1Books = c1.reduce((s, d) => s + d.bookings, 0);

      const c1ByWeek: Record<string, { calls: number; bookings: number }> = {};
      for (const d of c1) {
        if (!c1ByWeek[d.week]) c1ByWeek[d.week] = { calls: 0, bookings: 0 };
        c1ByWeek[d.week].calls    += d.calls;
        c1ByWeek[d.week].bookings += d.bookings;
      }
      const c1WeekRates = Object.values(c1ByWeek).filter(w => w.calls > 0).map(w => w.bookings / w.calls);

      const ch1 = {
        avg:         c1Calls > 0 ? round1((c1Books / c1Calls) * 100) : null,
        bestDay:     c1.length > 0 ? round1(Math.max(...c1.map(d => d.rate)) * 100) : null,
        bestWeek:    c1WeekRates.length > 0 ? round1(Math.max(...c1WeekRates) * 100) : null,
        currentWeek: c1ByWeek[currentWeek]?.calls > 0
          ? round1((c1ByWeek[currentWeek].bookings / c1ByWeek[currentWeek].calls) * 100)
          : null,
      };

      // ── Channel 2: bookings → meetings ───────────────────────────────
      const c2 = rows.filter(r => (r.bookings ?? 0) > 0).map(r => ({
        week:     getWeekKey(r.date),
        bookings: r.bookings as number,
        meetings: r.meetings as number ?? 0,
        rate:     (r.meetings ?? 0) / r.bookings,
      }));

      const c2Books = c2.reduce((s, d) => s + d.bookings, 0);
      const c2Meets = c2.reduce((s, d) => s + d.meetings, 0);

      const c2ByWeek: Record<string, { bookings: number; meetings: number }> = {};
      for (const d of c2) {
        if (!c2ByWeek[d.week]) c2ByWeek[d.week] = { bookings: 0, meetings: 0 };
        c2ByWeek[d.week].bookings += d.bookings;
        c2ByWeek[d.week].meetings += d.meetings;
      }
      const c2WeekRates = Object.values(c2ByWeek).filter(w => w.bookings > 0).map(w => w.meetings / w.bookings);

      const ch2 = {
        avg:         c2Books > 0 ? round1((c2Meets / c2Books) * 100) : null,
        bestDay:     c2.length > 0 ? round1(Math.max(...c2.map(d => d.rate)) * 100) : null,
        bestWeek:    c2WeekRates.length > 0 ? round1(Math.max(...c2WeekRates) * 100) : null,
        currentWeek: c2ByWeek[currentWeek]?.bookings > 0
          ? round1((c2ByWeek[currentWeek].meetings / c2ByWeek[currentWeek].bookings) * 100)
          : null,
      };

      return {
        name:         staff.name,
        avatar:       staff.avatar,
        color:        staff.color,
        startDate:    staff.startDate,
        weeksOnBoard: weeks,
        channels:     [ch1, ch2],
      };
    });

    return NextResponse.json({ staff: result });
  } catch (err: any) {
    console.error('channels-data error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
