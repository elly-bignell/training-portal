// app/funnel/manager/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FunnelData,
  calculateTargets,
  buildFunnelStages,
  buildConversionSteps,
  detectBottleneck,
  projectEndOfDay,
  overallBand,
  bandColor,
  bandBg,
  bandBgLight,
  bandLabel,
  bandEmoji,
  formatPercent,
  Band,
} from "@/lib/funnel";

// ─── Dummy rep data (replace with DB/API later) ───
interface RepSession {
  name: string;
  slug: string;
  hoursWorked: number;
  actuals: FunnelData;
}

const INITIAL_REPS: RepSession[] = [
  {
    name: "Connie Matthews",
    slug: "connie-matthews",
    hoursWorked: 3.5,
    actuals: { calls: 58, connects: 31, bookings: 9, attendance: 4, sales: 2 },
  },
  {
    name: "Krishna Patel",
    slug: "krishna-patel",
    hoursWorked: 3.5,
    actuals: { calls: 45, connects: 18, bookings: 5, attendance: 2, sales: 1 },
  },
  {
    name: "Cindy Manrique",
    slug: "cindy-manrique",
    hoursWorked: 3.5,
    actuals: { calls: 70, connects: 40, bookings: 12, attendance: 6, sales: 3 },
  },
  {
    name: "Dylan Munro",
    slug: "dylan-munro",
    hoursWorked: 2,
    actuals: { calls: 20, connects: 8, bookings: 2, attendance: 1, sales: 0 },
  },
  {
    name: "Thomas Rennie",
    slug: "thomas-rennie",
    hoursWorked: 3.5,
    actuals: { calls: 62, connects: 35, bookings: 10, attendance: 5, sales: 3 },
  },
  {
    name: "Lucas Tirri",
    slug: "lucas-tirri",
    hoursWorked: 3,
    actuals: { calls: 50, connects: 22, bookings: 6, attendance: 3, sales: 1 },
  },
  {
    name: "Felipe Garcia",
    slug: "felipe-garcia",
    hoursWorked: 1,
    actuals: { calls: 15, connects: 6, bookings: 1, attendance: 0, sales: 0 },
  },
];

