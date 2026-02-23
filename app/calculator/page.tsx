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

// ─── Benchmark per hour ───
// 18 calls → 10 connects (55.6%) → 2 bookings (20% of connects) → 1 attended (50% of bookings) → 0.5 deals (50% of attended)
const PER_HOUR = {
  calls: 18,
  connects: 10,
  bookings: 2,
  attended: 1,
  deals: 0.5,
};

const REVENUE_PER_UNIT = 500;

function calculateTargets(callingHours: number, buddySplit: boolean) {
  const calls = Math.round(PER_HOUR.calls * callingHours);
  const connects = Math.round(PER_HOUR.connects * callingHours);
  const bookings = Math.round(PER_HOUR.bookings * callingHours);
  const attended = PER_HOUR.attended * callingHours;
  const deals = PER_HOUR.deals * callingHours;
  const grossRevenue = deals * REVENUE_PER_UNIT;
  const revenue = buddySplit ? grossRevenue * 0.5 : grossRevenue;

  return { calls, connects, bookings, attended, deals, grossRevenue, revenue };
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
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base text-white font-bold">1</span>
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
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base text-white font-bold">2</span>
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
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base text-white font-bold">3</span>
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
              {/* Funnel flow visual */}
              <div className="flex flex-col sm:flex-row items-stretch gap-0 mb-6">
                {[
                  { label: "Calls", value: targets.calls, emoji: "📞", color: "bg-sky-50 border-sky-200 text-sky-700" },
                  { label: "Connects", value: targets.connects, emoji: "🔗", color: "bg-sky-50 border-sky-200 text-sky-700", rate: "55.6%" },
                  { label: "Bookings", value: targets.bookings, emoji: "📅", color: "bg-indigo-50 border-indigo-200 text-indigo-700", rate: "20%" },
                  { label: "Attended", value: targets.attended, emoji: "🤝", color: "bg-emerald-50 border-emerald-200 text-emerald-700", rate: "50%" },
                  { label: "Deals", value: targets.deals, emoji: "🏆", color: "bg-amber-50 border-amber-200 text-amber-700", rate: "50%" },
                  { label: "Revenue", value: targets.revenue, emoji: "💰", color: "bg-green-50 border-green-200 text-green-700", isCurrency: true, rate: staff?.buddy ? "50% split" : "" },
                ].map((item, i, arr) => (
                  <div key={item.label} className="flex sm:flex-col items-center flex-1">
                    <div className={`rounded-xl border p-3 text-center w-full ${item.color}`}>
                      <span className="text-lg">{item.emoji}</span>
                      <div className="text-2xl font-black text-slate-900 tabular-nums mt-0.5">
                        {(item as { isCurrency?: boolean }).isCurrency
                          ? `$${Math.round(item.value).toLocaleString()}`
                          : item.value % 1 === 0
                            ? item.value
                            : item.value.toFixed(1)
                        }
                      </div>
                      <div className="text-[10px] font-bold mt-0.5">{item.label}</div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex items-center justify-center sm:py-1 px-2 sm:px-0">
                        <svg className="w-4 h-4 text-gray-300 sm:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {arr[i + 1]?.rate && (
                          <span className="text-[9px] text-gray-400 font-semibold ml-0.5 sm:ml-0">{arr[i + 1].rate}</span>
                        )}
                      </div>
                    )}
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
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">🔗 Connects</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">📅 Bookings</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">🤝 Attended</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">🏆 Deals</th>
                        <th className="pb-2 text-center text-xs font-semibold text-gray-400">💰 Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: Math.ceil(callingHours) }, (_, i) => {
                        const h = Math.min(i + 1, callingHours);
                        const t = calculateTargets(h, staff?.buddy ?? true);
                        const isLast = h === callingHours;
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
                            <td className="py-2.5 text-center tabular-nums">{t.connects}</td>
                            <td className="py-2.5 text-center tabular-nums">{t.bookings}</td>
                            <td className="py-2.5 text-center tabular-nums">{t.attended % 1 === 0 ? t.attended : t.attended.toFixed(1)}</td>
                            <td className="py-2.5 text-center tabular-nums">{t.deals % 1 === 0 ? t.deals : t.deals.toFixed(1)}</td>
                            <td className="py-2.5 text-center tabular-nums">${Math.round(t.revenue).toLocaleString()}</td>
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

        {/* ─── Conversion Funnel Reference ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">📐</span>
            <h2 className="text-sm font-bold text-slate-900">Conversion Funnel (per hour benchmark)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="pb-2 text-left font-semibold text-gray-400">Stage</th>
                  <th className="pb-2 text-center font-semibold text-gray-400">Per Hour</th>
                  <th className="pb-2 text-center font-semibold text-gray-400">Cut-through</th>
                  <th className="pb-2 text-center font-semibold text-gray-400">From</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-700">📞 Calls</td>
                  <td className="py-2 text-center font-bold text-slate-900">18</td>
                  <td className="py-2 text-center text-gray-500">—</td>
                  <td className="py-2 text-center text-gray-400">—</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-700">🔗 Connects</td>
                  <td className="py-2 text-center font-bold text-slate-900">10</td>
                  <td className="py-2 text-center text-sky-600 font-semibold">55.6%</td>
                  <td className="py-2 text-center text-gray-400">of Calls</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-700">📅 Bookings</td>
                  <td className="py-2 text-center font-bold text-slate-900">2</td>
                  <td className="py-2 text-center text-indigo-600 font-semibold">20%</td>
                  <td className="py-2 text-center text-gray-400">of Connects</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-700">🤝 Attended</td>
                  <td className="py-2 text-center font-bold text-slate-900">1</td>
                  <td className="py-2 text-center text-emerald-600 font-semibold">50%</td>
                  <td className="py-2 text-center text-gray-400">of Bookings</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-700">🏆 Deals</td>
                  <td className="py-2 text-center font-bold text-slate-900">0.5</td>
                  <td className="py-2 text-center text-amber-600 font-semibold">50%</td>
                  <td className="py-2 text-center text-gray-400">of Attended</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-[10px] text-gray-400">
            Revenue calculated at $500 per unit. Week 1 trainees are on 50/50 buddy split — revenue shown reflects their 50% share.
          </div>
        </div>

      </div>
    </main>
  );
}
