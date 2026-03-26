'use client';

import { useState, useMemo } from 'react';

// ─── Slider Input Component ────────────────────────────────────────────────
function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  color = '#f97316',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  color?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{format(value)}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="w-full h-1.5 rounded-full bg-gray-700">
          <div
            className="h-1.5 rounded-full transition-all duration-100"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-5"
        />
      </div>
    </div>
  );
}

// ─── Funnel Stage ──────────────────────────────────────────────────────────
function FunnelStage({
  label,
  value,
  subtitle,
  color,
  icon,
  isLast,
  rate,
}: {
  label: string;
  value: number;
  subtitle: string;
  color: string;
  icon: string;
  isLast?: boolean;
  rate?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-xl p-4 flex flex-col items-center gap-1 w-full max-w-[140px] border"
        style={{ borderColor: color + '40', background: color + '15' }}
      >
        <span className="text-2xl">{icon}</span>
        <span className="text-xl font-black" style={{ color }}>
          {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        <span className="text-xs font-semibold text-white text-center leading-tight">{label}</span>
        <span className="text-[10px] text-gray-400 text-center leading-tight">{subtitle}</span>
      </div>
      {!isLast && (
        <div className="flex flex-col items-center my-1">
          <div className="text-[10px] text-gray-500">{rate}</div>
          <div className="text-gray-600 text-lg leading-none">↓</div>
        </div>
      )}
    </div>
  );
}

// ─── Week Pipeline Card ────────────────────────────────────────────────────
function WeekCard({
  week,
  pipeline,
  closes,
  revenue,
  target,
  isActive,
  breakdown,
}: {
  week: string;
  pipeline: number;
  closes: number;
  revenue: number;
  target: number;
  isActive: boolean;
  breakdown: { label: string; closes: number; rev: number; color: string }[];
}) {
  const pct = Math.min((revenue / target) * 100, 100);
  const hitTarget = revenue >= target;

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300"
      style={{
        borderColor: hitTarget ? '#22c55e40' : isActive ? '#f9731640' : '#ffffff15',
        background: hitTarget ? '#16a34a08' : isActive ? '#f9731608' : '#ffffff05',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">
            {week === 'Week 4+' ? 'Steady State' : week}
          </div>
          <div
            className="text-2xl font-black mt-0.5"
            style={{ color: hitTarget ? '#22c55e' : isActive ? '#f97316' : '#94a3b8' }}
          >
            ${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">weekly revenue</div>
        </div>
        <div
          className="rounded-lg px-2.5 py-1 text-xs font-bold"
          style={{
            background: hitTarget ? '#22c55e20' : '#f9731620',
            color: hitTarget ? '#22c55e' : '#f97316',
          }}
        >
          {((revenue / target) * 100).toFixed(0)}% of target
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: hitTarget ? '#22c55e' : 'linear-gradient(90deg, #f97316, #fb923c)',
          }}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-2.5">
          <div className="text-xs text-gray-500 mb-0.5">Pipeline in</div>
          <div className="text-base font-bold text-white">
            {pipeline.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-gray-600">deals/week</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <div className="text-xs text-gray-500 mb-0.5">Total closes</div>
          <div className="text-base font-bold text-white">
            {closes.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <div className="text-[10px] text-gray-600">deals closing</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-1.5">
        <div className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Close sources</div>
        {breakdown.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
            <div className="text-[11px] text-gray-400 flex-1">{b.label}</div>
            <div className="text-[11px] font-semibold text-white">
              {b.closes.toFixed(1)}
            </div>
            <div className="text-[11px] text-gray-500">
              ${b.rev.toFixed(0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function PipelineManagement() {
  // ── Funnel conversion rates ──
  const [callToBooking, setCallToBooking] = useState(10);
  const [bookingToAttended, setBookingToAttended] = useState(33);
  const [attendedToPipeline, setAttendedToPipeline] = useState(75);
  const [pipelineToClose, setPipelineToClose] = useState(50);

  // ── Close timing distribution ──
  const [closeWeek1, setCloseWeek1] = useState(42);
  const [closeWeek2, setCloseWeek2] = useState(32);
  const [closeWeek3, setCloseWeek3] = useState(9);
  const [closeWeek4Plus, setCloseWeek4Plus] = useState(16);
  const [sameDayPct, setSameDayPct] = useState(10);

  // ── Deal economics ──
  const [dealValueMonthly, setDealValueMonthly] = useState(430);
  const [weeklyTarget, setWeeklyTarget] = useState(3000);

  const calc = useMemo(() => {
    const wdv = dealValueMonthly / 4.33;

    const closesNeededSteady = weeklyTarget / wdv;
    const pipelinePerWeek = closesNeededSteady / (pipelineToClose / 100);
    const attendedNeeded = pipelinePerWeek / (attendedToPipeline / 100);
    const bookingsNeeded = attendedNeeded / (bookingToAttended / 100);
    const callsNeeded = bookingsNeeded / (callToBooking / 100);
    const callsPerDay = callsNeeded / 5;

    const closeRate = pipelineToClose / 100;
    const w1r = closeWeek1 / 100;
    const w2r = closeWeek2 / 100;
    const w3r = closeWeek3 / 100;
    const w4r = closeWeek4Plus / 100;
    const sameDayRate = (sameDayPct / 100) * w1r;
    const w1RestRate = w1r - sameDayRate;

    const weeks = [
      {
        week: 'Week 1',
        pipeline: pipelinePerWeek,
        breakdown: [
          { label: 'Same-day closes', rate: sameDayRate, color: '#f97316' },
          { label: 'This week (W1)', rate: w1RestRate, color: '#fb923c' },
        ],
      },
      {
        week: 'Week 2',
        pipeline: pipelinePerWeek,
        breakdown: [
          { label: 'Same-day closes (W2)', rate: sameDayRate, color: '#f97316' },
          { label: 'W2 pipeline (W1 timing)', rate: w1RestRate, color: '#fb923c' },
          { label: 'W1 pipeline (W2 timing)', rate: w2r, color: '#a78bfa' },
        ],
      },
      {
        week: 'Week 3',
        pipeline: pipelinePerWeek,
        breakdown: [
          { label: 'Same-day closes (W3)', rate: sameDayRate, color: '#f97316' },
          { label: 'W3 pipeline (W1 timing)', rate: w1RestRate, color: '#fb923c' },
          { label: 'W2 pipeline (W2 timing)', rate: w2r, color: '#a78bfa' },
          { label: 'W1 pipeline (W3 timing)', rate: w3r, color: '#34d399' },
        ],
      },
      {
        week: 'Week 4+',
        pipeline: pipelinePerWeek,
        breakdown: [
          { label: 'Same-day closes', rate: sameDayRate, color: '#f97316' },
          { label: 'Current wk (W1 timing)', rate: w1RestRate, color: '#fb923c' },
          { label: '-1 wk (W2 timing)', rate: w2r, color: '#a78bfa' },
          { label: '-2 wks (W3 timing)', rate: w3r, color: '#34d399' },
          { label: '-3+ wks (W4 timing)', rate: w4r, color: '#60a5fa' },
        ],
      },
    ];

    const cumulativeRates = [w1r, w1r + w2r, w1r + w2r + w3r, w1r + w2r + w3r + w4r];

    const weekData = weeks.map((w, i) => {
      const totalCloseRate = cumulativeRates[i] * closeRate;
      const closes = pipelinePerWeek * totalCloseRate;
      const revenue = closes * wdv;
      const bds = w.breakdown.map(b => ({
        label: b.label,
        closes: pipelinePerWeek * b.rate * closeRate,
        rev: pipelinePerWeek * b.rate * closeRate * wdv,
        color: b.color,
      }));
      return { week: w.week, pipeline: pipelinePerWeek, closes, revenue, breakdown: bds };
    });

    return { callsNeeded, bookingsNeeded, attendedNeeded, pipelinePerWeek, closesNeededSteady, callsPerDay, wdv, weekData };
  }, [callToBooking, bookingToAttended, attendedToPipeline, pipelineToClose, closeWeek1, closeWeek2, closeWeek3, closeWeek4Plus, sameDayPct, dealValueMonthly, weeklyTarget]);

  const totalTimingPct = closeWeek1 + closeWeek2 + closeWeek3 + closeWeek4Plus;

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: '#f9731620', border: '1px solid #f9731640' }}>
                  📊
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                  Marketing Sweet — Sales Operations
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">Pipeline Management</h1>
              <p className="text-gray-400 mt-1 text-sm max-w-xl">
                Real-time model showing how pipeline should be constructed each week to hit revenue targets.
                Adjust any parameter — all outputs update instantly.
              </p>
            </div>
            <div className="rounded-xl border px-5 py-3 text-right hidden md:block" style={{ borderColor: '#f9731640', background: '#f9731610' }}>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Weekly Target</div>
              <div className="text-2xl font-black" style={{ color: '#f97316' }}>${weeklyTarget.toLocaleString()}</div>
              <div className="text-xs text-gray-500">${(weeklyTarget * 4.33).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Funnel Rates */}
          <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ borderColor: '#f9731630', background: '#f9731608' }}>
            <div className="flex items-center gap-2">
              <span className="text-base">🔄</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400">Funnel Conversion Rates</h2>
            </div>
            <SliderInput label="Call → Booking" value={callToBooking} min={1} max={40} step={0.5} onChange={setCallToBooking} format={v => `${v}%`} />
            <SliderInput label="Booking → Attended" value={bookingToAttended} min={10} max={80} step={1} onChange={setBookingToAttended} format={v => `${v}%`} />
            <SliderInput label="Attended → Pipeline" value={attendedToPipeline} min={20} max={100} step={1} onChange={setAttendedToPipeline} format={v => `${v}%`} />
            <SliderInput label="Pipeline → Close" value={pipelineToClose} min={10} max={100} step={1} onChange={setPipelineToClose} format={v => `${v}%`} />
          </div>

          {/* Close Timing */}
          <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ borderColor: '#a78bfa30', background: '#a78bfa08' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400">Close Timing</h2>
              </div>
              <div className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: Math.abs(totalTimingPct - 100) < 2 ? '#22c55e20' : '#ef444420', color: Math.abs(totalTimingPct - 100) < 2 ? '#22c55e' : '#ef4444' }}>
                Total: {totalTimingPct}%
              </div>
            </div>
            <SliderInput label="Same-day close (of Week 1)" value={sameDayPct} min={0} max={50} step={1} onChange={setSameDayPct} format={v => `${v}%`} color="#f97316" />
            <SliderInput label="Close in Week 1" value={closeWeek1} min={0} max={80} step={1} onChange={setCloseWeek1} format={v => `${v}%`} color="#fb923c" />
            <SliderInput label="Close in Week 2" value={closeWeek2} min={0} max={60} step={1} onChange={setCloseWeek2} format={v => `${v}%`} color="#a78bfa" />
            <SliderInput label="Close in Week 3" value={closeWeek3} min={0} max={40} step={1} onChange={setCloseWeek3} format={v => `${v}%`} color="#34d399" />
            <SliderInput label="Close in Week 4+" value={closeWeek4Plus} min={0} max={40} step={1} onChange={setCloseWeek4Plus} format={v => `${v}%`} color="#60a5fa" />
          </div>

          {/* Deal Economics */}
          <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ borderColor: '#34d39930', background: '#34d39908' }}>
            <div className="flex items-center gap-2">
              <span className="text-base">💰</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Deal Economics</h2>
            </div>
            <SliderInput label="Average Deal Value (monthly)" value={dealValueMonthly} min={100} max={2000} step={10} onChange={setDealValueMonthly} format={v => `$${v}/mo`} color="#34d399" />
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Weekly equivalent</div>
              <div className="text-lg font-black text-emerald-400">
                ${(dealValueMonthly / 4.33).toFixed(2)}<span className="text-xs text-gray-500 font-normal">/wk</span>
              </div>
            </div>
            <SliderInput label="Weekly Revenue Target" value={weeklyTarget} min={500} max={20000} step={250} onChange={setWeeklyTarget} format={v => `$${v.toLocaleString()}`} color="#34d399" />
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Monthly equivalent</div>
              <div className="text-lg font-black text-emerald-400">
                ${(weeklyTarget * 4.33).toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-xs text-gray-500 font-normal">/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Funnel Visualisation */}
        <div className="rounded-2xl border p-6" style={{ borderColor: '#ffffff15', background: '#ffffff05' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">
            📐 Weekly Funnel — What You Need to Hit Target
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center">
            {[
              { label: 'Calls', value: calc.callsNeeded, subtitle: `${calc.callsPerDay.toFixed(0)}/day`, color: '#94a3b8', icon: '📞', rate: `${callToBooking}% booking rate` },
              { label: 'Bookings', value: calc.bookingsNeeded, subtitle: 'per week needed', color: '#f97316', icon: '📅', rate: `${bookingToAttended}% show rate` },
              { label: 'Attended', value: calc.attendedNeeded, subtitle: 'appointments', color: '#fb923c', icon: '🎯', rate: `${attendedToPipeline}% to pipeline` },
              { label: 'Pipeline', value: calc.pipelinePerWeek, subtitle: 'per week', color: '#a78bfa', icon: '🔥', rate: `${pipelineToClose}% close rate` },
              { label: 'Closes', value: calc.closesNeededSteady, subtitle: `$${(calc.wdv * calc.closesNeededSteady).toFixed(0)}/wk revenue`, color: '#22c55e', icon: '✅', isLast: true },
            ].map((stage, i) => (
              <div key={stage.label} className="flex flex-col md:flex-row items-center w-full md:w-auto">
                <FunnelStage {...stage} />
                {i < 4 && (
                  <>
                    <div className="md:hidden flex flex-col items-center text-gray-600 my-0.5">
                      <div className="text-[10px] text-gray-500">{stage.rate}</div>
                      <div className="text-base">↓</div>
                    </div>
                    <div className="hidden md:flex flex-col items-center mx-2 min-w-[60px]">
                      <div className="text-[10px] text-gray-500 text-center leading-tight mb-0.5">{stage.rate}</div>
                      <div className="text-gray-600 text-base">→</div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
            {[
              { label: 'Calls / Day', value: calc.callsPerDay.toFixed(0), sub: '(5-day week)', color: '#94a3b8' },
              { label: 'Pipeline / Week', value: calc.pipelinePerWeek.toFixed(0), sub: 'deals needed', color: '#a78bfa' },
              { label: 'Deal Value (weekly)', value: `$${calc.wdv.toFixed(2)}`, sub: `$${dealValueMonthly}/mo`, color: '#34d399' },
              { label: 'Closes / Week', value: calc.closesNeededSteady.toFixed(1), sub: 'at steady state', color: '#22c55e' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</div>
                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Week by Week */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
              📈 Week-by-Week Pipeline Flow — Revenue Ramp
            </h2>
            <div className="text-xs text-gray-600">
              Assumes {calc.pipelinePerWeek.toFixed(0)} pipeline deals enter each week
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {calc.weekData.map((w, i) => (
              <WeekCard key={w.week} week={w.week} pipeline={w.pipeline} closes={w.closes} revenue={w.revenue} target={weeklyTarget} isActive={i === 0} breakdown={w.breakdown} />
            ))}
          </div>

          {/* Bar chart */}
          <div className="mt-5 rounded-2xl border p-5" style={{ borderColor: '#ffffff15', background: '#ffffff05' }}>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-4">Revenue Ramp to Target</div>
            <div className="flex items-end gap-3 h-28">
              {calc.weekData.map((w, i) => {
                const barH = Math.min((w.revenue / weeklyTarget) * 100, 100);
                const hitTarget = w.revenue >= weeklyTarget;
                return (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-bold" style={{ color: hitTarget ? '#22c55e' : '#f97316' }}>
                      ${w.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                      <div
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{ height: `${barH}%`, background: hitTarget ? 'linear-gradient(180deg, #22c55e, #16a34a)' : 'linear-gradient(180deg, #f97316, #ea580c)', minHeight: '4px' }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-500">{w.week}</div>
                  </div>
                );
              })}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className="text-xs font-bold text-gray-400">${weeklyTarget.toLocaleString()}</div>
                <div className="border-l-2 border-dashed flex items-center justify-center" style={{ height: '80px', borderColor: '#ffffff30' }}>
                  <span className="text-[9px] text-gray-600 rotate-90 whitespace-nowrap">TARGET</span>
                </div>
                <div className="text-[10px] text-gray-600">Goal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Timing Distribution */}
        <div className="rounded-2xl border p-5" style={{ borderColor: '#ffffff15', background: '#ffffff05' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
            ⏱ Close Timing Distribution — Of All Closes
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Same Day (of W1)', pct: (closeWeek1 * sameDayPct) / 100, color: '#f97316', note: `${sameDayPct}% of Week 1` },
              { label: 'Week 1 Total', pct: closeWeek1, color: '#fb923c', note: 'incl. same-day' },
              { label: 'Week 2', pct: closeWeek2, color: '#a78bfa', note: '' },
              { label: 'Week 3', pct: closeWeek3, color: '#34d399', note: '' },
              { label: 'Week 4+', pct: closeWeek4Plus, color: '#60a5fa', note: '' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="w-28 text-xs text-gray-400 flex-shrink-0">{row.label}</div>
                <div className="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300 flex items-center px-2" style={{ width: `${Math.min(row.pct, 100)}%`, background: row.color, minWidth: row.pct > 0 ? '20px' : '0' }}>
                    <span className="text-[9px] font-bold text-white/80 whitespace-nowrap">{row.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 w-24 text-right">{row.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500">
            Based on analysis of 31 deals. Pipeline-to-close rate: {pipelineToClose}% •
            Total timing: {totalTimingPct}%
            {Math.abs(totalTimingPct - 100) > 2 && (
              <span className="text-red-400 font-semibold"> ⚠ Timing % doesn&apos;t sum to 100</span>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-700 pb-4">
          Marketing Sweet — Pipeline Management Model • All calculations update in real-time
        </div>
      </div>
    </div>
  );
}
