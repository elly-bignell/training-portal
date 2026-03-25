// app/projections-2/page.tsx

"use client";

import { useState, useMemo } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

// ─── Defaults ───
const DEFAULT_CALLS_PER_HOUR = 18;
const DEFAULT_CONNECTS_PER_HOUR = 10;
const DEFAULT_BOOKINGS_PER_HOUR = 1.5;
const DEFAULT_ATTENDANCE_RATE = 0.33;
const DEFAULT_CLOSE_RATE = 0.49;
const DEFAULT_HOURS = 3.5;
const DEFAULT_DEAL_VALUE = 100;
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

function Projections2Content() {
  const [activeTab, setActiveTab] = useState<"leadgen" | "closing">("leadgen");
  const [phoneHours, setPhoneHours] = usePersistedState("proj2-phoneHours", DEFAULT_HOURS);
  const [dealValue, setDealValue] = usePersistedState("proj2-dealValue", DEFAULT_DEAL_VALUE);
  const [callsPerHour, setCallsPerHour] = usePersistedState("proj2-callsPerHour", DEFAULT_CALLS_PER_HOUR);
  const [connectsPerHour, setConnectsPerHour] = usePersistedState("proj2-connectsPerHour", DEFAULT_CONNECTS_PER_HOUR);
  const [bookingsPerHour, setBookingsPerHour] = usePersistedState("proj2-bookingsPerHour", DEFAULT_BOOKINGS_PER_HOUR);

  // ── Team Configuration State ──
  const [numTeams, setNumTeams] = usePersistedState("proj2-numTeams", 1);
  const [bookersPerCloser, setBookersPerCloser] = usePersistedState("proj2-bookersPerCloser", 2);
  const [eoyTarget, setEoyTarget] = usePersistedState("proj2-eoyTarget", 250000);
  const [currentRevenue, setCurrentRevenue] = usePersistedState("proj2-currentRevenue", 0);
  const [currentTeams, setCurrentTeams] = usePersistedState("proj2-currentTeams", 1);
  const [retentionLossPerDay, setRetentionLossPerDay] = usePersistedState("proj2-retentionLossPerDay", 200);

  const [attendanceRate, setAttendanceRate] = usePersistedState("proj2-attendanceRate", DEFAULT_ATTENDANCE_RATE);
  const [closeRate, setCloseRate] = usePersistedState("proj2-closeRate", DEFAULT_CLOSE_RATE);
  const [pipeRate, setPipeRate] = usePersistedState("proj2-pipeRate", 0.75);

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };

  // ── Per-person (1 booker) daily figures ──
  const attendedPerHour = bookingsPerHour * attendanceRate;
  const pipePerHour = attendedPerHour * pipeRate;
  const dealsPerHour = pipePerHour * closeRate;
  const revenuePerHour = dealsPerHour * dealValue;

  const dailyCalls = phoneHours * callsPerHour;
  const dailyConnects = phoneHours * connectsPerHour;
  const dailyBookings = phoneHours * bookingsPerHour;
  const dailyAttended = dailyBookings * attendanceRate;
  const dailyPipe = dailyAttended * pipeRate;
  const dailyDeals = dailyPipe * closeRate;
  const dailyRevenue = dailyDeals * dealValue;

  // ── Team derived ──
  const teamClosers = numTeams;
  const teamBookers = numTeams * bookersPerCloser;
  const totalHeadcount = numTeams * (bookersPerCloser + 1);
  // Per team: bookersPerCloser bookers feeding 1 closer
  const teamDailyBookings = dailyBookings * bookersPerCloser;
  const teamDailyAttended = teamDailyBookings * attendanceRate;
  const teamDailyPipe = teamDailyAttended * pipeRate;
  const teamDailyDeals = teamDailyPipe * closeRate;
  const teamDailyRevenue = teamDailyDeals * dealValue;
  const teamWeeklyRevenue = teamDailyRevenue * 5;
  const teamMonthlyRevenue = teamWeeklyRevenue * 4.33;

  const weeklyRevenue = teamDailyRevenue * 5;           // per team
  const weeklyTeamRevenue = weeklyRevenue * numTeams;   // all teams
  const monthlyTeamRevenue = weeklyTeamRevenue * 4.33;
  const annualTeamRevenue = weeklyTeamRevenue * 52;
  const revenuePerCloserWeek = teamClosers > 0 ? weeklyTeamRevenue / teamClosers : 0;

  const _now = new Date();
  const _eoy = new Date(_now.getFullYear(), 11, 31);
  const weeksLeft = Math.max(1, Math.ceil((_eoy.getTime() - _now.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  const _revPerTeamYear = weeklyRevenue * weeksLeft;
  const teamsNeeded = _revPerTeamYear > 0 ? Math.ceil(eoyTarget / _revPerTeamYear) : 0;
  const headcountNeeded = teamsNeeded * (bookersPerCloser + 1);

  // ── DTG calculations (all figures are weekly recurring revenue) ──
  // eoyTarget = weekly recurring revenue target
  // currentRevenue = current weekly recurring revenue
  // retentionLossPerDay = weekly recurring revenue lost per day to churn
  const retentionLossPerWeek = retentionLossPerDay * 5;

  // Target: 17 December 2026
  const _targetDate = new Date(2026, 11, 17);
  const _msPerDay = 24 * 60 * 60 * 1000;
  const _totalCalDays = Math.ceil((_targetDate.getTime() - _now.getTime()) / _msPerDay);
  const _totalWeeks = _totalCalDays / 7;
  const workingDaysLeft = Math.round(_totalWeeks * 5);
  const weeksToTarget = Math.round(_totalWeeks * 10) / 10;

  // Weekly recurring gap (all in $/wk)
  const dtg = Math.max(0, eoyTarget - currentRevenue);
  const totalChurnErosion = retentionLossPerWeek * weeksToTarget;
  const dtgAdjusted = dtg + totalChurnErosion;

  // 1 team stacks new recurring each week until Dec 17
  const dealValuePerWeek = dealValue / 4.33;
  const weeklyDealsPerTeam = teamDailyDeals * 5;
  const oneTeamRecurringByDeadline = weeklyDealsPerTeam * weeksToTarget * dealValuePerWeek;

  const teamsToHitDtg = oneTeamRecurringByDeadline > 0
    ? Math.ceil(dtgAdjusted / oneTeamRecurringByDeadline) : 0;
  const newHeadcountNeeded = teamsToHitDtg * (bookersPerCloser + 1);
  const totalDealsNeeded = dealValuePerWeek > 0 ? Math.ceil(dtgAdjusted / dealValuePerWeek) : 0;
  const additionalTeamsNeeded = Math.max(0, teamsToHitDtg - currentTeams);
  const additionalHeadcount = additionalTeamsNeeded * (bookersPerCloser + 1);
  const totalHeadcount2 = teamsToHitDtg * (bookersPerCloser + 1);

  const leadGenData = useMemo(() => {
    const { daysInMonth } = getMonthData(viewYear, viewMonth);
    const data: LeadGenDay[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      if (isWeekday(viewYear, viewMonth, d)) {
        data.push({ day: d, calls: dailyCalls * bookersPerCloser, connects: dailyConnects * bookersPerCloser, bookings: teamDailyBookings, phoneHours, weekNumber: getWeekNumber(viewYear, viewMonth, d) });
      }
    }
    return data;
  }, [viewYear, viewMonth, phoneHours, dailyCalls, dailyConnects, teamDailyBookings, bookersPerCloser]);

  const closingData = useMemo(() => {
    const { daysInMonth } = getMonthData(viewYear, viewMonth);
    const meetingMap: Record<number, number> = {};
    const distributeBookings = (srcYear: number, srcMonth: number, srcDay: number) => {
      const attendedPerLag = (teamDailyBookings * attendanceRate) / MEETING_LAG_DAYS.length;
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
        const deals = attended * pipeRate * closeRate;
        const revenue = deals * dealValue;
        data.push({ day: d, meetingsScheduled: Number(scheduled.toFixed(2)), meetingsAttended: Number(attended.toFixed(2)), deals: Number(deals.toFixed(2)), revenue: Math.round(revenue), weekNumber: getWeekNumber(viewYear, viewMonth, d) });
      }
    }
    return data;
  }, [viewYear, viewMonth, teamDailyBookings, attendanceRate, closeRate, pipeRate, dealValue]);

  const weekdayCount = leadGenData.length;
  const monthlyBookings = teamDailyBookings * weekdayCount;
  const monthlyAttended = closingData.reduce((s, d) => s + d.meetingsAttended, 0);
  const monthlyDeals = closingData.reduce((s, d) => s + d.deals, 0);
  const monthlyRevenue = closingData.reduce((s, d) => s + d.revenue, 0);
  const weeklyBookings = teamDailyBookings * 5;
  const weeklyDeals = teamDailyDeals * 5;

  const leadGenWeeks = buildWeeks(viewYear, viewMonth, leadGenData);
  const closingWeeks = buildWeeks(viewYear, viewMonth, closingData);

  const weeklyRevenueTotals = useMemo(() => { const t: Record<number, number> = {}; for (const d of closingData) { t[d.weekNumber] = (t[d.weekNumber] || 0) + d.revenue; } return t; }, [closingData]);
  const cumulativeRevenueByDay = useMemo(() => { let r = 0; const m: Record<number, number> = {}; for (const d of closingData) { r += d.revenue; m[d.day] = r; } return m; }, [closingData]);
  const weeklyBookingTotals = useMemo(() => { const t: Record<number, number> = {}; for (const d of leadGenData) { t[d.weekNumber] = (t[d.weekNumber] || 0) + d.bookings; } return t; }, [leadGenData]);
  const cumulativeBookingsByDay = useMemo(() => { let r = 0; const m: Record<number, number> = {}; for (const d of leadGenData) { r += d.bookings; m[d.day] = r; } return m; }, [leadGenData]);

  return (
    <main className="min-h-screen bg-slate-100">

      {/* ══ Team Calculator Card ══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-6 mb-0 border border-slate-200 shadow-sm mx-4 mt-6">

        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">👥</span>
          <h2 className="text-xl font-bold text-slate-900">Team Calculator</h2>
        </div>
        <p className="text-slate-500 text-sm mb-5">
          Set how many teams you&apos;re running and your booker-to-closer ratio. Revenue flows from the funnel cut-throughs below.
        </p>

        {/* Team inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-slate-700 text-sm font-semibold mb-3">Number of Teams</p>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setNumTeams(v => Math.max(1, v - 1))} className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors flex items-center justify-center text-xl">−</button>
              <span className="text-4xl font-black text-slate-900 w-12 text-center tabular-nums">{numTeams}</span>
              <button onClick={() => setNumTeams(v => v + 1)} className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors flex items-center justify-center text-xl">+</button>
            </div>
            <p className="text-slate-400 text-xs">1 team = 1 closer + {bookersPerCloser} booker{bookersPerCloser !== 1 ? 's' : ''} = {bookersPerCloser + 1} people</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-slate-700 text-sm font-semibold mb-3">Bookers per Closer</p>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setBookersPerCloser(v => Math.max(1, v - 1))} className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors flex items-center justify-center text-xl">−</button>
              <span className="text-4xl font-black text-slate-900 w-12 text-center tabular-nums">{bookersPerCloser}</span>
              <button onClick={() => setBookersPerCloser(v => v + 1)} className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors flex items-center justify-center text-xl">+</button>
            </div>
            <p className="text-slate-400 text-xs">lead gen staff per closing staff member</p>
          </div>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full">📞 {teamBookers} booker{teamBookers !== 1 ? 's' : ''}</span>
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-full">🏆 {teamClosers} closer{teamClosers !== 1 ? 's' : ''}</span>
          <span className="bg-slate-100 border border-slate-300 text-slate-600 text-sm font-semibold px-3 py-1.5 rounded-full">👥 {totalHeadcount} total headcount</span>
        </div>

        {/* Revenue outputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
            <p className="text-slate-500 text-xs mb-1">Weekly Revenue (all teams)</p>
            <p className="text-slate-900 font-bold text-xl">{fmtCurrency(weeklyTeamRevenue)}<span className="text-xs font-normal text-slate-400">/wk</span></p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
            <p className="text-slate-500 text-xs mb-1">Monthly Revenue (all teams)</p>
            <p className="text-slate-900 font-bold text-xl">{fmtCurrency(monthlyTeamRevenue)}<span className="text-xs font-normal text-slate-400">/mo</span></p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
            <p className="text-emerald-600 text-xs mb-1">Annual Revenue (all teams)</p>
            <p className="text-emerald-700 font-bold text-xl">{fmtCurrency(annualTeamRevenue)}<span className="text-xs font-normal text-emerald-500">/yr</span></p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
            <p className="text-amber-600 text-xs mb-1">Per Closer / Week</p>
            <p className="text-amber-700 font-bold text-xl">{fmtCurrency(revenuePerCloserWeek)}<span className="text-xs font-normal text-amber-400">/wk</span></p>
          </div>
        </div>

        {/* Funnel table per team */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
          <p className="text-slate-700 text-sm font-bold mb-1">📊 Per Team Funnel <span className="font-normal text-slate-400 text-xs">({bookersPerCloser} booker{bookersPerCloser !== 1 ? 's' : ''} → 1 closer)</span></p>
          <p className="text-slate-400 text-xs mb-3">Cut-through rates are adjustable in the Conversion Funnel section below</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left pb-2 text-slate-500 text-xs font-medium">Step</th>
                  <th className="text-center pb-2 text-slate-500 text-xs font-medium">Rate</th>
                  <th className="text-center pb-2 text-slate-500 text-xs font-medium">Daily</th>
                  <th className="text-center pb-2 text-slate-500 text-xs font-medium">Weekly</th>
                  <th className="text-center pb-2 text-slate-500 text-xs font-medium">Monthly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 text-slate-600 font-medium">📞 Calls</td>
                  <td className="py-2 text-center text-slate-400 text-xs">—</td>
                  <td className="py-2 text-center font-semibold text-slate-800 tabular-nums">{Math.round(dailyCalls * bookersPerCloser)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{Math.round(dailyCalls * bookersPerCloser * 5)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{Math.round(dailyCalls * bookersPerCloser * 21)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 font-medium">🔗 Connects</td>
                  <td className="py-2 text-center"><span className="bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 text-xs font-mono">{callsPerHour > 0 ? pct(connectsPerHour/callsPerHour) : '—'}</span></td>
                  <td className="py-2 text-center font-semibold text-slate-800 tabular-nums">{Math.round(dailyConnects * bookersPerCloser)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{Math.round(dailyConnects * bookersPerCloser * 5)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{Math.round(dailyConnects * bookersPerCloser * 21)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 font-medium">📅 Booked</td>
                  <td className="py-2 text-center"><span className="bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 text-xs font-mono">{connectsPerHour > 0 ? pct(bookingsPerHour/connectsPerHour) : '—'}</span></td>
                  <td className="py-2 text-center font-semibold text-slate-800 tabular-nums">{fmt(teamDailyBookings)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{fmt(teamDailyBookings * 5)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{fmt(teamDailyBookings * 21)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 font-medium">🤝 Attended</td>
                  <td className="py-2 text-center"><span className="bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 text-xs font-mono">{pct(attendanceRate)}</span></td>
                  <td className="py-2 text-center font-semibold text-slate-800 tabular-nums">{fmt(teamDailyAttended)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{fmt(teamDailyAttended * 5)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{fmt(teamDailyAttended * 21)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 font-medium">📋 Added to Pipe</td>
                  <td className="py-2 text-center"><span className="bg-purple-100 text-purple-700 rounded px-1.5 py-0.5 text-xs font-mono">{pct(pipeRate)}</span></td>
                  <td className="py-2 text-center font-semibold text-slate-800 tabular-nums">{fmt(teamDailyPipe)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{fmt(teamDailyPipe * 5)}</td>
                  <td className="py-2 text-center text-slate-600 tabular-nums">{fmt(teamDailyPipe * 21)}</td>
                </tr>
                <tr className="bg-emerald-50/60">
                  <td className="py-2 text-slate-700 font-bold">🏆 Deals Closed</td>
                  <td className="py-2 text-center"><span className="bg-emerald-100 text-emerald-700 rounded px-1.5 py-0.5 text-xs font-mono">{pct(closeRate)}</span></td>
                  <td className="py-2 text-center font-bold text-emerald-700 tabular-nums">{fmt(teamDailyDeals)}</td>
                  <td className="py-2 text-center font-semibold text-emerald-600 tabular-nums">{fmt(teamDailyDeals * 5)}</td>
                  <td className="py-2 text-center font-semibold text-emerald-600 tabular-nums">{fmt(teamDailyDeals * 21)}</td>
                </tr>
                <tr className="bg-amber-50/40">
                  <td className="py-2 text-slate-700 font-bold">💰 Revenue (Weekly)</td>
                  <td className="py-2 text-center text-xs text-slate-400">{fmtCurrency(Math.round(dealValuePerWeek))}/wk</td>
                  <td className="py-2 text-center font-bold text-slate-900 tabular-nums">{fmtCurrency(teamDailyRevenue)}/day</td>
                  <td className="py-2 text-center font-bold text-slate-900 tabular-nums">{fmtCurrency(teamWeeklyRevenue)}/wk</td>
                  <td className="py-2 text-center font-bold text-slate-900 tabular-nums">{fmtCurrency(teamWeeklyRevenue * 4.33)}/mo</td>
                </tr>
                <tr className="bg-amber-50/60">
                  <td className="py-2 text-slate-700 font-bold">💰 Revenue (Monthly)</td>
                  <td className="py-2 text-center text-xs text-slate-400">{fmtCurrency(dealValue)}/mo/deal</td>
                  <td className="py-2 text-center font-bold text-amber-700 tabular-nums">{fmtCurrency(teamDailyRevenue * 4.33)}</td>
                  <td className="py-2 text-center font-bold text-amber-700 tabular-nums">{fmtCurrency(teamWeeklyRevenue * 4.33)}</td>
                  <td className="py-2 text-center font-bold text-amber-700 tabular-nums">{fmtCurrency(teamMonthlyRevenue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* EOY target + DTG */}
        <div className="border-t border-slate-200 pt-4 mb-5">
          <p className="text-slate-700 text-sm font-semibold mb-3">🎯 EOY Target &amp; Distance to Go</p>

          {/* Time context */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
              <p className="text-slate-400 text-xs mb-0.5">Target Date</p>
              <p className="text-slate-900 font-bold">17 Dec 2026</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
              <p className="text-slate-400 text-xs mb-0.5">Working Days Left</p>
              <p className="text-slate-900 font-bold text-2xl tabular-nums">{workingDaysLeft}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
              <p className="text-slate-400 text-xs mb-0.5">Weeks Left</p>
              <p className="text-slate-900 font-bold text-2xl tabular-nums">{weeksToTarget}</p>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <p className="text-blue-700 text-xs font-semibold mb-1">ℹ️ All figures below are <strong>weekly recurring revenue ($)</strong> — not totals</p>
            <p className="text-blue-600 text-xs">e.g. target = $250k/wk recurring · current = $142k/wk recurring · loss = churn per working day</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-slate-500 text-xs mb-1">Weekly Recurring Target ($/wk)</label>
              <input type="number" value={eoyTarget} onChange={e => setEoyTarget(Math.max(0, parseInt(e.target.value) || 0))} className="bg-white border border-slate-300 rounded-xl text-slate-900 font-bold px-3 py-2 w-full focus:outline-none focus:border-blue-400" step={1000} />
            </div>
            <div>
              <label className="block text-slate-500 text-xs mb-1">Current Weekly Recurring ($/wk)</label>
              <input type="number" value={currentRevenue} onChange={e => setCurrentRevenue(Math.max(0, parseInt(e.target.value) || 0))} className="bg-white border border-slate-300 rounded-xl text-slate-900 font-bold px-3 py-2 w-full focus:outline-none focus:border-emerald-400" step={1000} placeholder="0" />
            </div>
            <div>
              <label className="block text-slate-500 text-xs mb-1">Retention Churn / Working Day ($)</label>
              <input type="number" value={retentionLossPerDay} onChange={e => setRetentionLossPerDay(Math.max(0, parseInt(e.target.value) || 0))} className="bg-white border border-slate-300 rounded-xl text-slate-900 font-bold px-3 py-2 w-full focus:outline-none focus:border-red-400" step={50} />
            </div>
            <div>
              <label className="block text-slate-500 text-xs mb-1">Current Teams Running</label>
              <input type="number" value={currentTeams} onChange={e => setCurrentTeams(Math.max(0, parseInt(e.target.value) || 0))} className="bg-white border border-slate-300 rounded-xl text-slate-900 font-bold px-3 py-2 w-full focus:outline-none focus:border-purple-400" step={1} min={0} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{fmtCurrency(currentRevenue)}/wk now</span>
              <span>{eoyTarget > 0 ? Math.min(100, Math.round((currentRevenue / eoyTarget) * 100)) : 0}% of weekly target</span>
              <span>{fmtCurrency(eoyTarget)}/wk target</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                style={{ width: `${eoyTarget > 0 ? Math.min(100, (currentRevenue / eoyTarget) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* DTG stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-red-50 rounded-xl p-3 text-center border border-red-200">
              <p className="text-red-500 text-xs mb-0.5">Weekly Gap</p>
              <p className="text-red-700 font-bold text-xl tabular-nums">{fmtCurrency(dtg)}</p>
              <p className="text-slate-400 text-xs">/wk more recurring needed</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-200">
              <p className="text-orange-500 text-xs mb-0.5">Total New Recurring Needed</p>
              <p className="text-orange-700 font-bold text-xl tabular-nums">{fmtCurrency(Math.round(dtgAdjusted))}</p>
              <p className="text-slate-400 text-xs">gap + churn over {weeksToTarget} wks</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
              <p className="text-slate-500 text-xs mb-0.5">Total Churn to Replace</p>
              <p className="text-slate-900 font-bold text-xl tabular-nums">{fmtCurrency(Math.round(totalChurnErosion))}</p>
              <p className="text-slate-400 text-xs">{fmtCurrency(retentionLossPerWeek)}/wk × {weeksToTarget} wks</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
              <p className="text-slate-500 text-xs mb-0.5">Total Deals to Close</p>
              <p className="text-slate-900 font-bold text-xl tabular-nums">{totalDealsNeeded}</p>
              <p className="text-slate-400 text-xs">over {weeksToTarget} wks @ {fmtCurrency(dealValue)}/mo each</p>
            </div>
          </div>

          {/* Teams needed */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="bg-slate-50 rounded-xl px-4 py-2.5 text-center min-w-[130px] border border-slate-200">
              <p className="text-slate-400 text-xs">Total Teams Needed</p>
              <p className="text-slate-900 font-bold text-2xl">{teamsToHitDtg}</p>
              <p className="text-slate-400 text-xs">{additionalTeamsNeeded} additional to hire</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-2.5 text-center min-w-[130px] border border-slate-200">
              <p className="text-slate-400 text-xs">Total Team Members</p>
              <p className="text-slate-900 font-bold text-2xl">{totalHeadcount2}</p>
              <p className="text-slate-400 text-xs">{additionalHeadcount} new hires needed</p>
            </div>
            <div className="bg-orange-50 border border-orange-300 rounded-xl px-5 py-2.5 text-center min-w-[150px]">
              <p className="text-orange-600 text-xs font-semibold uppercase tracking-wide">Additional Hires Needed</p>
              <p className="text-orange-500 font-bold text-3xl">{additionalHeadcount}</p>
              <p className="text-slate-400 text-xs">{additionalTeamsNeeded} teams · {bookersPerCloser}:1 ratio</p>
            </div>
            <div className="text-xs text-slate-500 flex-1 space-y-1">
              <p>📍 Gap: {fmtCurrency(currentRevenue)} → {fmtCurrency(eoyTarget)}/wk = <strong className="text-slate-800">{fmtCurrency(dtg)}/wk</strong> to add</p>
              <p>🔁 Churn: {fmtCurrency(retentionLossPerWeek)}/wk × {weeksToTarget} wks = <strong className="text-slate-800">{fmtCurrency(Math.round(totalChurnErosion))}</strong> to replace</p>
              <p>🎯 Total new recurring to build: <strong className="text-slate-800">{fmtCurrency(Math.round(dtgAdjusted))}</strong></p>
              <p>📈 1 team closes {fmt(weeklyDealsPerTeam)} deals/wk × {weeksToTarget} wks × {fmtCurrency(Math.round(dealValuePerWeek))}/wk = <strong className="text-slate-800">{fmtCurrency(Math.round(oneTeamRecurringByDeadline))}</strong> recurring by Dec 17</p>
            </div>
          </div>
        </div>

        {/* Benchmark data */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-slate-700 text-sm font-bold mb-3">⭐ Benchmark Data — Marketing Sweet</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-emerald-700 text-xs font-bold uppercase tracking-wide mb-3">📅 Best Month · July 2025</p>
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-slate-400 text-xs mb-0.5">Total Staff</p><p className="font-bold text-slate-800">8</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Closers</p><p className="font-bold text-slate-800">3.2</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Callers</p><p className="font-bold text-slate-800">4.8</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">OB Calls</p><p className="font-bold text-slate-800">5,975</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Bookings</p><p className="font-bold text-slate-800">623</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Attended</p><p className="font-bold text-slate-800">211</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Deals</p><p className="font-bold text-slate-800">78</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Avg Deal</p><p className="font-bold text-slate-800">$129</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Per Closer/Wk</p><p className="font-bold text-slate-800">$3,138</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
                <span className="text-slate-500 text-xs">Weekly Revenue</span>
                <span className="font-black text-emerald-700 text-lg">$10,043</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-blue-700 text-xs font-bold uppercase tracking-wide mb-3">🏆 Best Week · August 2025</p>
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-slate-400 text-xs mb-0.5">Meetings</p><p className="font-bold text-slate-800">46</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Proposals</p><p className="font-bold text-slate-800">37</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Deals</p><p className="font-bold text-slate-800">25</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Prop. Value</p><p className="font-bold text-slate-800">$4,967</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Best Day</p><p className="font-bold text-slate-800">$1,849</p></div>
                <div><p className="text-slate-400 text-xs mb-0.5">Day Avg</p><p className="font-bold text-slate-800">$783</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-xs block">Week Revenue</span>
                  <span className="font-black text-blue-700 text-lg">$3,914</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Pipe Close Rate</span>
                  <span className="font-black text-blue-700 text-lg">54%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <header className="bg-slate-900 text-white mt-6">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2"><span>📊</span> Revenue Projections v2</h1>
                <p className="text-sm text-slate-400">Per-team projections · adjustable funnel cut-throughs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/projections" className="px-3 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-600 transition-colors">← v1</Link>
              <Link href="/commissions-sales-staff" className="px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">💰 Sales Comms</Link>
              <Link href="/forecast" className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">📈 Team Forecast →</Link>
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
                  <input type="number" value={bookingsPerHour} onChange={(e) => setBookingsPerHour(Math.max(0, parseFloat(e.target.value) || 0))} step={0.1} min={0} className="w-36 text-center text-4xl font-black text-slate-900 tabular-nums bg-transparent border-b-2 border-gray-200 focus:border-slate-900 outline-none" />
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

        {/* Snapshot — shows per-team figures */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Per Team Snapshot <span className="normal-case font-normal text-gray-300">({bookersPerCloser} booker{bookersPerCloser!==1?'s':''} + 1 closer · {phoneHours}hrs/day)</span></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Daily Lead Gen</h3>
              <div className="grid grid-cols-3 gap-2">
                {[{ emoji: "📞", val: Math.round(dailyCalls * bookersPerCloser), label: "Calls" }, { emoji: "🔗", val: Math.round(dailyConnects * bookersPerCloser), label: "Connects" }, { emoji: "📅", val: fmt(teamDailyBookings), label: "Bookings", highlight: true }].map((item) => (
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
                {[{ emoji: "🤝", val: fmt(teamDailyAttended), label: "Attended" }, { emoji: "🏆", val: fmt(teamDailyDeals), label: "Deals" }, { emoji: "💰", val: fmtCurrency(teamDailyRevenue), label: "Revenue", highlight: true }].map((item) => (
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
                {[{ emoji: "📅", val: fmt(weeklyBookings), label: "Bookings", highlight: true }, { emoji: "🏆", val: fmt(weeklyDeals), label: "Deals" }, { emoji: "💰", val: fmtCurrency(teamWeeklyRevenue), label: "Revenue", highlight: true }].map((item) => (
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
            {[{ emoji: "📞", value: (Math.round(dailyCalls * bookersPerCloser * weekdayCount)).toLocaleString(), label: "Total Calls", sub: `${weekdayCount} working days` }, { emoji: "🔗", value: (Math.round(dailyConnects * bookersPerCloser * weekdayCount)).toLocaleString(), label: "Total Connects", sub: "" }, { emoji: "📅", value: fmt(monthlyBookings), label: "Total Bookings", sub: `${fmt(teamDailyBookings)}/day` }].map((item) => (
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
            <h2 className="text-sm font-bold text-slate-900">Conversion Funnel (per booker, per hour)</h2>
          </div>
          <p className="text-[10px] text-gray-400 mb-4 ml-10">Click any value in the <strong>Per Hour</strong> or <strong>Rate</strong> columns to adjust. These rates drive the Team Calculator above.</p>

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
                  <td className="py-2.5 text-center"><FunnelInput value={Math.round(attendanceRate * 100)} onChange={(v) => setAttendanceRate(Math.min(1, v / 100))} step={1} min={1} width="w-12" suffix="%" /></td>
                  <td className="py-2.5 text-center text-gray-400">of Bookings</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2.5 font-medium text-gray-700">📋 Added to Pipe</td>
                  <td className="py-2.5 text-center text-slate-900 font-bold tabular-nums">{fmt(pipePerHour)}</td>
                  <td className="py-2.5 text-center text-gray-600 font-semibold tabular-nums">{fmt(dailyAttended)}</td>
                  <td className="py-2.5 text-center"><FunnelInput value={Math.round(pipeRate * 100)} onChange={(v) => setPipeRate(Math.min(1, v / 100))} step={1} min={1} width="w-12" suffix="%" /></td>
                  <td className="py-2.5 text-center text-gray-400">of Attended</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="py-2.5 font-medium text-gray-700">🏆 Deals</td>
                  <td className="py-2.5 text-center text-slate-900 font-bold tabular-nums">{fmt(dealsPerHour)}</td>
                  <td className="py-2.5 text-center text-gray-600 font-semibold tabular-nums">{fmt(dailyDeals)}</td>
                  <td className="py-2.5 text-center"><FunnelInput value={Math.round(closeRate * 100)} onChange={(v) => setCloseRate(Math.min(1, v / 100))} step={1} min={1} width="w-12" suffix="%" /></td>
                  <td className="py-2.5 text-center text-gray-400">of Pipe</td>
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
            Bookings → Attended: {pct(attendanceRate)} · Attended → Pipe: {pct(pipeRate)} · Pipe → Deals: {pct(closeRate)} · Deal value: {fmtCurrency(dealValue)} · Meetings occur 3–5 business days after booking.
          </div>
        </div>

      </div>
    </main>
  );
}

export default function Projections2Page() {
  return (
    <PasswordGate requireMaster>
      <Projections2Content />
    </PasswordGate>
  );
}
