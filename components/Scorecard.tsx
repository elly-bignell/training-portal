// components/Scorecard.tsx

"use client";

import { useState } from "react";
import { useActivityTracking, getCurrentWeekNumber, getDayOfWeek, weeklyStandards } from "@/hooks/useActivityTracking";

interface ScorecardProps {
  traineeSlug: string;
  traineeName: string;
}

interface MetricCardProps {
  label: string;
  value: number;
  target: number;
  weeklyValue: number;
  weeklyTarget: number;
  color: string;
  icon: string;
  onIncrement: () => void;
  onDecrement: () => void;
  isCurrency?: boolean;
  allowDecimal?: boolean;
  isSaving?: boolean;
}

function MetricCard({
  label,
  value,
  target,
  weeklyValue,
  weeklyTarget,
  color,
  icon,
  onIncrement,
  onDecrement,
  isCurrency = false,
  allowDecimal = false,
  isSaving = false,
}: MetricCardProps) {
  const dailyPct = target > 0 ? Math.min(100, (value / target) * 100) : 100;
  const weeklyPct = weeklyTarget > 0 ? Math.min(100, (weeklyValue / weeklyTarget) * 100) : 100;
  const isOnTrack = target > 0 && dailyPct >= 100;

  const formatValue = (v: number) => {
    if (isCurrency) return `$${v.toLocaleString()}`;
    if (allowDecimal && v % 1 !== 0) return v.toFixed(1);
    return v.toString();
  };

  return (
    <div className={`rounded-xl p-3 sm:p-4 ${color} relative overflow-hidden`}>
      {/* Background icon */}
      <div className="absolute top-2 right-2 text-2xl sm:text-4xl opacity-20">{icon}</div>
      
      {/* Status indicator */}
      {isOnTrack && (
        <div className="mb-1 sm:mb-2">
          <span className="text-[9px] sm:text-[10px] bg-white/30 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-semibold">✓ On track</span>
        </div>
      )}
      
      {/* Label */}
      <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wide mb-0.5 sm:mb-1">
        {label}
      </div>
      
      {/* Today's value */}
      <div className="flex items-end gap-1 sm:gap-2 mb-1 sm:mb-2">
        <span className="text-2xl sm:text-3xl font-bold text-white">{formatValue(value)}</span>
        <span className="text-[10px] sm:text-sm text-white/60 mb-0.5 sm:mb-1">/ {formatValue(target)}</span>
      </div>
      
      {/* Daily progress bar */}
      <div className="h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden mb-2 sm:mb-3">
        <div
          className="h-full bg-white rounded-full transition-all duration-300"
          style={{ width: `${dailyPct}%` }}
        />
      </div>
      
      {/* Weekly progress */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/70 mb-2 sm:mb-3">
        <span>WTD: {formatValue(weeklyValue)}/{formatValue(weeklyTarget)}</span>
        <span className={weeklyPct >= 100 && weeklyTarget > 0 ? "text-white font-semibold" : ""}>
          {weeklyTarget > 0 ? `${Math.round(weeklyPct)}%` : "—"}
        </span>
      </div>
      
      {/* Increment/Decrement buttons */}
      <div className="flex gap-1.5 sm:gap-2">
        <button
          onClick={onDecrement}
          disabled={value <= 0 || isSaving}
          className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white/20 text-white text-sm sm:text-base font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          −1
        </button>
        <button
          onClick={onIncrement}
          disabled={isSaving}
          className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white text-gray-800 text-sm sm:text-base font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          +1
        </button>
      </div>
    </div>
  );
}

function RevenueInput({
  value,
  target,
  weeklyValue,
  weeklyTarget,
  onSetValue,
  isSaving,
}: {
  value: number;
  target: number;
  weeklyValue: number;
  weeklyTarget: number;
  onSetValue: (val: number) => void;
  isSaving: boolean;
}) {
  const [inputValue, setInputValue] = useState(value.toString());
  const dailyPct = target > 0 ? Math.min(100, (value / target) * 100) : 100;
  const weeklyPct = weeklyTarget > 0 ? Math.min(100, (weeklyValue / weeklyTarget) * 100) : 100;
  const isOnTrack = target > 0 && dailyPct >= 100;

  const handleSubmit = () => {
    const numVal = parseFloat(inputValue) || 0;
    onSetValue(numVal);
  };

  return (
    <div className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 relative overflow-hidden">
      <div className="absolute top-2 right-2 text-2xl sm:text-4xl opacity-20">💰</div>
      
      {isOnTrack && (
        <div className="mb-1 sm:mb-2">
          <span className="text-[9px] sm:text-[10px] bg-white/30 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-semibold">✓ On track</span>
        </div>
      )}
      
      <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wide mb-0.5 sm:mb-1">
        Sales Revenue ($)
      </div>
      
      <div className="flex items-end gap-1 sm:gap-2 mb-1 sm:mb-2">
        <span className="text-2xl sm:text-3xl font-bold text-white">${value.toLocaleString()}</span>
        <span className="text-[10px] sm:text-sm text-white/60 mb-0.5 sm:mb-1">/ ${target}</span>
      </div>
      
      <div className="h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden mb-2 sm:mb-3">
        <div
          className="h-full bg-white rounded-full transition-all duration-300"
          style={{ width: `${dailyPct}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/70 mb-2 sm:mb-3">
        <span>WTD: ${weeklyValue.toLocaleString()}/${weeklyTarget.toLocaleString()}</span>
        <span className={weeklyPct >= 100 && weeklyTarget > 0 ? "text-white font-semibold" : ""}>
          {weeklyTarget > 0 ? `${Math.round(weeklyPct)}%` : "—"}
        </span>
      </div>
      
      {/* Revenue input */}
      <div className="flex gap-1.5 sm:gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full py-1.5 sm:py-2 pl-5 sm:pl-7 pr-2 sm:pr-3 rounded-lg text-gray-800 text-sm sm:text-base font-semibold"
            placeholder="0"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white text-emerald-600 text-sm sm:text-base font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function Scorecard({ traineeSlug, traineeName }: ScorecardProps) {
  const {
    todayActivity,
    weeklyData,
    isLoading,
    isSaving,
    currentWeek,
    incrementMetric,
    setMetric,
    getDailyStandard,
    getWeeklyStandard,
  } = useActivityTracking(traineeSlug, traineeName);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Loading scorecard...
        </div>
      </div>
    );
  }

  const dailyStandard = getDailyStandard();
  const weeklyStandard = getWeeklyStandard();
  const weeklyTotals = weeklyData?.weeklyTotals || { calls_made: 0, calls: 0, bookings: 0, follow_up_call_scheduled: 0, meetings: 0, units: 0, revenue: 0 };

  // Calculate overall % to standard for the day
  const metrics = ["calls_made", "calls", "bookings", "meetings", "units", "revenue"] as const;
  const dailyPcts = metrics.map((m) => {
    const target = dailyStandard[m];
    return target > 0 ? Math.min(100, (todayActivity[m] / target) * 100) : 100;
  });
  const overallDailyPct = Math.round(dailyPcts.reduce((a, b) => a + b, 0) / dailyPcts.length);

  // Week phase label
  const getWeekLabel = () => {
    if (currentWeek === 0) return "Training Week";
    if (currentWeek === 6) return "🎯 The Standard";
    if (currentWeek > 6) return "Maintaining Standard";
    return `Week ${currentWeek} (Ramp)`;
  };

  // Day of week for context
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayIndex = getDayOfWeek();
  const todayName = dayIndex >= 0 && dayIndex < 5 ? dayNames[dayIndex] : "Weekend";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 sm:p-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold">Today&apos;s Scorecard</h2>
            <p className="text-slate-300 text-xs sm:text-sm">{todayName} • {getWeekLabel()}</p>
          </div>
          <div className="flex items-center gap-3 sm:block sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold">{overallDailyPct}%</div>
            <div className="text-[10px] sm:text-xs text-slate-400">to daily target</div>
          </div>
        </div>
        
        {/* Overall progress bar */}
        <div className="h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallDailyPct}%`,
              background: overallDailyPct >= 100
                ? "linear-gradient(to right, #84D4BD, #4ade80)"
                : "linear-gradient(to right, #E6017D, #ff4da6)",
            }}
          />
        </div>
        
        {isSaving && (
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
            Saving...
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          {/* Row 1: Calls Made → Calls Connected → Bookings */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Calls Made */}
            <MetricCard
              label="Calls"
              value={todayActivity.calls_made}
              target={dailyStandard.calls_made}
              weeklyValue={weeklyTotals.calls_made}
              weeklyTarget={weeklyStandard.calls_made}
              color="bg-gradient-to-br from-slate-500 to-slate-600"
              icon="📞"
              onIncrement={() => incrementMetric("calls_made", 1)}
              onDecrement={() => incrementMetric("calls_made", -1)}
              isSaving={isSaving}
            />
            
            {/* Calls Connected */}
            <MetricCard
              label="Connected"
              value={todayActivity.calls}
              target={dailyStandard.calls}
              weeklyValue={weeklyTotals.calls}
              weeklyTarget={weeklyStandard.calls}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              icon="🔗"
              onIncrement={() => incrementMetric("calls", 1)}
              onDecrement={() => incrementMetric("calls", -1)}
              isSaving={isSaving}
            />
            
            {/* Bookings Made */}
            <MetricCard
              label="Bookings"
              value={todayActivity.bookings}
              target={dailyStandard.bookings}
              weeklyValue={weeklyTotals.bookings}
              weeklyTarget={weeklyStandard.bookings}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              icon="📅"
              onIncrement={() => incrementMetric("bookings", 1)}
              onDecrement={() => incrementMetric("bookings", -1)}
              isSaving={isSaving}
            />
          </div>

          {/* Row 2: Follow Up Call Scheduled + Meetings + Sales Units */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Follow Up Call Scheduled */}
            <MetricCard
              label="Follow Up Call"
              value={todayActivity.follow_up_call_scheduled ?? 0}
              target={dailyStandard.follow_up_call_scheduled ?? 0}
              weeklyValue={weeklyTotals.follow_up_call_scheduled ?? 0}
              weeklyTarget={weeklyStandard.follow_up_call_scheduled ?? 0}
              color="bg-gradient-to-br from-cyan-500 to-cyan-600"
              icon="📲"
              onIncrement={() => incrementMetric("follow_up_call_scheduled", 1)}
              onDecrement={() => incrementMetric("follow_up_call_scheduled", -1)}
              isSaving={isSaving}
            />

            {/* Attended Meetings */}
            <MetricCard
              label="Meetings"
              value={todayActivity.meetings}
              target={dailyStandard.meetings}
              weeklyValue={weeklyTotals.meetings}
              weeklyTarget={weeklyStandard.meetings}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              icon="🤝"
              onIncrement={() => incrementMetric("meetings", 1)}
              onDecrement={() => incrementMetric("meetings", -1)}
              isSaving={isSaving}
            />
            
            {/* Sales Units */}
            <MetricCard
              label="Sales Units"
              value={todayActivity.units}
              target={dailyStandard.units}
              weeklyValue={weeklyTotals.units}
              weeklyTarget={weeklyStandard.units}
              color="bg-gradient-to-br from-pink-500 to-[#E6017D]"
              icon="🎯"
              onIncrement={() => incrementMetric("units", 0.5)}
              onDecrement={() => incrementMetric("units", -0.5)}
              allowDecimal
              isSaving={isSaving}
            />
          </div>
          
          {/* Row 3: Revenue (full width) */}
          <RevenueInput
            value={todayActivity.revenue}
            target={dailyStandard.revenue}
            weeklyValue={weeklyTotals.revenue}
            weeklyTarget={weeklyStandard.revenue}
            onSetValue={(val) => setMetric("revenue", val)}
            isSaving={isSaving}
          />
        </div>
      </div>

      {/* Quick stats footer */}
      <div className="border-t border-gray-100 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
        <span>
          📊 Week {currentWeek}/8
        </span>
        {weeklyTotals.calls_made > 0 && (
          <span>
            Connect: {weeklyTotals.calls > 0 ? Math.round((weeklyTotals.calls / weeklyTotals.calls_made) * 100) : 0}%
          </span>
        )}
        {weeklyTotals.calls > 0 && (
          <span>
            Book: {weeklyTotals.bookings > 0 ? Math.round((weeklyTotals.bookings / weeklyTotals.calls) * 100) : 0}%
          </span>
        )}
        {weeklyTotals.bookings > 0 && (
          <span>
            Attend: {weeklyTotals.meetings > 0 ? Math.round((weeklyTotals.meetings / weeklyTotals.bookings) * 100) : 0}%
          </span>
        )}
        {weeklyTotals.meetings > 0 && (
          <span>
            Close: {weeklyTotals.units > 0 ? Math.round((weeklyTotals.units / weeklyTotals.meetings) * 100) : 0}%
          </span>
        )}
      </div>
    </div>
  );
}
