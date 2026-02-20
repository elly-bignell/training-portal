// app/timezones/page.tsx

"use client";

import Link from "next/link";

// Adelaide times from 8:30am to 5:30pm in 30-min increments
const ADELAIDE_TIMES = [
  "8:30am", "9:00am", "9:30am", "10:00am", "10:30am",
  "11:00am", "11:30am", "12:00pm", "12:30pm", "1:00pm",
  "1:30pm", "2:00pm", "2:30pm", "3:00pm", "3:30pm",
  "4:00pm", "4:30pm", "5:00pm", "5:30pm",
];

// Convert time string by offset in minutes
function offsetTime(time: string, offsetMins: number): string {
  const match = time.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
  if (!match) return time;
  let hours = parseInt(match[1]);
  const mins = parseInt(match[2]);
  const period = match[3];

  // Convert to 24h
  if (period === "pm" && hours !== 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;

  let totalMins = hours * 60 + mins + offsetMins;

  // Handle day wrap
  if (totalMins < 0) totalMins += 24 * 60;
  if (totalMins >= 24 * 60) totalMins -= 24 * 60;

  let h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const suffix = h >= 12 ? "pm" : "am";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;

  return `${h}:${m.toString().padStart(2, "0")}${suffix}`;
}

// DST offsets relative to Adelaide (ACDT UTC+10:30)
const DST_ZONES = [
  { label: "SA", city: "Adelaide", tz: "ACDT", offset: 0 },
  { label: "VIC", city: "Melbourne", tz: "AEDT", offset: 30 },
  { label: "NSW", city: "Sydney", tz: "AEDT", offset: 30 },
  { label: "QLD", city: "Brisbane", tz: "AEST", offset: -30, note: "No DST" },
  { label: "TAS", city: "Hobart", tz: "AEDT", offset: 30 },
  { label: "ACT", city: "Canberra", tz: "AEDT", offset: 30 },
  { label: "NT", city: "Darwin", tz: "ACST", offset: -60 },
  { label: "WA", city: "Perth", tz: "AWST", offset: -150 },
];

// Standard time offsets relative to Adelaide (ACST UTC+9:30)
const STD_ZONES = [
  { label: "SA", city: "Adelaide", tz: "ACST", offset: 0 },
  { label: "VIC", city: "Melbourne", tz: "AEST", offset: 30 },
  { label: "NSW", city: "Sydney", tz: "AEST", offset: 30 },
  { label: "QLD", city: "Brisbane", tz: "AEST", offset: 30 },
  { label: "TAS", city: "Hobart", tz: "AEST", offset: 30 },
  { label: "ACT", city: "Canberra", tz: "AEST", offset: 30 },
  { label: "NT", city: "Darwin", tz: "ACST", offset: 0 },
  { label: "WA", city: "Perth", tz: "AWST", offset: -90 },
];

function TimeTable({
  zones,
  title,
  subtitle,
  dates,
  badgeColor,
}: {
  zones: typeof DST_ZONES;
  title: string;
  subtitle: string;
  dates: string;
  badgeColor: string;
}) {
  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badgeColor}`}>
          {dates}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">{subtitle}</p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-800 text-white">
              {zones.map((z, i) => (
                <th
                  key={z.label + z.city}
                  className={`px-3 py-3 text-center font-semibold text-xs border-r border-slate-700 last:border-r-0 ${
                    i === 0 ? "bg-slate-900" : ""
                  }`}
                >
                  <div className="text-white">{z.label}</div>
                  <div className="text-slate-400 font-normal text-[10px]">{z.city}</div>
                  <div className="text-slate-500 font-normal text-[9px] mt-0.5">
                    {z.tz}
                    {z.note ? ` · ${z.note}` : ""}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ADELAIDE_TIMES.map((time, rowIdx) => {
              const isLunch = time === "12:30pm" || time === "1:00pm";
              return (
                <tr
                  key={time}
                  className={`${
                    isLunch
                      ? "bg-amber-50"
                      : rowIdx % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50"
                  } hover:bg-blue-50 transition-colors`}
                >
                  {zones.map((z, colIdx) => {
                    const converted = offsetTime(time, z.offset);
                    return (
                      <td
                        key={z.label + z.city}
                        className={`px-3 py-2.5 text-center border-r border-slate-100 last:border-r-0 ${
                          colIdx === 0
                            ? "font-bold text-slate-900 bg-slate-50 border-r-slate-200"
                            : z.offset === 0
                            ? "text-slate-700"
                            : z.offset > 0
                            ? "text-blue-700"
                            : "text-orange-700"
                        }`}
                      >
                        {converted}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          Adelaide (base)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          Ahead of Adelaide
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
          Behind Adelaide
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
          Common lunch period
        </div>
      </div>
    </div>
  );
}

export default function TimezonesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Portal
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">🕐 Australian Time Zones</h1>
          <p className="text-slate-500 mt-1">Quick reference for calls — all times relative to Adelaide</p>
        </div>

        {/* Key info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
          <div className="font-semibold mb-1">⏰ How to use this</div>
          <p className="text-xs text-blue-700 leading-relaxed">
            Find your Adelaide time in the first column, then read across to see what time it is for your prospect.
            Colours indicate whether the state is ahead (blue) or behind (orange) Adelaide.
            Queensland does not observe daylight saving time.
          </p>
        </div>

        {/* DST Table */}
        <TimeTable
          zones={DST_ZONES}
          title="☀️ Daylight Saving Time"
          subtitle="Most states spring forward — except QLD, NT and WA"
          dates="First Sun in Oct → First Sun in Apr"
          badgeColor="bg-amber-100 text-amber-700"
        />

        {/* Standard Time Table */}
        <TimeTable
          zones={STD_ZONES}
          title="❄️ Standard Time"
          subtitle="All eastern states align — QLD, VIC, NSW, TAS and ACT are the same"
          dates="First Sun in Apr → First Sun in Oct"
          badgeColor="bg-blue-100 text-blue-700"
        />

        {/* Quick summary */}
        <div className="bg-slate-100 rounded-xl p-5 text-sm">
          <h3 className="font-bold text-slate-900 mb-3">📋 Quick Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <div className="font-semibold text-slate-800 mb-1">During Daylight Saving</div>
              <div>VIC, NSW, TAS, ACT → <span className="text-blue-700 font-medium">+30 min ahead</span> of Adelaide</div>
              <div>QLD → <span className="text-orange-700 font-medium">30 min behind</span> Adelaide</div>
              <div>NT → <span className="text-orange-700 font-medium">1 hr behind</span> Adelaide</div>
              <div>WA → <span className="text-orange-700 font-medium">2 hrs 30 min behind</span> Adelaide</div>
            </div>
            <div>
              <div className="font-semibold text-slate-800 mb-1">During Standard Time</div>
              <div>VIC, NSW, QLD, TAS, ACT → <span className="text-blue-700 font-medium">+30 min ahead</span> of Adelaide</div>
              <div>NT → <span className="text-slate-700 font-medium">Same time</span> as Adelaide</div>
              <div>WA → <span className="text-orange-700 font-medium">1 hr 30 min behind</span> Adelaide</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
