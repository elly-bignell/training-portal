// app/projections/page.tsx

"use client";

import { useState, useMemo } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

// ─── Defaults ───
const DEFAULT_CALLS_PER_HOUR = 18;
const DEFAULT_CONNECTS_PER_HOUR = 10;
const DEFAULT_BOOKINGS_PER_HOUR = 1.5;
const DEFAULT_ATTENDANCE_RATE = 0.5;
const DEFAULT_CLOSE_RATE = 0.5;
const DEFAULT_HOURS = 3.5;
const DEFAULT_DEAL_VALUE = 400;
const MEETING_LAG_DAYS = [3, 4, 5];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOUR_PRESETS = [1, 2, 3, 3.5, 4, 5, 5.5, 6, 7, 8];

function getMonthData(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0);
  return { daysInMonth: lastDay.getDate() };
}

function isWeekday(year: number, month: number, day: number) {
  const dow = new Date(year, month, day).getDay();
  return dow >= 1 && dow <= 5;
}

function addBusinessDays(year: number, month: number, day: number, bDays: number): Date {
  const current = new Date(year, month, day);
  let added = 0;
  while (added < bDays) {
    current.setDate(current.getDate() + 1);
    if (current.getDay() >= 1 && current.getDay() <= 5) added++;
  }
  return current;
}

function fmt(v: number): string {
  if (v === 0) return "0";
  if (Number.isInteger(v)) return v.toString();
  const one = v.toFixed(1);
  if (parseFloat(one) === v) return one;
  return v.toFixed(2);
}

function fmtCurrency(v: number): string {
  return "$" + Math.round(v).toLocaleString();
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

interface LeadGenDay { day: number; calls: number; connects: number; bookings: number; phoneHours: number; weekNumber: number; }
interface ClosingDay { day: number; meetingsScheduled: number; meetingsAttended: number; deals: number; revenue: number; weekNumber: number; }

function getWeekNumber(year: number, month: number, day: number): number {
  let weekNum = 0;
  for (let d = 1; d <= day; d++) {
    if (new Date(year, month, d).getDay() === 1) weekNum++;
  }
  return weekNum === 0 ? 1 : weekNum;
}

function buildWeeks<T extends { day: number }>(year: number, month: number, dayData: T[]): (T | null)[][] {
  const { daysInMonth } = getMonthData(year, month);
  const weeks: (T | null)[][] = [];
  let currentWeek: (T | null)[] = [];
  const firstDow = new Date(year, month, 1).getDay();
  const adjustedStart = firstDow === 0 ? 6 : firstDow - 1;
  if (adjustedStart < 5) { for (let i = 0; i < adjustedStart; i++) currentWeek.push(null); }
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow === 0 || dow === 6) continue;
    if (dow === 1 && currentWeek.length > 0) { while (currentWeek.length < 5) currentWeek.push(null); weeks.push(currentWeek); currentWeek = []; }
    const data = dayData.find((dd) => dd.day === d);
    currentWeek.push(data || null);
  }
  if (currentWeek.length > 0) { while (currentWeek.length < 5) currentWeek.push(null); weeks.push(currentWeek); }
  return weeks;
}

function FunnelInput({ value, onChange, step = 0.1, min = 0, prefix, suffix, width = "w-16" }: {
  value: number; onChange: (v: number) => void; step?: number; min?: number; prefix?: string; suffix?: string; width?: string;
}) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {prefix && <span className="text-xs text-gray-400">{prefix}</span>}
      <input type="number" value={value} onChange={(e) => onChange(Math.max(min, parseFloat(e.target.value) || 0))} step={step} min={min}
        className={`${width} text-center text-xs font-bold text-slate-900 tabular-nums bg-slate-50 border border-gray-200 rounded px-1 py-0.5 focus:border-slate-900 focus:bg-white outline-none hover:border-gray-400 transition-colors`}
      />
      {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
    </div>
  );
}

