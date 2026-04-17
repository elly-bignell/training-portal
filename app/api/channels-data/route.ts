import { NextResponse } from 'next/server';

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY  = process.env.AIRTABLE_API_KEY!;

const TEAM_START       = '2026-02-23';
const TEAM_TOTAL_WEEKS = 8;

const STAFF = [
  { name: 'Cindy',   avatar: 'C', color: '#7c3aed', slug: 'cindy-rose-rondez-manfre', startDate: '2026-02-23', nameMatch: 'Cindy'   },
  { name: 'Krishna', avatar: 'K', color: '#0891b2', slug: 'krishna-patel',            startDate: '2026-02-23', nameMatch: 'Krishna' },
  { name: 'Sydney',  avatar: 'S', color: '#059669', slug: 'sydney-arnold',            startDate: '2026-03-24', nameMatch: 'Sydney'  },
  { name: 'Riley',   avatar: 'R', color: '#d97706', slug: 'riley-kerrison',           startDate: '2026-03-30', nameMatch: 'Riley'   },
];

function weekNum(dateStr: string, startDate: string): number {
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const s = new Date(startDate); s.setHours(0, 0, 0, 0);
  const days = Math.floor((d.getTime() - s.getTime()) / 86_400_000);
  return days < 0 ? 0 : Math.floor(days / 7) + 1;
}

async function fetchTable(table: string, fields: string[], formula?: string): Promise<any[]> {
  let records: any[] = [];
  let offset: string | undefined;
  do {
    const p = new URLSearchParams();
    fields.forEach(f => p.append('fields[]', f));
    if (formula) p.set('filterByFormula', formula);
    p.set('pageSize', '100');
    if (offset) p.set('offset', offset);
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?${p}`,
      { headers: { Authorization: `Bearer ${API_KEY}` }, cache: 'no-store' }
    );
    const data = await res.json();
    records = records.concat(data.records ?? []);
    offset = data.offset;
  } while (offset);
  return records;
}

type Bucket = { calls: number; callBooks: number; validated: number; rejected: number; htl: number };

function mkBuckets(count: number): Record<number, Bucket> {
  const m: Record<number, Bucket> = {};
  for (let i = 1; i <= count; i++) m[i] = { calls: 0, callBooks: 0, validated: 0, rejected: 0, htl: 0 };
  return m;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function formatBuckets(buckets: Record<number, Bucket>, curWeek: number) {
  return Object.entries(buckets).map(([k, b]) => {
    const w      = parseInt(k);
    const ch1    = b.calls > 0 ? r1((b.callBooks / b.calls) * 100) : null;
    const valRej = b.validated + b.rejected;
    const ch2    = valRej > 0 ? r1((b.validated / valRej) * 100) : null;
    const htlRate = (valRej + b.htl) > 0 ? r1((b.htl / (valRej + b.htl)) * 100) : null;
    return {
      weekNum: w,
      isCurrentWeek: w === curWeek,
      ch1, ch2, htlRate,
      calls: b.calls, callBooks: b.callBooks,
      validated: b.validated, rejected: b.rejected, htl: b.htl,
    };
  }).sort((a, b) => a.weekNum - b.weekNum);
}

export async function GET() {
  try {
    const today     = new Date().toISOString().slice(0, 10);
    const curTeamWk = weekNum(today, TEAM_START);

    const [dailyRecs, bookingRecs] = await Promise.all([
      fetchTable('DailyActivity', ['trainee_slug', 'date', 'calls', 'bookings']),
      fetchTable('Bookings', ['booking_date', 'staff_member', 'status'], `NOT({status}="pending")`),
    ]);

    const teamBuckets = mkBuckets(TEAM_TOTAL_WEEKS);
    const staffAcc = STAFF.map(s => ({
      ...s,
      curWk:   weekNum(today, s.startDate),
      buckets: mkBuckets(weekNum(today, s.startDate)),
    }));

    for (const rec of dailyRecs) {
      const f = rec.fields;
      if (!f.date || !f.trainee_slug || !(f.calls > 0)) continue;
      const st = staffAcc.find(s => s.slug === f.trainee_slug);
      if (!st) continue;
      const calls = f.calls as number;
      const books = (f.bookings ?? 0) as number;
      const tw = weekNum(f.date, TEAM_START);
      const pw = weekNum(f.date, st.startDate);
      if (tw >= 1 && tw <= TEAM_TOTAL_WEEKS) {
        teamBuckets[tw].calls     += calls;
        teamBuckets[tw].callBooks += books;
      }
      if (pw >= 1 && st.buckets[pw]) {
        st.buckets[pw].calls     += calls;
        st.buckets[pw].callBooks += books;
      }
    }

    for (const rec of bookingRecs) {
      const f = rec.fields;
      if (!f.booking_date || !f.staff_member || !f.status) continue;
      const status = f.status as string;
      const st = staffAcc.find(s => (f.staff_member as string).includes(s.nameMatch));
      if (!st) continue;
      const tw = weekNum(f.booking_date, TEAM_START);
      const pw = weekNum(f.booking_date, st.startDate);
      const addTo = (b: Bucket) => {
        if (status === 'validated')          b.validated++;
        else if (status === 'rejected')      b.rejected++;
        else if (status === 'hot_try_later') b.htl++;
      };
      if (tw >= 1 && tw <= TEAM_TOTAL_WEEKS) addTo(teamBuckets[tw]);
      if (pw >= 1 && st.buckets[pw])         addTo(st.buckets[pw]);
    }

    return NextResponse.json({
      team:  { weeks: formatBuckets(teamBuckets, curTeamWk) },
      staff: staffAcc.map(s => ({
        name: s.name, avatar: s.avatar, color: s.color,
        currentWeekNum: s.curWk,
        weeks: formatBuckets(s.buckets, s.curWk),
      })),
    });
  } catch (err: any) {
    console.error('channels-data error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
