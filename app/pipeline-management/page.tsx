'use client';

import { useState, useMemo } from 'react';

// ── Slider ─────────────────────────────────────────────────────────────────
function Slider({
  label, value, min, max, step, onChange, format, accent = '#f97316',
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string; accent?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        <span className="text-sm font-black tabular-nums" style={{ color: accent }}>{format(value)}</span>
      </div>
      <div className="relative flex items-center h-5">
        <div className="w-full h-1.5 rounded-full bg-gray-200">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
        </div>
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)`, background: accent }}
        />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// ── Number Input ───────────────────────────────────────────────────────────
function NumInput({ label, value, onChange, prefix = '' }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400 transition-colors">
        {prefix && <span className="pl-3 text-gray-400 font-semibold text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(Math.max(0, Number(e.target.value)))}
          className="flex-1 px-3 py-2.5 text-base font-black text-gray-800 bg-white outline-none w-full"
        />
      </div>
    </div>
  );
}

// ── Funnel Step ────────────────────────────────────────────────────────────
function FunnelStep({ icon, label, value, sub, color, highlight = false }: {
  icon: string; label: string; value: string; sub?: string; color: string; highlight?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 border-2 transition-all"
      style={{
        borderColor: highlight ? color : color + '40',
        background: highlight ? color + '18' : color + '08',
      }}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-500">{label}</div>
        {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
      </div>
      <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}

// ── Week Column (flowchart) ────────────────────────────────────────────────
function WeekColumn({
  week, closePct, closes, revenue, dealOnDay, isWeek1, color, timingPct,
}: {
  week: string; closes: number; revenue: number;
  dealOnDay?: number; isWeek1?: boolean; color: string; timingPct: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
      {/* Week header */}
      <div
        className="w-full rounded-xl border-2 px-3 py-2 text-center"
        style={{ borderColor: color + '60', background: color + '12' }}
      >
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{week}</div>
        <div className="text-2xl font-black mt-0.5" style={{ color }}>{timingPct}%</div>
        <div className="text-[10px] text-gray-400">close this week</div>
      </div>

      {/* Connector */}
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-4 bg-gray-300" />
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <div className="w-0.5 h-4 bg-gray-300" />
      </div>

      {/* Output */}
      <div
        className="w-full rounded-xl border px-3 py-3 text-center flex flex-col gap-1"
        style={{ borderColor: '#e5e7eb', background: '#fff' }}
      >
        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Closes</div>
        <div className="text-xl font-black" style={{ color }}>{closes.toFixed(1)}</div>
        <div className="text-sm font-bold text-gray-700">${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        {isWeek1 && dealOnDay !== undefined && dealOnDay > 0 && (
          <div className="mt-1 pt-1 border-t border-gray-100">
            <div className="text-[10px] text-rose-500 font-semibold">
              Deal on Day: {dealOnDay.toFixed(1)}
            </div>
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

  // Close timing (% of total closes that land each week)
  const [tw1, setTw1] = useState(42);
  const [tw2, setTw2] = useState(32);
  const [tw3, setTw3] = useState(9);
  const [tw4, setTw4] = useState(16);

  // Deal on Day — % of Week 1 closes that happen on the day of the meeting
  const [dod, setDod] = useState(10);

  // Deal economics
  const [dealMonthly, setDealMonthly] = useState(430);
  const [weeklyTarget, setWeeklyTarget] = useState(3000);

  // ── Calculator input ──────────────────────────────────────────────────
  const [inputCalls, setInputCalls] = useState(200);

  const timingSum = tw1 + tw2 + tw3 + tw4;

  // ── CALCULATOR: from calls → what outcomes? ───────────────────────────
  const calc = useMemo(() => {
    const wdv = dealMonthly / 4.33;
    const bookings = inputCalls * (callBook / 100);
    const attended = bookings * (bookAttend / 100);
    const pipeline = attended * (attendPipe / 100);
    const totalCloses = pipeline * (pipeClose / 100);

    // Split closes by week timing
    const w1Closes = totalCloses * (tw1 / 100);
    const w2Closes = totalCloses * (tw2 / 100);
    const w3Closes = totalCloses * (tw3 / 100);
    const w4Closes = totalCloses * (tw4 / 100);

    // Deal on Day = % of Week 1 closes on day of meeting
    const dodCloses = w1Closes * (dod / 100);

    const w1Rev = w1Closes * wdv;
    const w2Rev = w2Closes * wdv;
    const w3Rev = w3Closes * wdv;
    const w4Rev = w4Closes * wdv;
    const totalRev = (w1Closes + w2Closes + w3Closes + w4Closes) * wdv;

    // ── TO HIT TARGET: how many calls needed per week? ──────────────────
    // At steady state, each week's meetings contribute to THIS week's revenue
    // from: this week's W1 closes + last week's W2 + 2wks ago W3 + 3+ wks ago W4
    // So calls needed to generate $target/wk at steady state:
    // revenue/call = wdv × (pipeClose/100) × (attendPipe/100) × (bookAttend/100) × (callBook/100)
    // But at steady state all timing layers are active so full close rate applies
    const revPerCall = wdv * (callBook / 100) * (bookAttend / 100) * (attendPipe / 100) * (pipeClose / 100);
    const callsForTarget = weeklyTarget / revPerCall;
    const bookingsForTarget = callsForTarget * (callBook / 100);
    const attendedForTarget = bookingsForTarget * (bookAttend / 100);
    const pipelineForTarget = attendedForTarget * (attendPipe / 100);

    return {
      wdv,
      bookings, attended, pipeline, totalCloses,
      w1Closes, w2Closes, w3Closes, w4Closes,
      dodCloses,
      w1Rev, w2Rev, w3Rev, w4Rev, totalRev,
      callsForTarget, bookingsForTarget, attendedForTarget, pipelineForTarget,
      closesForTarget: pipelineForTarget * (pipeClose / 100),
    };
  }, [inputCalls, callBook, bookAttend, attendPipe, pipeClose, tw1, tw2, tw3, tw4, dod, dealMonthly, weeklyTarget]);

  const weeks = [
    { week: 'Week 1', timingPct: tw1, closes: calc.w1Closes, revenue: calc.w1Rev, color: '#f97316', isWeek1: true, dealOnDay: calc.dodCloses },
    { week: 'Week 2', timingPct: tw2, closes: calc.w2Closes, revenue: calc.w2Rev, color: '#a78bfa', isWeek1: false },
    { week: 'Week 3', timingPct: tw3, closes: calc.w3Closes, revenue: calc.w3Rev, color: '#34d399', isWeek1: false },
    { week: 'Week 4+', timingPct: tw4, closes: calc.w4Closes, revenue: calc.w4Rev, color: '#60a5fa', isWeek1: false },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Marketing Sweet · Sales Operations
            </div>
            <h1 className="text-xl font-black text-gray-900 mt-0.5">Pipeline Management</h1>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Weekly Target</div>
            <div className="text-2xl font-black text-orange-500">${weeklyTarget.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* ── ROW 1: Conversion rates + timing ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Conversion funnel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <div className="text-xs font-black uppercase tracking-widest text-orange-500">
              Conversion Funnel
            </div>
            <Slider label="Call → Booking" value={callBook} min={1} max={40} step={0.5} onChange={setCallBook} format={v => `${v}%`} accent="#f97316" />
            <Slider label="Booking → Attended" value={bookAttend} min={10} max={80} step={1} onChange={setBookAttend} format={v => `${v}%`} accent="#f97316" />
            <Slider label="Attended → Pipeline" value={attendPipe} min={20} max={100} step={1} onChange={setAttendPipe} format={v => `${v}%`} accent="#f97316" />
            <Slider label="Pipeline → Close" value={pipeClose} min={10} max={100} step={1} onChange={setPipeClose} format={v => `${v}%`} accent="#f97316" />
          </div>

          {/* Close timing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-widest text-purple-500">
                Close Timing
              </div>
              <div
                className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{
                  background: Math.abs(timingSum - 100) <= 1 ? '#dcfce7' : '#fff7ed',
                  color: Math.abs(timingSum - 100) <= 1 ? '#15803d' : '#c2410c',
                }}
              >
                {timingSum}% total
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed -mt-1">
              Of all closes from a batch of meetings, what % land in each week?
            </p>
            <Slider label="Week 1" value={tw1} min={0} max={80} step={1} onChange={setTw1} format={v => `${v}%`} accent="#f97316" />
            <Slider label="Week 2" value={tw2} min={0} max={60} step={1} onChange={setTw2} format={v => `${v}%`} accent="#a78bfa" />
            <Slider label="Week 3" value={tw3} min={0} max={40} step={1} onChange={setTw3} format={v => `${v}%`} accent="#34d399" />
            <Slider label="Week 4+" value={tw4} min={0} max={40} step={1} onChange={setTw4} format={v => `${v}%`} accent="#60a5fa" />
          </div>

          {/* Deal economics + DOD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <div className="text-xs font-black uppercase tracking-widest text-emerald-600">
              Deal Economics
            </div>
            <Slider
              label="Avg Deal Value (monthly)"
              value={dealMonthly} min={100} max={2000} step={10}
              onChange={setDealMonthly} format={v => `$${v}/mo`} accent="#059669"
            />
            <div className="bg-gray-50 rounded-xl px-3 py-2 text-sm">
              <span className="text-gray-500 text-xs">Weekly: </span>
              <span className="font-black text-emerald-700">${(dealMonthly / 4.33).toFixed(2)}</span>
            </div>
            <Slider
              label="Weekly Revenue Target"
              value={weeklyTarget} min={500} max={20000} step={250}
              onChange={setWeeklyTarget} format={v => `$${v.toLocaleString()}`} accent="#059669"
            />
            <div className="pt-3 mt-1 border-t border-gray-100">
              <Slider
                label="Deal on Day %"
                value={dod} min={0} max={50} step={1}
                onChange={setDod} format={v => `${v}%`} accent="#e11d48"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                % of Week 1 closes that occur on the day of the meeting
              </p>
            </div>
          </div>
        </div>

        {/* ── ROW 2: CALCULATOR ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">
              🧮 Pipeline Calculator — Enter Your Calls
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Input calls made → see exactly what flows through the funnel and when it closes
            </p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input */}
              <div className="flex flex-col gap-4">
                <div
                  className="rounded-xl border-2 border-orange-300 bg-orange-50 p-4"
                >
                  <NumInput label="Calls made" value={inputCalls} onChange={setInputCalls} />
                </div>
                <div className="flex flex-col gap-2.5">
                  <FunnelStep icon="📞" label="Calls" value={inputCalls.toLocaleString()} color="#94a3b8" highlight />
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-0.5 h-4 bg-gray-300 ml-3" />
                    <span className="text-[10px] text-orange-500 font-bold">{callBook}% book</span>
                  </div>
                  <FunnelStep icon="📅" label="Bookings" value={calc.bookings.toFixed(0)} color="#f97316" />
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-0.5 h-4 bg-gray-300 ml-3" />
                    <span className="text-[10px] text-orange-400 font-bold">{bookAttend}% attend</span>
                  </div>
                  <FunnelStep icon="🎯" label="Meetings Attended" value={calc.attended.toFixed(0)} color="#fb923c" highlight />
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-0.5 h-4 bg-gray-300 ml-3" />
                    <span className="text-[10px] text-purple-500 font-bold">{attendPipe}% enter pipe</span>
                  </div>
                  <FunnelStep icon="🔥" label="Added to Pipeline" value={calc.pipeline.toFixed(0)} color="#a78bfa" highlight />
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-0.5 h-4 bg-gray-300 ml-3" />
                    <span className="text-[10px] text-emerald-600 font-bold">{pipeClose}% close rate</span>
                  </div>
                  <FunnelStep icon="✅" label="Total Closes" value={calc.totalCloses.toFixed(1)} sub={`$${calc.totalRev.toLocaleString(undefined, { maximumFractionDigits: 0 })} total revenue`} color="#22c55e" highlight />
                </div>
              </div>

              {/* Revenue summary */}
              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Revenue split by close week
                </div>
                {weeks.map(w => (
                  <div key={w.week}
                    className="flex items-center gap-3 rounded-xl p-3 border"
                    style={{ borderColor: w.color + '40', background: w.color + '0c' }}
                  >
                    <div className="w-16 text-xs font-bold text-gray-600">{w.week}</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${calc.totalRev > 0 ? (w.revenue / calc.totalRev) * 100 : 0}%`,
                          background: w.color,
                          minWidth: w.revenue > 0 ? 4 : 0,
                        }}
                      />
                    </div>
                    <div className="text-xs font-black w-20 text-right" style={{ color: w.color }}>
                      ${w.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-gray-400 w-16 text-right">
                      {w.closes.toFixed(1)} closes
                    </div>
                  </div>
                ))}

                <div
                  className="mt-1 rounded-xl p-4 border-2 text-center"
                  style={{ borderColor: '#22c55e60', background: '#f0fdf4' }}
                >
                  <div className="text-xs text-gray-500 font-semibold">Total Revenue from {inputCalls.toLocaleString()} calls</div>
                  <div className="text-3xl font-black text-emerald-600 mt-1">
                    ${calc.totalRev.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">across all close weeks</div>
                </div>

                {/* DOD callout */}
                {calc.dodCloses > 0 && (
                  <div className="rounded-xl p-3 border border-rose-200 bg-rose-50 flex items-center gap-3">
                    <span className="text-lg">⚡</span>
                    <div>
                      <div className="text-xs font-bold text-rose-600">Deal on Day</div>
                      <div className="text-xs text-rose-500">
                        {calc.dodCloses.toFixed(1)} closes expected on the day of the meeting
                        <span className="text-rose-400"> ({dod}% of Week 1 closes)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: FLOWCHART ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">
              📊 Close Timing Flowchart
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {calc.attended.toFixed(0)} meetings attended → {calc.pipeline.toFixed(0)} enter pipeline → {calc.totalCloses.toFixed(1)} total closes — split across weeks as below
            </p>
          </div>
          <div className="p-6">
            {/* Meeting attended source */}
            <div className="flex justify-center mb-2">
              <div
                className="rounded-xl border-2 px-6 py-3 text-center"
                style={{ borderColor: '#f9731660', background: '#fff7ed' }}
              >
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Meetings Attended</div>
                <div className="text-2xl font-black text-orange-500">{calc.attended.toFixed(0)}</div>
                <div className="text-[10px] text-gray-400">{attendPipe}% → {calc.pipeline.toFixed(0)} pipeline · {pipeClose}% close rate · {calc.totalCloses.toFixed(1)} total closes</div>
              </div>
            </div>

            {/* Curved arrows row */}
            <div className="relative flex justify-center mb-2">
              <svg
                viewBox="0 0 700 60"
                className="w-full max-w-2xl"
                style={{ height: 60 }}
                preserveAspectRatio="none"
              >
                {/* 4 arcs from centre-ish to each week column */}
                {[
                  { x: 175, color: '#f97316' },
                  { x: 308, color: '#a78bfa' },
                  { x: 441, color: '#34d399' },
                  { x: 574, color: '#60a5fa' },
                ].map(({ x, color }, i) => (
                  <path
                    key={i}
                    d={`M 350 0 Q ${(350 + x) / 2} ${30 + i * 5} ${x} 58`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    opacity="0.7"
                  />
                ))}
              </svg>
            </div>

            {/* Week columns */}
            <div className="grid grid-cols-4 gap-4">
              {weeks.map(w => (
                <WeekColumn
                  key={w.week}
                  week={w.week}
                  timingPct={w.timingPct}
                  closes={w.closes}
                  revenue={w.revenue}
                  dealOnDay={w.dealOnDay}
                  isWeek1={w.isWeek1}
                  color={w.color}
                />
              ))}
            </div>

            {timingSum !== 100 && (
              <div className="mt-4 text-center text-xs text-amber-600 font-semibold">
                ⚠ Timing %s sum to {timingSum}% — adjust sliders to reach 100%
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 4: WHAT DO WE NEED TO HIT TARGET ──────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
            🎯 To Hit ${weeklyTarget.toLocaleString()}/wk Target — Weekly Minimums Required
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Calls / week', value: calc.callsForTarget.toFixed(0), icon: '📞', color: '#94a3b8' },
              { label: 'Bookings', value: calc.bookingsForTarget.toFixed(0), icon: '📅', color: '#f97316' },
              { label: 'Attended', value: calc.attendedForTarget.toFixed(0), icon: '🎯', color: '#fb923c' },
              { label: 'Into Pipeline', value: calc.pipelineForTarget.toFixed(0), icon: '🔥', color: '#a78bfa' },
              { label: 'Closes', value: calc.closesForTarget.toFixed(1), icon: '✅', color: '#22c55e' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center rounded-xl border py-4 gap-1"
                style={{ borderColor: s.color + '40', background: s.color + '08' }}>
                <span className="text-xl">{s.icon}</span>
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-gray-500 font-semibold text-center">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            At steady state (Week 4+) with current conversion rates — these are the weekly inputs required.
          </p>
        </div>

        <div className="text-center text-xs text-gray-400 pb-4">
          Marketing Sweet · Pipeline Management · All figures update in real time
        </div>
      </div>
    </div>
  );
}
