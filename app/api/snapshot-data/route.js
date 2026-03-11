import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const DAILY_ACTIVITY_TABLE = "DailyActivity";
const VALIDATION_TABLE     = "Bookings";

const TRAINEES = {
  "cindy-rose-rondez-manrique": {
    name: "Cindy",
    fullName: "Cindy Rose Rondez Manrique",
    staffMatchNames: ["Cindy Manrique", "cindy-rose-rondez-manrique"],
    absences: { publicHolidays: 0, sickDays: 0 },
  },
  "connie-matthews": {
    name: "Connie",
    fullName: "Connie Matthews",
    staffMatchNames: ["Connie Matthews"],
    absences: { publicHolidays: 1, sickDays: 0 },
  },
  "krishna-patel": {
    name: "Krishna",
    fullName: "Krishna Patel",
    staffMatchNames: ["Krishna Patel"],
    absences: { publicHolidays: 1, sickDays: 2 },
  },
};

const PERIOD_START     = "2026-02-16";
const FIELD_WEEK_START = "2026-02-23";

async function fetchAirtableAll(table, filterFormula = "") {
  const base = encodeURIComponent(table);
  let records = [];
  let offset  = "";
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (filterFormula) params.set("filterByFormula", filterFormula);
    if (offset)        params.set("offset", offset);
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${base}?${params}`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, next: { revalidate: 300 } }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Airtable error (${table}): ${res.status} — ${err}`);
    }
    const json = await res.json();
    records = records.concat(json.records || []);
    offset  = json.offset || "";
  } while (offset);
  return records;
}

function parseRevenue(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[$,]/g, "")) || 0;
}

function todayStr() {
  const now      = new Date();
  const adelaide = new Date(now.getTime() + (9.5 * 60 * 60 * 1000));
  return adelaide.toISOString().slice(0, 10);
}

function countWorkingDays(startStr, endStr) {
  const start = new Date(startStr + "T00:00:00");
  const end   = new Date(endStr   + "T00:00:00");
  let count   = 0;
  const cur   = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export async function GET() {
  try {
    const today = todayStr();

    let activityRecords = [];
    try {
      activityRecords = await fetchAirtableAll(DAILY_ACTIVITY_TABLE, `{date} >= '${PERIOD_START}'`);
    } catch (e) { console.error("DailyActivity fetch failed:", e.message); }

    let validationRecords = [];
    try {
      validationRecords = await fetchAirtableAll(VALIDATION_TABLE, `{booking_date} >= '${PERIOD_START}'`);
    } catch (e) { console.error("Bookings fetch failed:", e.message); }

    const stats = {};
    for (const [slug, trainee] of Object.entries(TRAINEES)) {
      const totalDays = countWorkingDays(PERIOD_START, today) - trainee.absences.publicHolidays - trainee.absences.sickDays;
      const fieldDays = countWorkingDays(FIELD_WEEK_START, today) - trainee.absences.publicHolidays - trainee.absences.sickDays;
      stats[slug] = { ...trainee, totalDays, fieldDays, callsMade: 0, connectedCalls: 0, bookings: 0, meetings: 0, unitsRaw: 0, revenueRaw: 0, valTotal: 0, valValidated: 0, valRejected: 0, valPending: 0 };
    }

    for (const record of activityRecords) {
      const f    = record.fields;
      const slug = f["trainee_slug"];
      if (!slug || !stats[slug]) continue;
      stats[slug].callsMade      += parseFloat(f["calls_made"]) || 0;
      stats[slug].connectedCalls += parseFloat(f["calls"])      || 0;
      stats[slug].bookings       += parseFloat(f["bookings"])   || 0;
      stats[slug].meetings       += parseFloat(f["meetings"])   || 0;
      stats[slug].unitsRaw       += parseFloat(f["units"])      || 0;
      stats[slug].revenueRaw     += parseRevenue(f["revenue"]);
    }

    for (const record of validationRecords) {
      const f         = record.fields;
      const staffName = (f["staff_member"] || "").trim();
      if (!staffName) continue;
      const matchedSlug = Object.entries(TRAINEES).find(([, t]) =>
        t.staffMatchNames.some((n) =>
          staffName.toLowerCase().includes(n.toLowerCase()) ||
          n.toLowerCase().includes(staffName.toLowerCase())
        )
      )?.[0];
      if (!matchedSlug || !stats[matchedSlug]) continue;
      const status = (f["status"] || "").toLowerCase().trim();
      stats[matchedSlug].valTotal++;
      if      (status === "validated") stats[matchedSlug].valValidated++;
      else if (status === "rejected")  stats[matchedSlug].valRejected++;
      else                              stats[matchedSlug].valPending++;
    }

    const result = Object.entries(stats).map(([slug, s]) => {
      const units     = s.unitsRaw * 2;
      const revenue   = s.revenueRaw * 2;
      const contacted = s.valValidated + s.valRejected;
      return {
        slug, name: s.name, fullName: s.fullName,
        totalDays: s.totalDays, fieldDays: s.fieldDays, absences: s.absences,
        revenue, units,
        meetings: s.meetings, bookings: s.bookings,
        connectedCalls: s.connectedCalls, totalCalls: s.callsMade,
        valTotal: s.valTotal, valValidated: s.valValidated, valRejected: s.valRejected, valPending: s.valPending,
        valContactRate: s.valTotal  > 0 ? Math.round((contacted      / s.valTotal)  * 100) : 0,
        valRate:        contacted   > 0 ? Math.round((s.valValidated / contacted)   * 100) : 0,
        bookingsPerDay:       s.totalDays > 0 ? +(s.bookings       / s.totalDays).toFixed(2) : 0,
        connectedCallsPerDay: s.totalDays > 0 ? +(s.connectedCalls / s.totalDays).toFixed(2) : 0,
        totalCallsPerDay:     s.fieldDays > 0 ? +(s.callsMade      / s.fieldDays).toFixed(2) : 0,
      };
    });

    return NextResponse.json({ ok: true, generatedAt: new Date().toISOString(), periodStart: PERIOD_START, periodEnd: today, trainees: result });
  } catch (err) {
    console.error("Snapshot API error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
