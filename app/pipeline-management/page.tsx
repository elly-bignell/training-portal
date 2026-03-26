'use client';

import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface WeekData {
  week: string;
  label: string;
  closingPct: number;
  pipeline: number;
  cumulativeRevenue: number;
  weekRevenue: number;
  targetHit: boolean;
  sources: { label: string; rev: number; color: string }[];
}

// ── Slider ─────────────────────────────────────────────────────────────────
function Slider({
  label, sublabel, value, min, max, step, onChange, format, accent = '#f97316',
}: {
  label: string; sublabel?: string; value: number; min: number; max: number;
  step: number; onChange: (v: number) => void; format: (v: number) => string; accent?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          {sublabel && <span className="text-xs text-gray-400 ml-1.5">{sublabel}</span>}
        </div>
        <span className="text-base font-black tabular-nums" style={{ color: accent }}>
          {format(value)}
        </span>
      </div>
      <div className="relative flex items-center h-6">
        <div className="w-full h-2 rounded-full bg-gray-100 shadow-inner">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}99, ${accent})` }} />
        </div>
        <div className="absolute h-5 w-5 rounded-full border-2 border-white shadow-md cursor-pointer"
          style={{ left: `calc(${pct}% - 10px)`, background: accent }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer" />
      </div>
    </div>
  );
}

// ── Funnel Arrow ───────────────────────────────────────────────────────────
function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-1 flex-shrink-0">
      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap mb-0.5">{label}</span>
      <svg width="32" height="16" viewBox="0 0 32 16">
        <line x1="2" y1="8" x2="26" y2="8" stroke="#d1d5db" strokeWidth="1.5" />
        <polygon points="24,4 32,8 24,12" fill="#d1d5db" />
      </svg>
    </div>
  );
}

// ── Funnel Box ─────────────────────────────────────────────────────────────
function FunnelBox({ icon, label, value, sub, color, size = 'md' }: {
  icon: string; label: string; value: string; sub: string; color: string; size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = { sm: 'w-20', md: 'w-24', lg: 'w-28' };
  return (
    <div className={`${sizes[size]} flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3`}
      style={{ borderColor: color + '50', background: color + '12' }}>
      <span className="text-xl">{icon}</span>
      <span className="text-lg font-black leading-none" style={{ color }}>{value}</span>
      <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">{label}</span>
      <span className="text-[9px] text-gray-400 text-center leading-tight">{sub}</span>
    </div>
  );
}

// ── Week Card ──────────────────────────────────────────────────────────────
function WeekCard({ data, target }: { data: WeekData; target: number }) {
  const pct = Math.min((data.weekRevenue / target) * 100, 100);
  const hit = data.weekRevenue >= target;

  return (
    <div className="flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300"
      style={{ borderColor: hit ? '#16a34a' : '#e5e7eb', background: '#fff' }}>

      {/* Coloured top band */}
      <div className="h-1.5 w-full" style={{
        background: hit ? '#16a34a' : `linear-gradient(90deg, #f97316 ${pct}%, #f3f4f6 ${pct}%)`
      }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Week label + revenue */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{data.week}</div>
            <div className="text-2xl font-black mt-0.5" style={{ color: hit ? '#16a34a' : '#111827' }}>
              ${data.weekRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-gray-400">weekly revenue</div>
          </div>
          <div className="rounded-xl px-2.5 py-1 text-xs font-black"
            style={{ background: hit ? '#dcfce7' : '#fff7ed', color: hit ? '#15803d' : '#ea580c' }}>
            {pct.toFixed(0)}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-gray-100">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: hit ? '#22c55e' : '#f97316' }} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <div className="text-base font-black text-gray-800">
              {data.pipeline.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">pipeline/wk</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <div className="text-base font-black text-gray-800">
              {data.closingPct.toFixed(0)}%
            </div>
            <div className="text-[10px] text-gray-400 font-medium">of pipe closing</div>
          </div>
        </div>

        {/* Revenue sources */}
        {data.sources.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Revenue sources</div>
            {data.sources.map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <div className="text-[11px] text-gray-500 flex-1 leading-tight">{s.label}</div>
                <div className="text-[11px] font-bold text-gray-700">${s.rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function PipelineManagement() {
  // Conversion rates
  const [callBook, setCallBook] = useState(10);
  const [bookAttend, setBookAttend] = useState(33);
  const [attendPipe, setAttendPipe] = useState(75);
  const [pipeClose, setPipeClose] = useState(50);

  // Close timing (% of pipeline deals that close each week — should sum ~100)
  const [tw1, setTw1] = useState(42);
  const [tw2, setTw2] = useState(32);
  const [tw3, setTw3] = useState(9);
  const [tw4, setTw4] = useState(16);

  // DOD — separate metric: % of closes that happen same day as demo
  const [dod, setDod] = useState(10);

  // Economics
  const [dealMonthly, setDealMonthly] = useState(430);
  const [target, setTarget] = useState(3000);

  const timingSum = tw1 + tw2 + tw3 + tw4;

  const calc = useMemo(() => {
    const wdv = dealMonthly / 4.33;
    const cr = pipeClose / 100;
    const closesNeeded = target / wdv;
    const pipePerWeek = closesNeeded / cr;
    const attendNeeded = pipePerWeek / (attendPipe / 100);
    const bookNeeded = attendNeeded / (bookAttend / 100);
    const callsNeeded = bookNeeded / (callBook / 100);

    // Close timing rates
    const r1 = (tw1 / 100) * cr;
    const r2 = (tw2 / 100) * cr;
    const r3 = (tw3 / 100) * cr;
    const r4 = (tw4 / 100) * cr;

    // DOD is separate — shown as a note
    const dodClosesPerWeek = pipePerWeek * cr * (dod / 100);

    // Week-by-week revenue (pipeline ramp: how much revenue comes in each week)
    // W1: only this week's pipeline × W1 rate
    const revW1 = pipePerWeek * r1 * wdv;
    // W2: this week × r1  +  last week × r2
    const revW2 = pipePerWeek * r1 * wdv + pipePerWeek * r2 * wdv;
    // W3: this × r1  +  -1wk × r2  +  -2wk × r3
    const revW3 = pipePerWeek * r1 * wdv + pipePerWeek * r2 * wdv + pipePerWeek * r3 * wdv;
    // W4+ steady state: all timing layers active
    const revW4 = pipePerWeek * (r1 + r2 + r3 + r4) * wdv;

    const weeks: WeekData[] = [
      {
        week: 'Week 1', label: 'Ramp starts',
        closingPct: (tw1 / 100) * pipeClose,
        pipeline: pipePerWeek,
        cumulativeRevenue: revW1,
        weekRevenue: revW1,
        targetHit: revW1 >= target,
        sources: [
          { label: `W1 pipeline (${tw1}% close W1)`, rev: pipePerWeek * r1 * wdv, color: '#f97316' },
        ],
      },
      {
        week: 'Week 2', label: 'Pipeline builds',
        closingPct: (tw1 / 100 + tw2 / 100) * pipeClose,
        pipeline: pipePerWeek,
        cumulativeRevenue: revW2,
        weekRevenue: revW2,
        targetHit: revW2 >= target,
        sources: [
          { label: `W2 pipeline closes (W1 timing)`, rev: pipePerWeek * r1 * wdv, color: '#f97316' },
          { label: `W1 pipeline closes (W2 timing)`, rev: pipePerWeek * r2 * wdv, color: '#a78bfa' },
        ],
      },
      {
        week: 'Week 3', label: 'Momentum building',
        closingPct: (tw1 / 100 + tw2 / 100 + tw3 / 100) * pipeClose,
        pipeline: pipePerWeek,
        cumulativeRevenue: revW3,
        weekRevenue: revW3,
        targetHit: revW3 >= target,
        sources: [
          { label: `This wk pipeline (W1 timing)`, rev: pipePerWeek * r1 * wdv, color: '#f97316' },
          { label: `-1wk pipeline (W2 timing)`, rev: pipePerWeek * r2 * wdv, color: '#a78bfa' },
          { label: `-2wk pipeline (W3 timing)`, rev: pipePerWeek * r3 * wdv, color: '#34d399' },
        ],
      },
      {
        week: 'Week 4+', label: 'Steady state',
        closingPct: (tw1 / 100 + tw2 / 100 + tw3 / 100 + tw4 / 100) * pipeClose,
        pipeline: pipePerWeek,
        cumulativeRevenue: revW4,
        weekRevenue: revW4,
        targetHit: revW4 >= target,
        sources: [
          { label: `This wk (W1 timing)`, rev: pipePerWeek * r1 * wdv, color: '#f97316' },
          { label: `-1wk (W2 timing)`, rev: pipePerWeek * r2 * wdv, color: '#a78bfa' },
          { label: `-2wk (W3 timing)`, rev: pipePerWeek * r3 * wdv, color: '#34d399' },
          { label: `-3wk+ (W4 timing)`, rev: pipePerWeek * r4 * wdv, color: '#60a5fa' },
        ],
      },
    ];

    return { wdv, closesNeeded, pipePerWeek, attendNeeded, bookNeeded, callsNeeded, weeks, dodClosesPerWeek };
  }, [callBook, bookAttend, attendPipe, pipeClose, tw1, tw2, tw3, tw4, dod, dealMonthly, target]);

  const maxRev = Math.max(...calc.weeks.map(w => w.weekRevenue), target);

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fb', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              Marketing Sweet · Sales Operations
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pipeline Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Adjust the sliders below — all outputs update instantly.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Weekly Target</div>
            <div className="text-3xl font-black text-orange-500">${target.toLocaleString()}</div>
            <div className="text-xs text-gray-400">${(target * 4.33).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* ── INPUT PANEL ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="text-base">🎛️</span>
            <span className="font-bold text-gray-800">Adjust Your Variables</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

            {/* Funnel rates */}
            <div className="p-6 flex flex-col gap-5">
              <div className="text-xs font-bold uppercase tracking-widest text-orange-500">Conversion Funnel</div>
              <Slider label="Call → Booking" value={callBook} min={1} max={40} step={0.5} onChange={setCallBook} format={v => `${v}%`} accent="#f97316" />
              <Slider label="Booking → Attended" value={bookAttend} min={10} max={80} step={1} onChange={setBookAttend} format={v => `${v}%`} accent="#f97316" />
              <Slider label="Attended → Pipeline" value={attendPipe} min={20} max={100} step={1} onChange={setAttendPipe} format={v => `${v}%`} accent="#f97316" />
              <Slider label="Pipeline → Close" value={pipeClose} min={10} max={100} step={1} onChange={setPipeClose} format={v => `${v}%`} accent="#f97316" />
            </div>

            {/* Close timing */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-purple-500">Close Timing</div>
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${Math.abs(timingSum - 100) <= 2 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {timingSum}% total
                </div>
              </div>
              <p className="text-xs text-gray-400 -mt-2 leading-relaxed">
                Of pipeline deals entered, what % close in each week?
              </p>
              <Slider label="Close in Week 1" value={tw1} min={0} max={80} step={1} onChange={setTw1} format={v => `${v}%`} accent="#f97316" />
              <Slider label="Close in Week 2" value={tw2} min={0} max={60} step={1} onChange={setTw2} format={v => `${v}%`} accent="#a78bfa" />
              <Slider label="Close in Week 3" value={tw3} min={0} max={40} step={1} onChange={setTw3} format={v => `${v}%`} accent="#34d399" />
              <Slider label="Close in Week 4+" value={tw4} min={0} max={40} step={1} onChange={setTw4} format={v => `${v}%`} accent="#60a5fa" />
              <div className="mt-1 pt-4 border-t border-gray-100">
                <Slider
                  label="Day-of-Demo close rate"
                  sublabel="(separate metric)"
                  value={dod} min={0} max={50} step={1}
                  onChange={setDod} format={v => `${v}%`} accent="#e11d48"
                />
                <p className="text-[10px] text-gray-400 mt-1.5">
                  ≈ {calc.dodClosesPerWeek.toFixed(1)} same-day closes/wk
                </p>
              </div>
            </div>

            {/* Economics */}
            <div className="p-6 flex flex-col gap-5">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">Deal Economics</div>
              <Slider
                label="Avg Deal Value" sublabel="monthly"
                value={dealMonthly} min={100} max={2000} step={10}
                onChange={setDealMonthly} format={v => `$${v}/mo`} accent="#059669"
              />
              <div className="bg-emerald-50 rounded-xl p-3 text-sm">
                <span className="text-gray-500">Weekly equivalent: </span>
                <span className="font-black text-emerald-700">${(dealMonthly / 4.33).toFixed(2)}</span>
              </div>
              <Slider
                label="Weekly Revenue Target"
                value={target} min={500} max={20000} step={250}
                onChange={setTarget} format={v => `$${v.toLocaleString()}`} accent="#059669"
              />
              <div className="bg-emerald-50 rounded-xl p-3 text-sm">
                <span className="text-gray-500">Monthly equivalent: </span>
                <span className="font-black text-emerald-700">${(target * 4.33).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FUNNEL DIAGRAM ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            📐 Weekly Activity Required to Hit Target
          </div>
          <div className="flex flex-wrap items-center justify-center gap-0">
            <FunnelBox icon="📞" label="Calls" value={calc.callsNeeded.toFixed(0)} sub={`${(calc.callsNeeded / 5).toFixed(0)}/day`} color="#94a3b8" />
            <Arrow label={`${callBook}%`} />
            <FunnelBox icon="📅" label="Bookings" value={calc.bookNeeded.toFixed(0)} sub="per week" color="#f97316" />
            <Arrow label={`${bookAttend}%`} />
            <FunnelBox icon="🎯" label="Attended" value={calc.attendNeeded.toFixed(0)} sub="per week" color="#fb923c" />
            <Arrow label={`${attendPipe}%`} />
            <FunnelBox icon="🔥" label="Pipeline" value={calc.pipePerWeek.toFixed(0)} sub="per week" color="#a78bfa" size="lg" />
            <Arrow label={`${pipeClose}%`} />
            <FunnelBox icon="✅" label="Closes" value={calc.closesNeeded.toFixed(1)} sub={`$${target.toLocaleString()}/wk`} color="#22c55e" size="lg" />
          </div>
        </div>

        {/* ── REVENUE RAMP CHART ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            📈 Revenue Ramp — Week by Week
          </div>
          <p className="text-xs text-gray-400 mb-6">
            As pipeline builds up over weeks, revenue compounds toward target.
          </p>

          {/* Bar chart */}
          <div className="flex items-end gap-4 mb-6" style={{ height: 160 }}>
            {calc.weeks.map((w) => {
              const barPct = (w.weekRevenue / maxRev) * 100;
              const hit = w.weekRevenue >= target;
              return (
                <div key={w.week} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-black" style={{ color: hit ? '#16a34a' : '#f97316' }}>
                    ${w.weekRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="w-full flex items-end" style={{ height: 110 }}>
                    <div
                      className="w-full rounded-t-xl transition-all duration-500"
                      style={{
                        height: `${barPct}%`,
                        background: hit
                          ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                          : 'linear-gradient(180deg, #fb923c 0%, #f97316 100%)',
                        minHeight: 8,
                      }}
                    />
                  </div>
                  <div className="text-xs font-bold text-gray-500">{w.week}</div>
                </div>
              );
            })}
            {/* Target line */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2" style={{ width: 48 }}>
              <div className="text-xs font-bold text-gray-400">${target.toLocaleString()}</div>
              <div className="flex items-center justify-center border-l-2 border-dashed border-gray-300" style={{ height: 110 }}>
                <span className="text-[9px] text-gray-400 font-bold" style={{ writingMode: 'vertical-rl' }}>TARGET</span>
              </div>
              <div className="text-xs text-gray-400">Goal</div>
            </div>
          </div>

          {/* Target hit indicator */}
          {calc.weeks[3].weekRevenue >= target ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium text-center">
              ✅ Hitting target at steady state (Week 4+)
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700 font-medium text-center">
              ⚠️ Adjust your variables — pipeline volume isn&apos;t yet reaching the ${target.toLocaleString()} target at steady state
            </div>
          )}
        </div>

        {/* ── WEEK CARDS ─────────────────────────────────────────────────── */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            🗓️ Week-by-Week Breakdown
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calc.weeks.map((w, i) => (
              <WeekCard key={w.week} data={w} target={target} />
            ))}
          </div>
        </div>

        {/* ── TIMING DISTRIBUTION ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            ⏱️ Close Timing Distribution
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Week 1', pct: tw1, color: '#f97316' },
              { label: 'Week 2', pct: tw2, color: '#a78bfa' },
              { label: 'Week 3', pct: tw3, color: '#34d399' },
              { label: 'Week 4+', pct: tw4, color: '#60a5fa' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="w-16 text-sm font-semibold text-gray-600">{row.label}</div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full flex items-center px-2.5 transition-all duration-300"
                    style={{ width: `${Math.min(row.pct, 100)}%`, background: row.color, minWidth: row.pct > 0 ? 32 : 0 }}>
                    <span className="text-[10px] font-black text-white whitespace-nowrap">{row.pct}%</span>
                  </div>
                </div>
                <div className="w-24 text-xs text-gray-500 text-right">
                  {(calc.pipePerWeek * (row.pct / 100) * (pipeClose / 100)).toFixed(1)} closes/wk
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs text-gray-500">
              Day-of-Demo closes ({dod}%): ≈ <strong>{calc.dodClosesPerWeek.toFixed(1)}</strong> closes/wk — tracked separately to timing above
            </span>
          </div>
          {Math.abs(timingSum - 100) > 2 && (
            <div className="mt-2 text-xs text-red-500 font-semibold">
              ⚠️ Timing % sums to {timingSum}% — ideally should total 100%
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-400 pb-4">
          Marketing Sweet · Pipeline Management · All figures update in real time
        </div>
      </div>
    </div>
  );
}
