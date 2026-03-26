'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

type EntryType = 'Added' | 'Won' | 'Lost';
type WeekBucket = 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4+';

interface PipeEntry {
  id: string;
  Date: string;
  Type: EntryType;
  Units: number;
  Value: number;
  CloseDate?: string;
  WeekBucket?: WeekBucket;
  Notes?: string;
}

function getWeekBucket(closeDate: string): WeekBucket {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const close = new Date(closeDate);
  close.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((close.getTime() - monday.getTime()) / 86400000);
  if (diffDays < 7) return 'Week 1';
  if (diffDays < 14) return 'Week 2';
  if (diffDays < 21) return 'Week 3';
  return 'Week 4+';
}

function fmt$(n: number) {
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function Slider({ label, value, min, max, step, onChange, format, accent = '#f97316' }: {
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
        <div className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)`, background: accent }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer" />
      </div>
    </div>
  );
}

function FunnelStep({ icon, label, value, sub, color, highlight }: {
  icon: string; label: string; value: string; sub?: string; color: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 border-2"
      style={{ borderColor: highlight ? color : color + '40', background: highlight ? color + '18' : color + '08' }}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-500">{label}</div>
        {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
      </div>
      <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}

function WeekColumn({ week, timingPct, closes, revenue, pipeValue, dealOnDay, isWeek1, color }: {
  week: string; timingPct: number; closes: number; revenue: number; pipeValue: number;
  dealOnDay?: number; isWeek1?: boolean; color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
      <div className="w-full rounded-xl border-2 px-3 py-2 text-center"
        style={{ borderColor: color + '60', background: color + '12' }}>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{week}</div>
        <div className="text-2xl font-black mt-0.5" style={{ color }}>{timingPct}%</div>
        <div className="text-[10px] text-gray-400">of closes land here</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-4 bg-gray-300" />
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <div className="w-0.5 h-4 bg-gray-300" />
      </div>
      <div className="w-full rounded-xl border px-3 py-3 flex flex-col gap-2 bg-white" style={{ borderColor: '#e5e7eb' }}>
        <div className="text-center">
          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Closes</div>
          <div className="text-lg font-black" style={{ color }}>{closes.toFixed(1)}</div>
          <div className="text-sm font-bold text-gray-700">{fmt$(revenue)}</div>
        </div>
        <div className="border-t border-gray-100 pt-2 text-center">
          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">In Pipe</div>
          <div className="text-sm font-bold text-gray-500">{fmt$(pipeValue)}</div>
        </div>
        {isWeek1 && dealOnDay !== undefined && dealOnDay > 0 && (
          <div className="border-t border-gray-100 pt-1 text-center">
            <div className="text-[10px] text-rose-500 font-semibold">⚡ DOD: {dealOnDay.toFixed(1)} closes</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelineManagement() {
  const [callBook, setCallBook] = useState(10);
  const [bookAttend, setBookAttend] = useState(33);
  const [attendPipe, setAttendPipe] = useState(75);
  const [pipeClose, setPipeClose] = useState(50);
  const [tw1, setTw1] = useState(42);
  const [tw2, setTw2] = useState(32);
  const [tw3, setTw3] = useState(9);
  const [tw4, setTw4] = useState(16);
  const [dod, setDod] = useState(10);
  const [dealMonthly, setDealMonthly] = useState(430);
  const [weeklyTarget, setWeeklyTarget] = useState(3000);
  const [inputCalls, setInputCalls] = useState(200);

  const [entries, setEntries] = useState<PipeEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trackerDate, setTrackerDate] = useState(todayStr());
  const [formType, setFormType] = useState<EntryType>('Added');
  const [formUnits, setFormUnits] = useState(1);
  const [formValue, setFormValue] = useState(430);
  const [formCloseDate, setFormCloseDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const timingSum = tw1 + tw2 + tw3 + tw4;

  const fetchEntries = useCallback(async () => {
    setLoadingEntries(true);
    try {
      const res = await fetch('/api/pipeline/entries');
      if (res.ok) setEntries(await res.json());
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  async function saveEntry() {
    if (formValue <= 0 || formUnits <= 0) return;
    const bucket = formType === 'Added' && formCloseDate ? getWeekBucket(formCloseDate) : undefined;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        Date: trackerDate, Type: formType, Units: formUnits, Value: formValue,
        ...(formCloseDate ? { CloseDate: formCloseDate } : {}),
        ...(bucket ? { WeekBucket: bucket } : {}),
        ...(formNotes ? { Notes: formNotes } : {}),
      };
      const res = await fetch('/api/pipeline/entries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const saved = await res.json();
        setEntries(prev => [saved, ...prev]);
        setFormNotes(''); setFormCloseDate(''); setFormUnits(1); setFormValue(dealMonthly);
      }
    } finally { setSaving(false); }
  }

  async function deleteEntry(id: string) {
    const res = await fetch(`/api/pipeline/entries/${id}`, { method: 'DELETE' });
    if (res.ok) setEntries(prev => prev.filter(e => e.id !== id));
  }

  const calc = useMemo(() => {
    const wdv = dealMonthly / 4.33;
    const cr = pipeClose / 100;
    const bookings = inputCalls * (callBook / 100);
    const attended = bookings * (bookAttend / 100);
    const pipeline = attended * (attendPipe / 100);
    const totalCloses = pipeline * cr;
    const w1c = totalCloses * (tw1 / 100);
    const w2c = totalCloses * (tw2 / 100);
    const w3c = totalCloses * (tw3 / 100);
    const w4c = totalCloses * (tw4 / 100);
    const toRev = (c: number) => c * wdv;
    const toPipe = (rev: number) => rev / cr;
    const w1Rev = toRev(w1c); const w2Rev = toRev(w2c);
    const w3Rev = toRev(w3c); const w4Rev = toRev(w4c);
    const totalRev = w1Rev + w2Rev + w3Rev + w4Rev;
    const dodCloses = w1c * (dod / 100);
    const revPerCall = wdv * (callBook / 100) * (bookAttend / 100) * (attendPipe / 100) * cr;
    const callsForTarget = weeklyTarget / revPerCall;
    return {
      wdv, bookings, attended, pipeline, totalCloses, totalRev, totalPipe: toPipe(totalRev),
      w1c, w2c, w3c, w4c,
      w1Rev, w2Rev, w3Rev, w4Rev,
      w1Pipe: toPipe(w1Rev), w2Pipe: toPipe(w2Rev), w3Pipe: toPipe(w3Rev), w4Pipe: toPipe(w4Rev),
      dodCloses, callsForTarget,
      bookingsForTarget: callsForTarget * (callBook / 100),
      attendedForTarget: callsForTarget * (callBook / 100) * (bookAttend / 100),
      pipelineForTarget: callsForTarget * (callBook / 100) * (bookAttend / 100) * (attendPipe / 100),
      closesForTarget: callsForTarget * (callBook / 100) * (bookAttend / 100) * (attendPipe / 100) * cr,
    };
  }, [inputCalls, callBook, bookAttend, attendPipe, pipeClose, tw1, tw2, tw3, tw4, dod, dealMonthly, weeklyTarget]);

  const trackerStats = useMemo(() => {
    const todayEntries = entries.filter(e => e.Date === trackerDate);
    const sum = (arr: PipeEntry[]) => ({ units: arr.reduce((a, e) => a + (e.Units || 0), 0), value: arr.reduce((a, e) => a + (e.Value || 0), 0) });
    const addedSum = sum(todayEntries.filter(e => e.Type === 'Added'));
    const wonSum = sum(todayEntries.filter(e => e.Type === 'Won'));
    const lostSum = sum(todayEntries.filter(e => e.Type === 'Lost'));
    const buckets: Record<WeekBucket, { units: number; value: number }> = {
      'Week 1': { units: 0, value: 0 }, 'Week 2': { units: 0, value: 0 },
      'Week 3': { units: 0, value: 0 }, 'Week 4+': { units: 0, value: 0 },
    };
    entries.forEach(e => {
      if (e.Type === 'Added' && e.WeekBucket) {
        buckets[e.WeekBucket].units += e.Units || 0;
        buckets[e.WeekBucket].value += e.Value || 0;
      }
    });
    entries.forEach(e => {
      if ((e.Type === 'Won' || e.Type === 'Lost') && e.WeekBucket) {
        const b = e.WeekBucket;
        buckets[b].units = Math.max(0, buckets[b].units - (e.Units || 0));
        buckets[b].value = Math.max(0, buckets[b].value - (e.Value || 0));
      }
    });
    return {
      addedSum, wonSum, lostSum,
      netUnits: addedSum.units - wonSum.units - lostSum.units,
      netValue: addedSum.value - wonSum.value - lostSum.value,
      buckets, todayEntries,
    };
  }, [entries, trackerDate]);

  const targetPipePerBucket = useMemo(() => {
    const cr = pipeClose / 100;
    const wdv = dealMonthly / 4.33;
    const pipeNeeded = (weeklyTarget / wdv) / cr;
    const pipeValue = pipeNeeded * wdv / cr;
    return {
      'Week 1': pipeValue * (tw1 / 100),
      'Week 2': pipeValue * (tw2 / 100),
      'Week 3': pipeValue * (tw3 / 100),
      'Week 4+': pipeValue * (tw4 / 100),
    } as Record<WeekBucket, number>;
  }, [weeklyTarget, pipeClose, dealMonthly, tw1, tw2, tw3, tw4]);

  const weekColors: Record<WeekBucket, string> = {
    'Week 1': '#f97316', 'Week 2': '#a78bfa', 'Week 3': '#34d399', 'Week 4+': '#60a5fa',
  };

  const weeks = [
    { week: 'Week 1', timingPct: tw1, closes: calc.w1c, revenue: calc.w1Rev, pipeValue: calc.w1Pipe, color: '#f97316', isWeek1: true as const, dealOnDay: calc.dodCloses },
    { week: 'Week 2', timingPct: tw2, closes: calc.w2c, revenue: calc.w2Rev, pipeValue: calc.w2Pipe, color: '#a78bfa' },
    { week: 'Week 3', timingPct: tw3, closes: calc.w3c, revenue: calc.w3Rev, pipeValue: calc.w3Pipe, color: '#34d399' },
    { week: 'Week 4+', timingPct: tw4, closes: calc.w4c, revenue: calc.w4Rev, pipeValue: calc.w4Pipe, color: '#60a5fa' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9' }}>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Marketing Sweet · Sales Operations</div>
            <h1 className="text-xl font-black text-gray-900 mt-0.5">Pipeline Management</h1>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Weekly Target</div>
            <div className="text-2xl font-black text-orange-500">{fmt$(weeklyTarget)}</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <div className="text-xs font-black uppercase tracking-widest text-orange-500">Conversion Funnel</div>
            <Slider label="Call → Booking" value={callBook} min={1} max={40} step={0.5} onChange={setCallBook} format={v => `${v}%`} accent="#f97316" />
            <Slider label="Booking → Attended" value={bookAttend} min={10} max={80} step={1} onChange={setBookAttend} format={v => `${v}%`} accent="#f97316" />
            <Slider label="Attended → Pipeline" value={attendPipe} min={20} max={100} step={1} onChange={setAttendPipe} format={v => `${v}%`} accent="#f97316" />
            <Slider label="Pipeline → Close" value={pipeClose} min={10} max={100} step={1} onChange={setPipeClose} format={v => `${v}%`} accent="#f97316" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-widest text-purple-500">Close Timing</div>
              <div className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: Math.abs(timingSum - 100) <= 1 ? '#dcfce7' : '#fff7ed', color: Math.abs(timingSum - 100) <= 1 ? '#15803d' : '#c2410c' }}>
                {timingSum}%
              </div>
            </div>
            <p className="text-[11px] text-gray-400 -mt-2">Of all closes from a meeting batch, what % land each week?</p>
            <Slider label="Week 1" value={tw1} min={0} max={80} step={1} onChange={setTw1} format={v => `${v}%`} accent="#f97316" />
            <Slider label="Week 2" value={tw2} min={0} max={60} step={1} onChange={setTw2} format={v => `${v}%`} accent="#a78bfa" />
            <Slider label="Week 3" value={tw3} min={0} max={40} step={1} onChange={setTw3} format={v => `${v}%`} accent="#34d399" />
            <Slider label="Week 4+" value={tw4} min={0} max={40} step={1} onChange={setTw4} format={v => `${v}%`} accent="#60a5fa" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <div className="text-xs font-black uppercase tracking-widest text-emerald-600">Deal Economics</div>
            <Slider label="Avg Deal Value (monthly)" value={dealMonthly} min={100} max={2000} step={10} onChange={setDealMonthly} format={v => `$${v}/mo`} accent="#059669" />
            <div className="bg-gray-50 rounded-xl px-3 py-2 text-sm">
              <span className="text-xs text-gray-500">Weekly: </span>
              <span className="font-black text-emerald-700">${(dealMonthly / 4.33).toFixed(2)}</span>
            </div>
            <Slider label="Weekly Revenue Target" value={weeklyTarget} min={500} max={20000} step={250} onChange={setWeeklyTarget} format={v => `$${v.toLocaleString()}`} accent="#059669" />
            <div className="pt-2 border-t border-gray-100">
              <Slider label="Deal on Day %" value={dod} min={0} max={50} step={1} onChange={setDod} format={v => `${v}%`} accent="#e11d48" />
              <p className="text-[10px] text-gray-400 mt-1">% of Week 1 closes that happen on the day of the meeting</p>
            </div>
          </div>
        </div>

        {/* Calculator */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">🧮 Pipeline Calculator</div>
            <p className="text-xs text-gray-400 mt-0.5">Enter calls → revenue and pipeline value by week</p>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Calls made</label>
                <input type="number" value={inputCalls} onChange={e => setInputCalls(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full text-2xl font-black text-gray-800 bg-transparent outline-none border-b-2 border-orange-300 pb-1" />
              </div>
              <FunnelStep icon="📞" label="Calls" value={inputCalls.toLocaleString()} color="#94a3b8" highlight />
              <div className="ml-7 text-[10px] text-orange-500 font-bold">{callBook}% book</div>
              <FunnelStep icon="📅" label="Bookings" value={calc.bookings.toFixed(0)} color="#f97316" />
              <div className="ml-7 text-[10px] text-orange-400 font-bold">{bookAttend}% attend</div>
              <FunnelStep icon="🎯" label="Meetings Attended" value={calc.attended.toFixed(0)} color="#fb923c" highlight />
              <div className="ml-7 text-[10px] text-purple-500 font-bold">{attendPipe}% enter pipe</div>
              <FunnelStep icon="🔥" label="Added to Pipeline" value={calc.pipeline.toFixed(0)} color="#a78bfa" highlight />
              <div className="ml-7 text-[10px] text-emerald-600 font-bold">{pipeClose}% close rate</div>
              <FunnelStep icon="✅" label="Total Closes" value={calc.totalCloses.toFixed(1)}
                sub={`${fmt$(calc.totalRev)} revenue · ${fmt$(calc.totalPipe)} in pipe`} color="#22c55e" highlight />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">By close week</div>
              <div className="grid grid-cols-4 gap-1 px-1">
                {['Week', 'Closes', 'Revenue', 'In Pipe'].map(h => (
                  <div key={h} className="text-[10px] font-bold text-gray-400 text-center">{h}</div>
                ))}
              </div>
              {weeks.map(w => (
                <div key={w.week} className="grid grid-cols-4 gap-1 rounded-xl p-2.5 border items-center"
                  style={{ borderColor: w.color + '40', background: w.color + '0c' }}>
                  <div className="text-xs font-bold" style={{ color: w.color }}>{w.week}</div>
                  <div className="text-sm font-black text-center text-gray-700">{w.closes.toFixed(1)}</div>
                  <div className="text-sm font-black text-center text-gray-700">{fmt$(w.revenue)}</div>
                  <div className="text-sm font-bold text-center text-gray-500">{fmt$(w.pipeValue)}</div>
                </div>
              ))}
              <div className="grid grid-cols-4 gap-1 rounded-xl p-2.5 border-2 border-emerald-300 bg-emerald-50 items-center">
                <div className="text-xs font-black text-emerald-700">Total</div>
                <div className="text-sm font-black text-center text-emerald-700">{calc.totalCloses.toFixed(1)}</div>
                <div className="text-sm font-black text-center text-emerald-700">{fmt$(calc.totalRev)}</div>
                <div className="text-sm font-bold text-center text-emerald-600">{fmt$(calc.totalPipe)}</div>
              </div>
              {calc.dodCloses > 0 && (
                <div className="rounded-xl p-3 border border-rose-200 bg-rose-50 flex items-center gap-3">
                  <span>⚡</span>
                  <div>
                    <div className="text-xs font-bold text-rose-600">Deal on Day</div>
                    <div className="text-xs text-rose-500">{calc.dodCloses.toFixed(1)} closes on the day of the meeting ({dod}% of Week 1 closes)</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flowchart */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">📊 Close Timing Flowchart</div>
            <p className="text-xs text-gray-400 mt-0.5">
              {calc.attended.toFixed(0)} meetings attended → {calc.pipeline.toFixed(0)} pipeline → {calc.totalCloses.toFixed(1)} total closes distributed below
            </p>
          </div>
          <div className="p-6">
            <div className="flex justify-center mb-2">
              <div className="rounded-xl border-2 px-6 py-3 text-center" style={{ borderColor: '#f9731660', background: '#fff7ed' }}>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Meetings Attended</div>
                <div className="text-2xl font-black text-orange-500">{calc.attended.toFixed(0)}</div>
                <div className="text-[10px] text-gray-400">{attendPipe}% to pipe · {pipeClose}% close = {calc.totalCloses.toFixed(1)} closes</div>
              </div>
            </div>
            <div className="relative flex justify-center mb-2">
              <svg viewBox="0 0 700 60" className="w-full max-w-2xl" style={{ height: 60 }} preserveAspectRatio="none">
                {[{ x: 175, color: '#f97316' }, { x: 308, color: '#a78bfa' }, { x: 441, color: '#34d399' }, { x: 574, color: '#60a5fa' }].map(({ x, color }, i) => (
                  <path key={i} d={`M 350 0 Q ${(350 + x) / 2} ${30 + i * 5} ${x} 58`}
                    fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
                ))}
              </svg>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {weeks.map(w => <WeekColumn key={w.week} {...w} />)}
            </div>
            {timingSum !== 100 && (
              <div className="mt-3 text-center text-xs text-amber-600 font-semibold">
                ⚠ Timing %s sum to {timingSum}% — adjust to reach 100%
              </div>
            )}
          </div>
        </div>

        {/* Target minimums */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">
            🎯 To Hit {fmt$(weeklyTarget)}/wk — Steady State Weekly Minimums
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Calls/wk', value: calc.callsForTarget.toFixed(0), icon: '📞', color: '#94a3b8' },
              { label: 'Bookings', value: calc.bookingsForTarget.toFixed(0), icon: '📅', color: '#f97316' },
              { label: 'Attended', value: calc.attendedForTarget.toFixed(0), icon: '🎯', color: '#fb923c' },
              { label: 'Into Pipe', value: calc.pipelineForTarget.toFixed(0), icon: '🔥', color: '#a78bfa' },
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
        </div>

        {/* ══ DAILY TRACKER ══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-4 pt-2">
          <div className="h-px flex-1 bg-gray-300" />
          <div className="text-xs font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Daily Pipeline Tracker</div>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-600">Tracking date:</span>
          <input type="date" value={trackerDate} onChange={e => setTrackerDate(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-orange-400" />
          <button onClick={() => setTrackerDate(todayStr())} className="text-xs font-bold text-orange-500 hover:text-orange-600 underline">Today</button>
        </div>

        {/* Daily summary tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Added to Pipe', u: trackerStats.addedSum.units, v: trackerStats.addedSum.value, color: '#a78bfa', icon: '➕' },
            { label: 'Won', u: trackerStats.wonSum.units, v: trackerStats.wonSum.value, color: '#22c55e', icon: '🏆' },
            { label: 'Lost', u: trackerStats.lostSum.units, v: trackerStats.lostSum.value, color: '#ef4444', icon: '❌' },
            { label: 'Net Movement', u: trackerStats.netUnits, v: trackerStats.netValue, color: trackerStats.netValue >= 0 ? '#22c55e' : '#ef4444', icon: '📈' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-1"
              style={{ borderColor: s.color + '50' }}>
              <div className="flex items-center gap-2">
                <span>{s.icon}</span>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{s.label}</div>
              </div>
              <div className="text-2xl font-black mt-1" style={{ color: s.color }}>{fmt$(s.v)}</div>
              <div className="text-xs text-gray-400">{s.u} unit{s.u !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>

        {/* Bucket health */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">📦 Pipeline Health by Week Bucket</div>
            <p className="text-xs text-gray-400 mt-0.5">Current logged pipeline vs what you need in each bucket to hit target</p>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['Week 1', 'Week 2', 'Week 3', 'Week 4+'] as WeekBucket[]).map(bucket => {
              const cur = trackerStats.buckets[bucket];
              const tgt = targetPipePerBucket[bucket];
              const pct = tgt > 0 ? Math.min((cur.value / tgt) * 100, 100) : 0;
              const color = weekColors[bucket];
              const diff = cur.value - tgt;
              return (
                <div key={bucket} className="flex flex-col gap-2 rounded-2xl border-2 p-4"
                  style={{ borderColor: color + '40', background: color + '08' }}>
                  <div className="text-xs font-black uppercase tracking-wider" style={{ color }}>{bucket}</div>
                  <div className="text-2xl font-black text-gray-800">{fmt$(cur.value)}</div>
                  <div className="text-[10px] text-gray-400">{cur.units} units</div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Target: {fmt$(tgt)}</span>
                    <span className={`font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {diff >= 0 ? '+' : ''}{fmt$(diff)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log entry form */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">✏️ Log an Entry</div>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex gap-2">
              {(['Added', 'Won', 'Lost'] as EntryType[]).map(t => {
                const tc = t === 'Added' ? '#a78bfa' : t === 'Won' ? '#22c55e' : '#ef4444';
                return (
                  <button key={t} onClick={() => setFormType(t)}
                    className="flex-1 rounded-xl py-2.5 text-sm font-black border-2 transition-all"
                    style={{ borderColor: formType === t ? tc : '#e5e7eb', background: formType === t ? tc + '18' : '#fff', color: formType === t ? tc : '#6b7280' }}>
                    {t === 'Added' ? '➕ Added' : t === 'Won' ? '🏆 Won' : '❌ Lost'}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Units</label>
                <input type="number" min={1} value={formUnits} onChange={e => setFormUnits(Math.max(1, Number(e.target.value)))}
                  className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-base font-black text-gray-800 outline-none focus:border-orange-400" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Value (monthly $)</label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400">
                  <span className="pl-3 text-gray-400 font-bold">$</span>
                  <input type="number" min={0} value={formValue} onChange={e => setFormValue(Math.max(0, Number(e.target.value)))}
                    className="flex-1 px-2 py-2.5 text-base font-black text-gray-800 outline-none" />
                </div>
              </div>
            </div>
            {formType === 'Added' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Expected Close Date <span className="font-normal text-gray-400">(auto-assigns week bucket)</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input type="date" value={formCloseDate} onChange={e => setFormCloseDate(e.target.value)}
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-orange-400" />
                  {formCloseDate && (
                    <div className="rounded-xl px-3 py-2 text-xs font-black border-2 flex-shrink-0"
                      style={{ borderColor: weekColors[getWeekBucket(formCloseDate)] + '60', color: weekColors[getWeekBucket(formCloseDate)], background: weekColors[getWeekBucket(formCloseDate)] + '15' }}>
                      → {getWeekBucket(formCloseDate)}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes (optional)</label>
              <input type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)}
                placeholder="e.g. client name, deal details..."
                className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-400" />
            </div>
            <button onClick={saveEntry} disabled={saving}
              className="w-full rounded-xl py-3 text-sm font-black text-white transition-all"
              style={{ background: saving ? '#d1d5db' : '#f97316' }}>
              {saving ? 'Saving...' : `Log ${formType} Entry`}
            </button>
          </div>
        </div>

        {/* Entry log */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">📋 Entry Log</div>
            <button onClick={fetchEntries} className="text-xs text-orange-500 font-bold hover:text-orange-600">↻ Refresh</button>
          </div>
          {loadingEntries ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No entries yet — log your first one above.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {entries.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                  <div className="text-lg flex-shrink-0">{e.Type === 'Added' ? '➕' : e.Type === 'Won' ? '🏆' : '❌'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black" style={{ color: e.Type === 'Added' ? '#7c3aed' : e.Type === 'Won' ? '#15803d' : '#b91c1c' }}>{e.Type}</span>
                      <span className="text-xs text-gray-600 font-semibold">{e.Units} unit{e.Units !== 1 ? 's' : ''}</span>
                      <span className="text-xs font-black text-gray-800">{fmt$(e.Value)}</span>
                      {e.WeekBucket && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: weekColors[e.WeekBucket] + '20', color: weekColors[e.WeekBucket] }}>
                          {e.WeekBucket}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {e.Date}{e.CloseDate ? ` · closes ${e.CloseDate}` : ''}{e.Notes ? ` · ${e.Notes}` : ''}
                    </div>
                  </div>
                  <button onClick={() => deleteEntry(e.id)} className="text-gray-300 hover:text-red-400 text-lg flex-shrink-0 transition-colors">×</button>
                </div>
              ))}
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
