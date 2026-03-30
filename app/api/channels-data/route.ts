import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE = 'DailyActivity';

// Lead gen slugs only
const LEAD_GEN_STAFF = [
  { slug: 'cindy-rose-rondez-manfre', name: 'Cindy',  avatar: 'C', color: '#7c3aed' },
  { slug: 'krishna-patel',            name: 'Krishna', avatar: 'K', color: '#0891b2' },
  { slug: 'sydney-arnold',            name: 'Sydney',  avatar: 'S', color: '#059669' },
  { slug: 'riley-kerrison',           name: 'Riley',   avatar: 'R', color: '#d97706' },
];

async function fetchAllRecords() {
  let records: any[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams({
      'fields[]': ['trainee_slug', 'trainee_name', 'date', 'calls', 'bookings', 'meetings'],
      pageSize: '100',
    } as any);
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

// Get ISO week string e.g. "2026-W13"
function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay() || 7; // Mon=1 Sun=7
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getCurrentWeekKey(): string {
  return getWeekKey(new Date().toISOString().slice(0, 10));
}

export async function GET() {
  try {
    const records = await fetchAllRecords();

    // Get slugs we care about
    const slugSet = new Set(LEAD_GEN_STAFF.map(s => s.slug));

    // Group records by slug
    const bySlug: Record<string, any[]> = {};
    for (const rec of records) {
      const slug = rec.fields.trainee_slug;
      if (!slug || !slugSet.has(slug)) continue;
      if (!bySlug[slug]) bySlug[slug] = [];
      bySlug[slug].push(rec.fields);
    }

    const currentWeek = getCurrentWeekKey();

    const result = LEAD_GEN_STAFF.map(staff => {
      const rows = bySlug[staff.slug] || [];

      // Sort by date ascending
      rows.sort((a, b) => a.date.localeCompare(b.date));

      const firstDate = rows.length > 0 ? new Date(rows[0].date) : new Date();
      const today = new Date();
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeksOnBoard = Math.floor((today.getTime() - firstDate.getTime()) / msPerWeek);

      // ── Channel 1: Call → Booking (bookings / calls) ─────────────────
      const ch1Days = rows.filter(r => (r.calls || 0) > 0).map(r => ({
        date: r.date,
        week: getWeekKey(r.date),
        calls: r.calls || 0,
        bookings: r.bookings || 0,
        rate: (r.bookings || 0) / (r.calls || 0),
      }));

      // Overall avg
      const ch1TotalCalls = ch1Days.reduce((s, d) => s + d.calls, 0);
      const ch1TotalBooks = ch1Days.reduce((s, d) => s + d.bookings, 0);
      const ch1Avg = ch1TotalCalls > 0 ? (ch1TotalBooks / ch1TotalCalls) * 100 : null;

      // Best day
      const ch1BestDay = ch1Days.length > 0
        ? Math.max(...ch1Days.map(d => d.rate)) * 100
        : null;

      // Per-week aggregates
      const ch1ByWeek: Record<string, { calls: number; bookings: number }> = {};
      for (const d of ch1Days) {
        if (!ch1ByWeek[d.week]) ch1ByWeek[d.week] = { calls: 0, bookings: 0 };
        ch1ByWeek[d.week].calls += d.calls;
        ch1ByWeek[d.week].bookings += d.bookings;
      }
      const ch1WeekRates = Object.values(ch1ByWeek)
        .filter(w => w.calls > 0)
        .map(w => w.bookings / w.calls);
      const ch1BestWeek = ch1WeekRates.length > 0 ? Math.max(...ch1WeekRates) * 100 : null;
      const ch1CurrentWeek = ch1ByWeek[currentWeek]
        ? (ch1ByWeek[currentWeek].bookings / ch1ByWeek[currentWeek].calls) * 100
        : null;

      // ── Channel 2: Booked → Attended (meetings / bookings) ───────────
      const ch2Days = rows.filter(r => (r.bookings || 0) > 0).map(r => ({
        date: r.date,
        week: getWeekKey(r.date),
        bookings: r.bookings || 0,
        meetings: r.meetings || 0,
        rate: (r.meetings || 0) / (r.bookings || 0),
      }));

      const ch2TotalBooks = ch2Days.reduce((s, d) => s + d.bookings, 0);
      const ch2TotalMeets = ch2Days.reduce((s, d) => s + d.meetings, 0);
      const ch2Avg = ch2TotalBooks > 0 ? (ch2TotalMeets / ch2TotalBooks) * 100 : null;

      const ch2BestDay = ch2Days.length > 0
        ? Math.max(...ch2Days.map(d => d.rate)) * 100
        : null;

      const ch2ByWeek: Record<string, { bookings: number; meetings: number }> = {};
      for (const d of ch2Days) {
        if (!ch2ByWeek[d.week]) ch2ByWeek[d.week] = { bookings: 0, meetings: 0 };
        ch2ByWeek[d.week].bookings += d.bookings;
        ch2ByWeek[d.week].meetings += d.meetings;
      }
      const ch2WeekRates = Object.values(ch2ByWeek)
        .filter(w => w.bookings > 0)
        .map(w => w.meetings / w.bookings);
      const ch2BestWeek = ch2WeekRates.length > 0 ? Math.max(...ch2WeekRates) * 100 : null;
      const ch2CurrentWeek = ch2ByWeek[currentWeek]
        ? (ch2ByWeek[currentWeek].meetings / ch2ByWeek[currentWeek].bookings) * 100
        : null;

      const round1 = (n: number | null) => n !== null ? Math.round(n * 10) / 10 : null;

      return {
        ...staff,
        weeksOnBoard,
        channels: [
          {
            avg:         round1(ch1Avg),
            bestDay:     round1(ch1BestDay),
            bestWeek:    round1(ch1BestWeek),
            currentWeek: round1(ch1CurrentWeek),
          },
          {
            avg:         round1(ch2Avg),
            bestDay:     round1(ch2BestDay),
            bestWeek:    round1(ch2BestWeek),
            currentWeek: round1(ch2CurrentWeek),
          },
        ],
      };
    });

    return NextResponse.json({ staff: result });
  } catch (err: any) {
    console.error('channels-data error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
