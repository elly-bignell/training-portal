// app/funnel/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  classifyBand,
  Band,
} from "@/lib/funnel";

// ─── Stepper Input Component ───
function StepperInput({
  label,
  emoji,
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
      <span className="text-lg">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{label}</div>
        <div className="text-xl font-bold text-slate-900 tabular-nums">{value}</div>
      </div>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onChange(Math.max(min, value + step))}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm transition-colors"
        >
          +
        </button>
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm transition-colors"
        >
          −
        </button>
      </div>
    </div>
  );
}

// ─── Funnel Stage Card ───
function FunnelStageCard({
  label,
  emoji,
  actual,
  target,
  band,
  percentOfTarget,
}: {
  label: string;
  emoji: string;
  actual: number;
  target: number;
  band: Band;
  percentOfTarget: number;
}) {
  const progressWidth = Math.min(percentOfTarget, 150);

  return (
    <div className={`rounded-xl border p-4 transition-all ${bandBgLight(band)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-xs font-bold uppercase tracking-wide text-gray-600">{label}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          band === "elite" ? "bg-emerald-100 text-emerald-700" :
          band === "onTarget" ? "bg-amber-100 text-amber-700" :
          "bg-red-100 text-red-700"
        }`}>
          {bandLabel(band)}
        </span>
      </div>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-3xl font-black text-slate-900 tabular-nums leading-none">{actual}</span>
        <span className="text-sm text-gray-400 mb-0.5">/ {target % 1 === 0 ? target : target.toFixed(1)}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${bandBg(band)}`}
          style={{ width: `${Math.min(progressWidth, 100)}%` }}
        />
      </div>
      <div className="text-[10px] text-gray-500 mt-1 tabular-nums">
        {percentOfTarget > 0 ? `${percentOfTarget.toFixed(0)}% of target` : "No target yet"}
      </div>
    </div>
  );
}

// ─── Conversion Arrow ───
function ConversionArrow({
  label,
  tooltip,
  actual,
  benchmark,
  band,
}: {
  label: string;
  tooltip: string;
  actual: number | null;
  benchmark: number;
  band: Band;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-1 py-2">
      <svg className="w-5 h-5 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      <div className={`text-sm font-black tabular-nums ${bandColor(band)}`}>
        {formatPercent(actual)}
      </div>
      <div className="text-[9px] text-gray-400 text-center leading-tight" title={tooltip}>
        {label}
      </div>
      <div className="text-[9px] text-gray-300 tabular-nums">
        Bench: {formatPercent(benchmark)}
      </div>
    </div>
  );
}

// ─── Timer Component ───
function Timer({
  hoursWorked,
  onUpdate,
}: {
  hoursWorked: number;
  onUpdate: (h: number) => void;
}) {
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const startHoursRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    startHoursRef.current = hoursWorked;
    setRunning(true);
  }, [hoursWorked]);

  const stopTimer = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 3600000; // ms → hours
        onUpdate(Math.round((startHoursRef.current + elapsed) * 100) / 100);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onUpdate]);

  return (
    <div className="flex items-center gap-2">
      {!running ? (
        <button
          onClick={startTimer}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
          Start Timer
        </button>
      ) : (
        <button
          onClick={stopTimer}
          className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
          Stop
        </button>
      )}
      {running && (
        <span className="text-xs text-emerald-600 font-semibold animate-pulse">● Live</span>
      )}
    </div>
  );
}

// ─── Main Dashboard ───
export default function LiveFunnelPage() {
  const [actuals, setActuals] = useState<FunnelData>({
    calls: 0,
    connects: 0,
    bookings: 0,
    attendance: 0,
    sales: 0,
  });
  const [hoursWorked, setHoursWorked] = useState(0);

  const updateField = (field: keyof FunnelData, value: number) => {
    setActuals((prev) => ({ ...prev, [field]: Math.max(0, value) }));
  };

  const targets = calculateTargets(hoursWorked);
  const stages = buildFunnelStages(actuals, targets);
  const conversions = buildConversionSteps(actuals);
  const bottleneck = detectBottleneck(actuals);
  const projected = projectEndOfDay(actuals, hoursWorked);
  const overall = overallBand(actuals, targets);
  const salesBand = classifyBand(actuals.sales, targets.sales);

  return (
    <main className="min-h-screen bg-slate-100">
      {/* ─── Header ─── */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1400px] mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors" title="Back to Home">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <span>📊</span> Live Sales Funnel
                </h1>
                <p className="text-sm text-slate-400">Real-time pipeline tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/funnel/manager"
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition-colors"
              >
                👥 Manager View
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">

        {/* ─── "Am I Winning?" Summary Strip ─── */}
        <div className={`rounded-xl border-2 p-4 flex flex-col md:flex-row items-start md:items-center gap-4 ${
          overall === "elite" ? "border-emerald-300 bg-emerald-50" :
          overall === "onTarget" ? "border-amber-300 bg-amber-50" :
          "border-red-300 bg-red-50"
        }`}>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{bandEmoji(overall)}</span>
            <div>
              <div className="text-sm font-bold text-gray-800">
                {overall === "elite" && "You're crushing it!"}
                {overall === "onTarget" && "You're on pace — keep pushing."}
                {overall === "under" && "Below target — time to pick up the pace."}
                {hoursWorked === 0 && " Start tracking to see your status."}
              </div>
              <div className="text-xs text-gray-500">
                Sales pace: <strong className={bandColor(salesBand)}>{actuals.sales}</strong> / {targets.sales > 0 ? targets.sales.toFixed(1) : "—"} target
                {hoursWorked > 0 && projected.sales > 0 && (
                  <> · Projected EOD: <strong>{projected.sales}</strong> sales</>
                )}
              </div>
            </div>
          </div>
          {bottleneck && bottleneck.ratio < 0.9 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/70 border border-gray-200">
              <span className="text-xs">⚠️</span>
              <span className="text-xs text-gray-700">
                Biggest bottleneck: <strong className="text-red-600">{bottleneck.label}</strong> ({(bottleneck.ratio * 100).toFixed(0)}% of benchmark)
              </span>
            </div>
          )}
        </div>

        {/* ─── Hours Worked + Timer ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">⏱️</span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-gray-400">Hours Worked Today</div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setHoursWorked(Math.max(0, Math.round((hoursWorked - 0.5) * 10) / 10))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(Math.max(0, parseFloat(e.target.value) || 0))}
                    step={0.5}
                    min={0}
                    className="w-20 text-center text-2xl font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-slate-900 outline-none tabular-nums"
                  />
                  <button
                    onClick={() => setHoursWorked(Math.round((hoursWorked + 0.5) * 10) / 10)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-400 ml-1">hrs</span>
                </div>
              </div>
            </div>
            <Timer hoursWorked={hoursWorked} onUpdate={setHoursWorked} />
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="text-xs text-gray-400">
              <div>Target by now: <strong className="text-gray-700">{targets.calls}</strong> calls · <strong className="text-gray-700">{targets.bookings}</strong> bookings · <strong className="text-gray-700">{targets.sales}</strong> sales</div>
            </div>
          </div>
        </div>

        {/* ─── Funnel Visual ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">🔻</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sales Funnel</h2>
              <p className="text-xs text-gray-400">Live progress through each stage</p>
            </div>
          </div>

          {/* Desktop: horizontal funnel */}
          <div className="hidden lg:flex items-stretch gap-0">
            {stages.map((stage, i) => (
              <div key={stage.key} className="flex items-stretch">
                <div className="w-[180px]">
                  <FunnelStageCard {...stage} />
                </div>
                {i < stages.length - 1 && conversions[i] && (
                  <div className="w-[100px] flex items-center justify-center">
                    <ConversionArrow {...conversions[i]} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile/Tablet: vertical funnel */}
          <div className="lg:hidden space-y-2">
            {stages.map((stage, i) => (
              <div key={stage.key}>
                <FunnelStageCard {...stage} />
                {i < stages.length - 1 && conversions[i] && (
                  <div className="flex items-center gap-2 py-2 pl-4">
                    <svg className="w-4 h-4 text-gray-300 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className={`text-xs font-bold tabular-nums ${bandColor(conversions[i].band)}`}>
                      {formatPercent(conversions[i].actual)}
                    </span>
                    <span className="text-[10px] text-gray-400">{conversions[i].label} (bench: {formatPercent(conversions[i].benchmark)})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Input Controls + Projections ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">✏️</span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Update Your Numbers</h2>
                  <p className="text-xs text-gray-400">Tap +/− or type to update live</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <StepperInput label="Calls" emoji="📞" value={actuals.calls} onChange={(v) => updateField("calls", v)} />
                <StepperInput label="Connects" emoji="🔗" value={actuals.connects} onChange={(v) => updateField("connects", v)} />
                <StepperInput label="Bookings" emoji="📅" value={actuals.bookings} onChange={(v) => updateField("bookings", v)} />
                <StepperInput label="Attendance" emoji="🤝" value={actuals.attendance} onChange={(v) => updateField("attendance", v)} />
                <StepperInput label="Sales" emoji="💰" value={actuals.sales} onChange={(v) => updateField("sales", v)} />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setActuals({ calls: 0, connects: 0, bookings: 0, attendance: 0, sales: 0 })}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Reset all
                </button>
              </div>
            </div>
          </div>

          {/* Projections Panel */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">🔮</span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">End-of-Day Projection</h2>
                  <p className="text-xs text-gray-400">If current pace continues (8hr day)</p>
                </div>
              </div>
              {hoursWorked > 0 ? (
                <div className="space-y-3">
                  {[
                    { label: "Calls", emoji: "📞", value: projected.calls },
                    { label: "Connects", emoji: "🔗", value: projected.connects },
                    { label: "Bookings", emoji: "📅", value: projected.bookings },
                    { label: "Attendance", emoji: "🤝", value: projected.attendance },
                    { label: "Sales", emoji: "💰", value: projected.sales },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {item.emoji} {item.label}
                      </span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {item.value % 1 === 0 ? item.value : item.value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 text-center py-6">
                  Start tracking hours to see projections
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Conversion Breakdown Table ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">📐</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Conversion Rates</h2>
              <p className="text-xs text-gray-400">How efficiently you&apos;re moving prospects through the funnel</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-400">Metric</th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-400">Your Rate</th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-400">Benchmark</th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-400">Band</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((step) => (
                  <tr key={step.key} className="border-b border-gray-100">
                    <td className="py-3 text-gray-700 font-medium">
                      {step.label}
                      <div className="text-[10px] text-gray-400">{step.tooltip}</div>
                    </td>
                    <td className={`py-3 text-center font-bold tabular-nums ${bandColor(step.band)}`}>
                      {formatPercent(step.actual)}
                    </td>
                    <td className="py-3 text-center text-gray-500 tabular-nums">
                      {formatPercent(step.benchmark)}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        step.band === "elite" ? "bg-emerald-100 text-emerald-700" :
                        step.band === "onTarget" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {bandLabel(step.band)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Band Reference ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">🎯</span>
            <h2 className="text-sm font-bold text-slate-900">Band Reference</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-base">🟢</span>
              <div>
                <div className="font-bold text-emerald-700">Elite</div>
                <div className="text-emerald-600">≥ 110% of benchmark</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-base">🟡</span>
              <div>
                <div className="font-bold text-amber-700">On Target</div>
                <div className="text-amber-600">90% – 109% of benchmark</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-base">🔴</span>
              <div>
                <div className="font-bold text-red-700">Under</div>
                <div className="text-red-600">&lt; 90% of benchmark</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
