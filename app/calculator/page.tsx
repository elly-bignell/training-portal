// app/calculator/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Staff List ───
const STAFF = [
  { name: "Lucas Tirri", slug: "lucas-tirri", week: 1, buddy: true },
  { name: "Felipe Garcia", slug: "felipe-garcia", week: 1, buddy: true },
  { name: "Dylan Munro", slug: "dylan-munro", week: 1, buddy: true },
  { name: "Tom Rennie", slug: "tom-rennie", week: 1, buddy: true },
  { name: "Cindy Manrique", slug: "cindy-manrique", week: 1, buddy: true },
  { name: "Connie Matthews", slug: "connie-matthews", week: 1, buddy: true },
  { name: "Krishna Patel", slug: "krishna-patel", week: 1, buddy: true },
];

// ─── Rules of Thumb (per hour of calling) ───
// 5 calls = 1 booking (20% booking rate)
// 2 bookings = 1 meeting
// 2 meetings = 1 deal (unit)
// Revenue per unit = $500
// Week 1 buddy split = 50%

const RATES = {
  callsPerHour: 5,
  bookingRate: 0.2,          // 20% → 1 booking per 5 calls
  bookingsPerHour: 1,        // 5 calls × 20% = 1
  meetingsPerBooking: 0.5,   // 2 bookings = 1 meeting
  dealsPerMeeting: 0.5,      // 2 meetings = 1 deal
  revenuePerUnit: 500,
};

function calculateTargets(callingHours: number, buddySplit: boolean) {
  const calls = Math.round(RATES.callsPerHour * callingHours);
  const bookings = RATES.bookingsPerHour * callingHours;
  const meetings = bookings * RATES.meetingsPerBooking;
  const units = meetings * RATES.dealsPerMeeting;
  const grossRevenue = units * RATES.revenuePerUnit;
  const revenue = buddySplit ? grossRevenue * 0.5 : grossRevenue;

  return { calls, bookings, meetings, units, grossRevenue, revenue };
}

// ─── Quick hour presets ───
const HOUR_PRESETS = [1, 2, 3, 4, 5, 5.5, 6, 7, 8];