// ─── Mini Funnel Bar ───
function MiniFunnelBar({ stages }: { stages: ReturnType<typeof buildFunnelStages> }) {
  return (
    <div className="flex gap-1 items-end h-10">
      {stages.map((stage) => {
        const height = Math.max(10, Math.min(100, stage.percentOfTarget));
        return (
          <div key={stage.key} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className={`w-full rounded-sm transition-all duration-300 ${bandBg(stage.band)}`}
              style={{ height: `${height}%`, minHeight: "4px" }}
            />
            <span className="text-[8px] text-gray-400 leading-none">{stage.actual}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Rep Card ───
function RepCard({ rep }: { rep: RepSession }) {
  const targets = calculateTargets(rep.hoursWorked);
  const stages = buildFunnelStages(rep.actuals, targets);
  const conversions = buildConversionSteps(rep.actuals);
  const bottleneck = detectBottleneck(rep.actuals);
  const projected = projectEndOfDay(rep.actuals, rep.hoursWorked);
  const overall = overallBand(rep.actuals, targets);

  return (
    <div className={`rounded-xl border-2 p-5 transition-all hover:shadow-md ${
      overall === "elite" ? "border-emerald-200 bg-white" :
      overall === "onTarget" ? "border-amber-200 bg-white" :
      "border-red-200 bg-white"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{rep.name}</h3>
          <div className="text-[10px] text-gray-400 mt-0.5">{rep.hoursWorked}hrs worked</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{bandEmoji(overall)}</span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
            overall === "elite" ? "bg-emerald-100 text-emerald-700" :
            overall === "onTarget" ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          }`}>
            {bandLabel(overall)}
          </span>
        </div>
      </div>

      {/* Mini Funnel */}
      <div className="mb-4">
        <div className="flex justify-between text-[8px] text-gray-400 uppercase tracking-wide mb-1 px-0.5">
          <span>Calls</span>
          <span>Conn</span>
          <span>Book</span>
          <span>Att</span>
          <span>Sales</span>
        </div>
        <MiniFunnelBar stages={stages} />
      </div>

      {/* Key Numbers */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-lg font-black text-slate-900 tabular-nums leading-none">{rep.actuals.sales}</div>
          <div className="text-[9px] text-gray-400 uppercase mt-0.5">Sales</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-slate-900 tabular-nums leading-none">{rep.actuals.bookings}</div>
          <div className="text-[9px] text-gray-400 uppercase mt-0.5">Bookings</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-slate-900 tabular-nums leading-none">{rep.actuals.calls}</div>
          <div className="text-[9px] text-gray-400 uppercase mt-0.5">Calls</div>
        </div>
      </div>

      {/* Conversion Rates (compact) */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] mb-3">
        {conversions.map((step) => (
          <div key={step.key} className="flex items-center justify-between">
            <span className="text-gray-400">{step.label}</span>
            <span className={`font-bold tabular-nums ${bandColor(step.band)}`}>
              {formatPercent(step.actual)}
            </span>
          </div>
        ))}
      </div>

      {/* Projected + Bottleneck */}
      <div className="border-t border-gray-100 pt-3 space-y-1.5">
        {rep.hoursWorked > 0 && (
          <div className="text-[10px] text-gray-500">
            Projected EOD: <strong className="text-gray-700">{projected.sales}</strong> sales · <strong className="text-gray-700">{projected.bookings}</strong> bookings
          </div>
        )}
        {bottleneck && bottleneck.ratio < 0.9 && (
          <div className="text-[10px] flex items-center gap-1">
            <span>⚠️</span>
            <span className="text-gray-500">
              Bottleneck: <strong className="text-red-600">{bottleneck.label}</strong> ({(bottleneck.ratio * 100).toFixed(0)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Leaderboard Table ───
function LeaderboardTable({ reps }: { reps: RepSession[] }) {
  const ranked = [...reps]
    .map((rep) => {
      const targets = calculateTargets(rep.hoursWorked);
      const overall = overallBand(rep.actuals, targets);
      const projected = projectEndOfDay(rep.actuals, rep.hoursWorked);
      const conversions = buildConversionSteps(rep.actuals);
      const connectRate = conversions.find((c) => c.key === "connectRate");
      const closeRate = conversions.find((c) => c.key === "closeRate");
      return { ...rep, overall, projected, connectRate, closeRate };
    })
    .sort((a, b) => b.actuals.sales - a.actuals.sales || b.actuals.bookings - a.actuals.bookings);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="pb-2 text-left text-xs font-semibold text-gray-400">#</th>
            <th className="pb-2 text-left text-xs font-semibold text-gray-400">Rep</th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-400">Band</th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-400">Calls</th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-400">Connects</th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-400">Bookings</th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-400">Attend.</th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-400">Sales</th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-400">Connect %</th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-400">Close %</th>
            <th className="pb-2 text-center text-xs font-semibold text-gray-400">Proj. Sales</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((rep, i) => (
            <tr key={rep.slug} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 text-gray-400 font-medium">{i + 1}</td>
              <td className="py-3 font-semibold text-slate-900">{rep.name}</td>
              <td className="py-3 text-center">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  rep.overall === "elite" ? "bg-emerald-100 text-emerald-700" :
                  rep.overall === "onTarget" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {bandEmoji(rep.overall)} {bandLabel(rep.overall)}
                </span>
              </td>
              <td className="py-3 text-center tabular-nums font-medium">{rep.actuals.calls}</td>
              <td className="py-3 text-center tabular-nums font-medium">{rep.actuals.connects}</td>
              <td className="py-3 text-center tabular-nums font-medium">{rep.actuals.bookings}</td>
              <td className="py-3 text-center tabular-nums font-medium">{rep.actuals.attendance}</td>
              <td className="py-3 text-center tabular-nums font-bold">{rep.actuals.sales}</td>
              <td className={`py-3 text-center tabular-nums font-bold ${rep.connectRate ? bandColor(rep.connectRate.band) : "text-gray-400"}`}>
                {rep.connectRate ? formatPercent(rep.connectRate.actual) : "—"}
              </td>
              <td className={`py-3 text-center tabular-nums font-bold ${rep.closeRate ? bandColor(rep.closeRate.band) : "text-gray-400"}`}>
                {rep.closeRate ? formatPercent(rep.closeRate.actual) : "—"}
              </td>
              <td className="py-3 text-center tabular-nums font-bold text-slate-700">
                {rep.hoursWorked > 0 ? rep.projected.sales : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Summary Stats ───
function SummaryStats({ reps }: { reps: RepSession[] }) {
  const totalCalls = reps.reduce((s, r) => s + r.actuals.calls, 0);
  const totalConnects = reps.reduce((s, r) => s + r.actuals.connects, 0);
  const totalBookings = reps.reduce((s, r) => s + r.actuals.bookings, 0);
  const totalAttendance = reps.reduce((s, r) => s + r.actuals.attendance, 0);
  const totalSales = reps.reduce((s, r) => s + r.actuals.sales, 0);

  const eliteCount = reps.filter((r) => {
    const t = calculateTargets(r.hoursWorked);
    return overallBand(r.actuals, t) === "elite";
  }).length;

  const underCount = reps.filter((r) => {
    const t = calculateTargets(r.hoursWorked);
    return overallBand(r.actuals, t) === "under";
  }).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {[
        { label: "Total Calls", value: totalCalls, emoji: "📞" },
        { label: "Total Connects", value: totalConnects, emoji: "🔗" },
        { label: "Total Bookings", value: totalBookings, emoji: "📅" },
        { label: "Total Attendance", value: totalAttendance, emoji: "🤝" },
        { label: "Total Sales", value: totalSales, emoji: "💰" },
        { label: "Elite Reps", value: eliteCount, emoji: "🟢" },
        { label: "Under Reps", value: underCount, emoji: "🔴" },
      ].map((item) => (
        <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <span className="text-lg">{item.emoji}</span>
          <div className="text-2xl font-black text-slate-900 tabular-nums mt-1">{item.value}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Manager View ───
export default function ManagerFunnelPage() {
  const [reps] = useState<RepSession[]>(INITIAL_REPS);
  const [view, setView] = useState<"grid" | "table">("grid");

  return (
    <main className="min-h-screen bg-slate-100">
      {/* ─── Header ─── */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/funnel" className="text-slate-400 hover:text-white transition-colors" title="Back to Funnel">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <span>👥</span> Manager Dashboard
                </h1>
                <p className="text-sm text-slate-400">Team funnel overview · {reps.length} reps</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  view === "grid" ? "bg-white text-slate-900" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  view === "table" ? "bg-white text-slate-900" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats */}
        <SummaryStats reps={reps} />

        {/* Grid or Table View */}
        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reps.map((rep) => (
              <RepCard key={rep.slug} rep={rep} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <LeaderboardTable reps={reps} />
          </div>
        )}

        {/* Footer note */}
        <div className="text-center text-xs text-gray-400 py-4">
          Data shown is currently hardcoded for demo purposes. Connect to your CRM or database to make it live.
        </div>
      </div>
    </main>
  );
}