function ProjectionsContent() {
  const [activeTab, setActiveTab] = useState<"leadgen" | "closing">("leadgen");
  const [phoneHours, setPhoneHours] = usePersistedState("proj-phoneHours", DEFAULT_HOURS);
  const [dealValue, setDealValue] = usePersistedState("proj-dealValue", DEFAULT_DEAL_VALUE);
  const [callsPerHour, setCallsPerHour] = usePersistedState("proj-callsPerHour", DEFAULT_CALLS_PER_HOUR);
  const [connectsPerHour, setConnectsPerHour] = usePersistedState("proj-connectsPerHour", DEFAULT_CONNECTS_PER_HOUR);
  const [bookingsPerHour, setBookingsPerHour] = usePersistedState("proj-bookingsPerHour", DEFAULT_BOOKINGS_PER_HOUR);
  const [attendanceRate, setAttendanceRate] = usePersistedState("proj-attendanceRate", DEFAULT_ATTENDANCE_RATE);
  const [closeRate, setCloseRate] = usePersistedState("proj-closeRate", DEFAULT_CLOSE_RATE);

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };

  const attendedPerHour = bookingsPerHour * attendanceRate;
  const dealsPerHour = attendedPerHour * closeRate;
  const revenuePerHour = dealsPerHour * dealValue;

  const dailyCalls = phoneHours * callsPerHour;
  const dailyConnects = phoneHours * connectsPerHour;
  const dailyBookings = phoneHours * bookingsPerHour;
  const dailyAttended = dailyBookings * attendanceRate;
  const dailyDeals = dailyAttended * closeRate;
  const dailyRevenue = dailyDeals * dealValue;

  const leadGenData = useMemo(() => {
    const { daysInMonth } = getMonthData(viewYear, viewMonth);
    const data: LeadGenDay[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      if (isWeekday(viewYear, viewMonth, d)) {
        data.push({ day: d, calls: dailyCalls, connects: dailyConnects, bookings: dailyBookings, phoneHours, weekNumber: getWeekNumber(viewYear, viewMonth, d) });
      }
    }
    return data;
  }, [viewYear, viewMonth, phoneHours, dailyCalls, dailyConnects, dailyBookings]);

  const closingData = useMemo(() => {
    const { daysInMonth } = getMonthData(viewYear, viewMonth);
    const meetingMap: Record<number, number> = {};
    const distributeBookings = (srcYear: number, srcMonth: number, srcDay: number) => {
      const attendedPerLag = (dailyBookings * attendanceRate) / MEETING_LAG_DAYS.length;
      for (const lag of MEETING_LAG_DAYS) {
        const meetDate = addBusinessDays(srcYear, srcMonth, srcDay, lag);
        if (meetDate.getFullYear() === viewYear && meetDate.getMonth() === viewMonth) {
          const mDay = meetDate.getDate();
          meetingMap[mDay] = (meetingMap[mDay] || 0) + attendedPerLag;
        }
      }
    };
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const { daysInMonth: prevDays } = getMonthData(prevY, prevM);
    for (let d = prevDays - 9; d <= prevDays; d++) { if (isWeekday(prevY, prevM, d)) distributeBookings(prevY, prevM, d); }
    for (let d = 1; d <= daysInMonth; d++) { if (isWeekday(viewYear, viewMonth, d)) distributeBookings(viewYear, viewMonth, d); }
    const data: ClosingDay[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      if (isWeekday(viewYear, viewMonth, d)) {
        const attended = meetingMap[d] || 0;
        const scheduled = attended > 0 ? attended / attendanceRate : 0;
        const deals = attended * closeRate;
        const revenue = deals * dealValue;
        data.push({ day: d, meetingsScheduled: Number(scheduled.toFixed(2)), meetingsAttended: Number(attended.toFixed(2)), deals: Number(deals.toFixed(2)), revenue: Math.round(revenue), weekNumber: getWeekNumber(viewYear, viewMonth, d) });
      }
    }
    return data;
  }, [viewYear, viewMonth, dailyBookings, attendanceRate, closeRate, dealValue]);

  const weekdayCount = leadGenData.length;
  const monthlyBookings = dailyBookings * weekdayCount;
  const monthlyAttended = closingData.reduce((s, d) => s + d.meetingsAttended, 0);
  const monthlyDeals = closingData.reduce((s, d) => s + d.deals, 0);
  const monthlyRevenue = closingData.reduce((s, d) => s + d.revenue, 0);
  const weeklyBookings = dailyBookings * 5;
  const weeklyDeals = dailyDeals * 5;
  const weeklyRevenue = dailyRevenue * 5;

  const leadGenWeeks = buildWeeks(viewYear, viewMonth, leadGenData);
  const closingWeeks = buildWeeks(viewYear, viewMonth, closingData);

  const weeklyRevenueTotals = useMemo(() => { const t: Record<number, number> = {}; for (const d of closingData) { t[d.weekNumber] = (t[d.weekNumber] || 0) + d.revenue; } return t; }, [closingData]);
  const cumulativeRevenueByDay = useMemo(() => { let r = 0; const m: Record<number, number> = {}; for (const d of closingData) { r += d.revenue; m[d.day] = r; } return m; }, [closingData]);
  const weeklyBookingTotals = useMemo(() => { const t: Record<number, number> = {}; for (const d of leadGenData) { t[d.weekNumber] = (t[d.weekNumber] || 0) + d.bookings; } return t; }, [leadGenData]);
  const cumulativeBookingsByDay = useMemo(() => { let r = 0; const m: Record<number, number> = {}; for (const d of leadGenData) { r += d.bookings; m[d.day] = r; } return m; }, [leadGenData]);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2"><span>📊</span> Revenue Projections</h1>
              <p className="text-sm text-slate-400">Projected lead generation &amp; closing targets per person</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Hours on Phones</h3>
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => setPhoneHours(Math.max(0.5, Math.round((phoneHours - 0.5) * 10) / 10))} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">−</button>
                <div className="text-center">
                  <div className="text-4xl font-black text-slate-900 tabular-nums">{phoneHours}</div>
                  <div className="text-[10px] text-gray-400">hrs/day</div>
                </div>
                <button onClick={() => setPhoneHours(Math.round((phoneHours + 0.5) * 10) / 10)} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">+</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HOUR_PRESETS.map((h) => (
                  <button key={h} onClick={() => setPhoneHours(h)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${phoneHours === h ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{h}hr{h !== 1 ? "s" : ""}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Bookings Per Hour</h3>
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => setBookingsPerHour(Math.max(0.1, Math.round((bookingsPerHour - 0.1) * 100) / 100))} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">−</button>
                <div className="text-center">
                  <input type="number" value={bookingsPerHour} onChange={(e) => setBookingsPerHour(Math.max(0, parseFloat(e.target.value) || 0))} step={0.1} min={0} className="w-20 text-center text-4xl font-black text-slate-900 tabular-nums bg-transparent border-b-2 border-gray-200 focus:border-slate-900 outline-none" />
                  <div className="text-[10px] text-gray-400">bookings/hr</div>
                </div>
                <button onClick={() => setBookingsPerHour(Math.round((bookingsPerHour + 0.1) * 100) / 100)} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">+</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((b) => (
                  <button key={b} onClick={() => setBookingsPerHour(b)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${bookingsPerHour === b ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{b}/hr</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Avg Deal Value</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-gray-400">$</span>
                <input type="number" value={dealValue} onChange={(e) => setDealValue(Number(e.target.value) || 0)} min={0} step={50} className="text-4xl font-black text-slate-900 tabular-nums bg-transparent border-b-2 border-gray-200 focus:border-slate-900 outline-none w-32" />
              </div>
              <div className="text-[10px] text-gray-400">Monthly recurring per deal</div>
            </div>
          </div>
        </div>

        {/* Snapshot */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Daily Output <span className="text-gray-300">({phoneHours}hrs × {bookingsPerHour} bkgs/hr)</span></h3>
              <div className="grid grid-cols-3 gap-2">
                {[{ emoji: "📞", val: Math.round(dailyCalls), label: "Calls" }, { emoji: "🔗", val: Math.round(dailyConnects), label: "Connects" }, { emoji: "📅", val: fmt(dailyBookings), label: "Bookings", highlight: true }].map((item) => (
                  <div key={item.label} className="text-center">
                    <span className="text-sm">{item.emoji}</span>
                    <div className={`text-xl font-black tabular-nums ${item.highlight ? "text-indigo-600" : "text-slate-900"}`}>{item.val}</div>
                    <div className="text-[10px] text-gray-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-gray-200 md:pl-6 pt-4 md:pt-0">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Daily Closing</h3>
              <div className="grid grid-cols-3 gap-2">
                {[{ emoji: "🤝", val: fmt(dailyAttended), label: "Attended" }, { emoji: "🏆", val: fmt(dailyDeals), label: "Deals" }, { emoji: "💰", val: fmtCurrency(dailyRevenue), label: "Revenue", highlight: true }].map((item) => (
                  <div key={item.label} className="text-center">
                    <span className="text-sm">{item.emoji}</span>
                    <div className={`text-xl font-black tabular-nums ${item.highlight ? "text-emerald-600" : "text-slate-900"}`}>{item.val}</div>
                    <div className="text-[10px] text-gray-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-gray-200 md:pl-6 pt-4 md:pt-0">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Weekly (5 days)</h3>
              <div className="grid grid-cols-3 gap-2">
                {[{ emoji: "📅", val: fmt(weeklyBookings), label: "Bookings", highlight: true }, { emoji: "🏆", val: fmt(weeklyDeals), label: "Deals" }, { emoji: "💰", val: fmtCurrency(weeklyRevenue), label: "Revenue", highlight: true }].map((item) => (
                  <div key={item.label} className="text-center">
                    <span className="text-sm">{item.emoji}</span>
                    <div className={`text-xl font-black tabular-nums ${item.highlight ? "text-emerald-600" : "text-slate-900"}`}>{item.val}</div>
                    <div className="text-[10px] text-gray-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b-2 border-gray-200">
          <button onClick={() => setActiveTab("leadgen")} className={`px-5 py-3 text-sm font-bold transition-colors relative ${activeTab === "leadgen" ? "text-slate-900" : "text-gray-400 hover:text-gray-600"}`}>
            📅 Lead Generation
            {activeTab === "leadgen" && <div className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-slate-900" />}
          </button>
          <button onClick={() => setActiveTab("closing")} className={`px-5 py-3 text-sm font-bold transition-colors relative ${activeTab === "closing" ? "text-slate-900" : "text-gray-400 hover:text-gray-600"}`}>
            💰 Closing
            {activeTab === "closing" && <div className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-slate-900" />}
          </button>
        </div>

        {/* Month Nav */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">← Prev</button>
            <button onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Today</button>
            <button onClick={nextMonth} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Next →</button>
          </div>
        </div>

        {/* Summary Cards */}
        {activeTab === "leadgen" ? (
          <div className="grid grid-cols-3 gap-3">
            {[{ emoji: "📞", value: (Math.round(dailyCalls * weekdayCount)).toLocaleString(), label: "Total Calls", sub: `${weekdayCount} working days` }, { emoji: "🔗", value: (Math.round(dailyConnects * weekdayCount)).toLocaleString(), label: "Total Connects", sub: "" }, { emoji: "📅", value: fmt(monthlyBookings), label: "Total Bookings", sub: `${fmt(dailyBookings)}/day` }].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <span className="text-xl">{item.emoji}</span>
                <div className="text-2xl font-black text-slate-900 tabular-nums mt-1">{item.value}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</div>
                {item.sub && <div className="text-[10px] text-gray-400 mt-0.5">{item.sub}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[{ emoji: "🤝", value: fmt(monthlyAttended), label: "Meetings Attended", sub: `${pct(attendanceRate)} attendance` }, { emoji: "🏆", value: fmt(monthlyDeals), label: "Total Deals", sub: `${pct(closeRate)} close rate` }, { emoji: "💰", value: fmtCurrency(monthlyRevenue), label: "Monthly Revenue", sub: `@ ${fmtCurrency(dealValue)}/deal` }].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <span className="text-xl">{item.emoji}</span>
                <div className="text-2xl font-black text-slate-900 tabular-nums mt-1">{item.value}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</div>
                {item.sub && <div className="text-[10px] text-gray-400 mt-0.5">{item.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-5 bg-slate-50 border-b border-gray-200">
            {DAY_HEADERS.map((d) => (<div key={d} className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>))}
          </div>

          {activeTab === "leadgen"
            ? leadGenWeeks.map((week, wi) => {
                const firstDay = week.find((d) => d !== null);
                const weekNum = firstDay ? firstDay.weekNumber : 0;
                const weekBookings = weeklyBookingTotals[weekNum] || 0;
                const lastDayInWeek = [...week].reverse().find((d) => d !== null);
                const cumulativeBookings = lastDayInWeek ? cumulativeBookingsByDay[lastDayInWeek.day] || 0 : 0;
                return (
                  <div key={wi}>
                    <div className="grid grid-cols-5 border-b border-gray-100">
                      {week.map((dayData, di) => (
                        <div key={di} className={`border-r border-gray-100 last:border-r-0 p-2.5 min-h-[120px] ${dayData ? "hover:bg-slate-50 transition-colors" : "bg-gray-50/50"}`}>
                          {dayData && (<>
                            <div className="text-xs font-bold text-gray-400 mb-2">{dayData.day}</div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px]"><span className="text-[10px]">📞</span><span className="font-bold text-slate-700 tabular-nums">{Math.round(dayData.calls)}</span><span className="text-gray-400">calls</span></div>
                              <div className="flex items-center gap-1.5 text-[11px]"><span className="text-[10px]">🔗</span><span className="font-bold text-slate-700 tabular-nums">{Math.round(dayData.connects)}</span><span className="text-gray-400">connects</span></div>
                              <div className="flex items-center gap-1.5 text-[11px]"><span className="text-[10px]">📅</span><span className="font-black text-indigo-600 tabular-nums">{fmt(dayData.bookings)}</span><span className="text-gray-400">bookings</span></div>
                            </div>
                            <div className="text-[9px] text-gray-300 mt-2 italic">{dayData.phoneHours}hrs calling</div>
                          </>)}
                        </div>
                      ))}
                    </div>
                    <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-1.5 flex justify-end items-center gap-6">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">Week {weekNum}</span>
                      <span className="text-xs font-black text-indigo-600 tabular-nums">📅 {fmt(weekBookings)} bookings</span>
                      <span className="text-[10px] text-gray-400">|</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">MTD</span>
                      <span className="text-xs font-black text-slate-700 tabular-nums">{fmt(cumulativeBookings)} bookings</span>
                    </div>
                  </div>
                );
              })
            : closingWeeks.map((week, wi) => {
                const firstDay = week.find((d) => d !== null);
                const weekNum = firstDay ? firstDay.weekNumber : 0;
                const weekRev = weeklyRevenueTotals[weekNum] || 0;
                const lastDayInWeek = [...week].reverse().find((d) => d !== null);
                const cumulativeAtWeekEnd = lastDayInWeek ? cumulativeRevenueByDay[lastDayInWeek.day] || 0 : 0;
                return (
                  <div key={wi}>
                    <div className="grid grid-cols-5 border-b border-gray-100">
                      {week.map((dayData, di) => (
                        <div key={di} className={`border-r border-gray-100 last:border-r-0 p-2.5 min-h-[140px] ${dayData ? dayData.meetingsAttended > 0 ? "hover:bg-emerald-50/30 transition-colors" : "hover:bg-slate-50 transition-colors" : "bg-gray-50/50"}`}>
                          {dayData && (<>
                            <div className="text-xs font-bold text-gray-400 mb-2">{dayData.day}</div>
                            {dayData.meetingsAttended > 0 ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px]"><span className="text-[10px]">📋</span><span className="font-bold text-slate-700 tabular-nums">{fmt(dayData.meetingsScheduled)}</span><span className="text-gray-400">scheduled</span></div>
                                <div className="flex items-center gap-1.5 text-[11px]"><span className="text-[10px]">🤝</span><span className="font-black text-emerald-600 tabular-nums">{fmt(dayData.meetingsAttended)}</span><span className="text-gray-400">attended</span></div>
                                <div className="flex items-center gap-1.5 text-[11px]"><span className="text-[10px]">🏆</span><span className="font-bold text-slate-700 tabular-nums">{fmt(dayData.deals)}</span><span className="text-gray-400">deals</span></div>
                                <div className="flex items-center gap-1.5 text-[11px]"><span className="text-[10px]">💰</span><span className="font-black text-emerald-600 tabular-nums">{fmtCurrency(dayData.revenue)}</span><span className="text-gray-400">revenue</span></div>
                              </div>
                            ) : (<div className="text-[10px] text-gray-300 italic mt-4">No meetings</div>)}
                          </>)}
                        </div>
                      ))}
                    </div>
                    <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-1.5 flex justify-end items-center gap-6">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Week {weekNum}</span>
                      <span className="text-xs font-black text-emerald-600 tabular-nums">💰 {fmtCurrency(weekRev)}</span>
                      <span className="text-[10px] text-gray-400">|</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">MTD</span>
                      <span className="text-xs font-black text-slate-700 tabular-nums">{fmtCurrency(cumulativeAtWeekEnd)}</span>
                    </div>
                  </div>
                );
              })
          }

          <div className="bg-slate-800 px-4 py-3 flex justify-end items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Monthly Total</span>
            {activeTab === "leadgen" ? (
              <span className="text-sm font-black text-white tabular-nums">📅 {fmt(monthlyBookings)} bookings</span>
            ) : (
              <span className="text-sm font-black text-emerald-400 tabular-nums">💰 {fmtCurrency(monthlyRevenue)}</span>
            )}
          </div>
        </div>

        {/* Editable Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">📐</span>
            <h2 className="text-sm font-bold text-slate-900">Conversion Funnel (per hour benchmark)</h2>
          </div>
          <p className="text-[10px] text-gray-400 mb-4 ml-10">Click any value in the <strong>Per Hour</strong> or <strong>Rate</strong> columns to adjust</p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="pb-2 text-left font-semibold text-gray-400">Stage</th>
                  <th className="pb-2 text-center font-semibold text-gray-400">Per Hour</th>
                  <th className="pb-2 text-center font-semibold text-gray-400">Per {phoneHours}hr Day</th>
                  <th className="pb-2 text-center font-semibold text-gray-400">Cut-through</th>
                  <th className="pb-2 text-center font-semibold text-gray-400">From</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2.5 font-medium text-gray-700">📞 Calls</td>
                  <td className="py-2.5 text-center"><FunnelInput value={callsPerHour} onChange={setCallsPerHour} step={1} min={1} width="w-14" /></td>
                  <td className="py-2.5 text-center text-gray-600 font-semibold tabular-nums">{Math.round(dailyCalls)}</td>
                  <td className="py-2.5 text-center text-gray-400">—</td>
                  <td className="py-2.5 text-center text-gray-400">—</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2.5 font-medium text-gray-700">🔗 Connects</td>
                  <td className="py-2.5 text-center"><FunnelInput value={connectsPerHour} onChange={setConnectsPerHour} step={1} min={1} width="w-14" /></td>
                  <td className="py-2.5 text-center text-gray-600 font-semibold tabular-nums">{Math.round(dailyConnects)}</td>
                  <td className="py-2.5 text-center text-sky-600 font-semibold">{callsPerHour > 0 ? `${((connectsPerHour / callsPerHour) * 100).toFixed(1)}%` : "—"}</td>
                  <td className="py-2.5 text-center text-gray-400">of Calls</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2.5 font-medium text-gray-700">📅 Bookings</td>
                  <td className="py-2.5 text-center"><FunnelInput value={bookingsPerHour} onChange={setBookingsPerHour} step={0.1} width="w-14" /></td>
                  <td className="py-2.5 text-center text-gray-600 font-semibold tabular-nums">{fmt(dailyBookings)}</td>
                  <td className="py-2.5 text-center text-indigo-600 font-semibold">{connectsPerHour > 0 ? `${((bookingsPerHour / connectsPerHour) * 100).toFixed(0)}%` : "—"}</td>
                  <td className="py-2.5 text-center text-gray-400">of Connects</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2.5 font-medium text-gray-700">🤝 Attended</td>
                  <td className="py-2.5 text-center text-slate-900 font-bold tabular-nums">{fmt(attendedPerHour)}</td>
                  <td className="py-2.5 text-center text-gray-600 font-semibold tabular-nums">{fmt(dailyAttended)}</td>
                  <td className="py-2.5 text-center"><FunnelInput value={Math.round(attendanceRate * 100)} onChange={(v) => setAttendanceRate(Math.min(1, v / 100))} step={5} min={1} width="w-12" suffix="%" /></td>
                  <td className="py-2.5 text-center text-gray-400">of Bookings</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2.5 font-medium text-gray-700">🏆 Deals</td>
                  <td className="py-2.5 text-center text-slate-900 font-bold tabular-nums">{fmt(dealsPerHour)}</td>
                  <td className="py-2.5 text-center text-gray-600 font-semibold tabular-nums">{fmt(dailyDeals)}</td>
                  <td className="py-2.5 text-center"><FunnelInput value={Math.round(closeRate * 100)} onChange={(v) => setCloseRate(Math.min(1, v / 100))} step={5} min={1} width="w-12" suffix="%" /></td>
                  <td className="py-2.5 text-center text-gray-400">of Attended</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2.5 font-medium text-gray-700">💰 Revenue</td>
                  <td className="py-2.5 text-center text-slate-900 font-bold tabular-nums">{fmtCurrency(revenuePerHour)}</td>
                  <td className="py-2.5 text-center text-gray-600 font-semibold tabular-nums">{fmtCurrency(dailyRevenue)}</td>
                  <td className="py-2.5 text-center"><FunnelInput value={dealValue} onChange={setDealValue} step={50} min={1} width="w-16" prefix="$" /></td>
                  <td className="py-2.5 text-center text-gray-400">per deal</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-[10px] text-gray-400">
            Revenue calculated at {fmtCurrency(dealValue)} per deal (monthly value). Bookings → Attended: {pct(attendanceRate)}. Attended → Deals: {pct(closeRate)}. Meetings occur 3–5 business days after booking.
          </div>
        </div>

      </div>
    </main>
  );
}

export default function ProjectionsPage() {
  return (
    <PasswordGate requireMaster>
      <ProjectionsContent />
    </PasswordGate>
  );
}