export default function CalculatorPage() {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [callingHours, setCallingHours] = useState<number>(5);

  const staff = STAFF.find((s) => s.slug === selectedStaff);
  const targets = calculateTargets(callingHours, staff?.buddy ?? true);

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-[900px] mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span>🧮</span> Daily Target Calculator
              </h1>
              <p className="text-sm text-slate-400">Select a person + calling hours → see expected outputs</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[900px] mx-auto px-4 py-8 space-y-6">

        {/* ─── Step 1: Select Person ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base text-white">1</span>
            <h2 className="text-sm font-bold text-slate-900">Select Person</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STAFF.map((person) => (
              <button
                key={person.slug}
                onClick={() => setSelectedStaff(person.slug)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedStaff === person.slug
                    ? "border-slate-900 bg-slate-900 text-white shadow-md"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-sm font-bold">{person.name}</div>
                <div className={`text-[10px] mt-0.5 ${
                  selectedStaff === person.slug ? "text-slate-400" : "text-gray-400"
                }`}>
                  Week {person.week} {person.buddy ? "· Buddy" : ""}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Step 2: Calling Hours ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base text-white">2</span>
            <h2 className="text-sm font-bold text-slate-900">Hours on the Phones</h2>
            <span className="text-xs text-gray-400 ml-2">How many hours calling today?</span>
          </div>

          {/* Big number display */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <button
              onClick={() => setCallingHours(Math.max(0, Math.round((callingHours - 0.5) * 10) / 10))}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-xl transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <input
                type="number"
                value={callingHours}
                onChange={(e) => setCallingHours(Math.max(0, parseFloat(e.target.value) || 0))}
                step={0.5}
                min={0}
                max={12}
                className="w-24 text-center text-5xl font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-slate-900 outline-none tabular-nums"
              />
              <div className="text-xs text-gray-400 mt-1">hours calling</div>
            </div>
            <button
              onClick={() => setCallingHours(Math.round((callingHours + 0.5) * 10) / 10)}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-xl transition-colors"
            >
              +
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap justify-center gap-2">
            {HOUR_PRESETS.map((h) => (
              <button
                key={h}
                onClick={() => setCallingHours(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  callingHours === h
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {h}hr{h !== 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Step 3: Generated Targets ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base text-white">3</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {staff ? `${staff.name}'s` : "Daily"} Targets
              </h2>
              <p className="text-xs text-gray-400">
                Based on {callingHours} hour{callingHours !== 1 ? "s" : ""} of calling
                {staff?.buddy ? " · 50/50 buddy revenue split" : ""}
              </p>
            </div>
          </div>

          {callingHours > 0 ? (
            <>
              {/* Main target cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {[
                  { label: "Calls", value: targets.calls, emoji: "📞", sub: `${RATES.callsPerHour}/hr`, color: "bg-sky-50 border-sky-200" },
                  { label: "Bookings", value: targets.bookings, emoji: "📅", sub: `${RATES.bookingsPerHour}/hr (20%)`, color: "bg-sky-50 border-sky-200" },
                  { label: "Meetings", value: targets.meetings, emoji: "🤝", sub: "1 per 2 bookings", color: "bg-emerald-50 border-emerald-200" },
                  { label: "Units", value: targets.units, emoji: "🏆", sub: "1 per 2 meetings", color: "bg-amber-50 border-amber-200" },
                  { label: "Revenue", value: targets.revenue, emoji: "💰", sub: staff?.buddy ? "50% buddy split" : "$500/unit", color: "bg-green-50 border-green-200", isCurrency: true },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl border p-4 text-center ${item.color}`}>
                    <span className="text-xl">{item.emoji}</span>
                    <div className="text-3xl font-black text-slate-900 tabular-nums mt-1">
                      {(item as { isCurrency?: boolean }).isCurrency
                        ? `$${item.value.toLocaleString()}`
                        : item.value % 1 === 0
                          ? item.value
                          : item.value.toFixed(1)
                      }
                    </div>
                    <div className="text-xs font-bold text-gray-600 mt-1">{item.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>

              {/* Hourly breakdown table */}
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Hour-by-Hour Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="pb-2 text-left text-xs font-semibold text-gray-400">After</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">📞 Calls</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">📅 Bookings</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">🤝 Meetings</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">🏆 Units</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">💰 Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: Math.ceil(callingHours) }, (_, i) => {
                        const h = Math.min(i + 1, callingHours);
                        const t = calculateTargets(h, staff?.buddy ?? true);
                        const isLast = h === callingHours;
                        const isCurrent = i + 1 > callingHours; // partial hour
                        return (
                          <tr
                            key={i}
                            className={`border-b border-gray-100 ${isLast ? "bg-slate-50 font-semibold" : ""}`}
                          >
                            <td className="py-2.5 text-gray-600">
                              {h % 1 === 0 ? `${h} hr${h !== 1 ? "s" : ""}` : `${h} hrs`}
                              {isLast && <span className="text-[10px] text-slate-400 ml-1">✓</span>}
                            </td>
                            <td className="py-2.5 text-center tabular-nums">{t.calls}</td>
                            <td className="py-2.5 text-center tabular-nums">{t.bookings % 1 === 0 ? t.bookings : t.bookings.toFixed(1)}</td>
                            <td className="py-2.5 text-center tabular-nums">{t.meetings % 1 === 0 ? t.meetings : t.meetings.toFixed(1)}</td>
                            <td className="py-2.5 text-center tabular-nums">{t.units % 1 === 0 ? t.units : t.units.toFixed(2)}</td>
                            <td className="py-2.5 text-center tabular-nums">${t.revenue.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <span className="text-3xl">⏱️</span>
              <p className="text-sm mt-2">Set calling hours above to generate targets</p>
            </div>
          )}
        </div>

        {/* ─── Rules Reference ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">📐</span>
            <h2 className="text-sm font-bold text-slate-900">Rules of Thumb</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-indigo-700 font-medium">5 calls</span>
              <span className="text-indigo-900 font-bold">= 1 booking</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-700 font-medium">Booking rate</span>
              <span className="text-gray-900 font-bold">20%</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-700 font-medium">2 bookings</span>
              <span className="text-gray-900 font-bold">= 1 meeting</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-700 font-medium">2 meetings</span>
              <span className="text-gray-900 font-bold">= 1 deal</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-gray-400">
            Revenue calculated at $500 per unit. Week 1 trainees are on 50/50 buddy split — revenue shown reflects their 50% share.
          </div>
        </div>

      </div>
    </main>
  );
}
