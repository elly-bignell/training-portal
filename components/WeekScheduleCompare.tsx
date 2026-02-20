// components/WeekScheduleCompare.tsx

"use client";

import { useState } from "react";

interface ScheduleBlock {
  label: string;
  time: string;
  duration?: string;
  color: string;
  details?: string[];
  subtitle?: string;
  rowSpan?: number;
}

interface DaySchedule {
  arrivals?: string[];
  blocks: Record<string, ScheduleBlock | null>;
  departures?: string[];
  evening?: string[];
}

type WeekData = Record<string, DaySchedule>;

const colorClasses: Record<string, string> = {
  training: "bg-blue-50 border-blue-200 text-blue-700",
  c4c: "bg-cyan-50 border-cyan-200 text-cyan-700",
  supervised: "bg-yellow-50 border-yellow-200 text-yellow-700",
  process: "bg-emerald-50 border-emerald-200 text-emerald-700",
  customer: "bg-teal-50 border-teal-200 text-teal-700",
  quodo: "bg-purple-50 border-purple-200 text-purple-700",
  objection: "bg-rose-50 border-rose-200 text-rose-700",
  roleplay: "bg-orange-50 border-orange-200 text-orange-700",
  lunch: "bg-amber-50 border-amber-200 text-amber-700",
  welcome: "bg-blue-50 border-blue-200 text-blue-700",
  empty: "",
};

const PLAN_SCHEDULE: WeekData = {
  "Mon 16 Feb": {
    arrivals: [
      "Cindy · Sydney → Adelaide · Departs 6:40am · Lands 8:15am",
      "Becks · Brisbane → Adelaide · Departs 6:35am · Lands 9:50am",
    ],
    blocks: {
      "8:30am": null,
      "9:00am": {
        label: "Welcome",
        time: "9:00am–12:30pm",
        duration: "3.5hrs",
        color: "welcome",
        subtitle: "Cindy, Krishna, Connie from 9:00am\nBecks joins from 10:00am",
        details: ["Tech Setup", "This Week's Schedule", "Competencies", "Standards", "Scorecards"],
        rowSpan: 7,
      },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": {
        label: "Process & Technology",
        time: "1:30–5:00pm",
        duration: "3.5hrs",
        color: "process",
        details: ["Booking Admin", "Deal Admin", "Semrush", "Slack", "Discord", "Google Calendars", "Zoom", "Wappalyzer"],
        rowSpan: 7,
      },
    },
    departures: [],
    evening: [],
  },
  "Tue 17 Feb": {
    blocks: {
      "8:30am": { label: "Complete Resource Modules", time: "8:30–9:30am", duration: "1hr", color: "training", rowSpan: 2 },
      "9:30am": { label: "📞 Call for Call (C4C)", time: "9:30–11:00am", duration: "1.5hrs", color: "c4c", rowSpan: 3 },
      "11:00am": { label: "📞 Supervised Calls", time: "11:00am–12:30pm", duration: "1.5hrs", color: "supervised", rowSpan: 3 },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": { label: "Customer Service Team", time: "1:30–2:30pm", duration: "1hr", color: "customer", subtitle: "Training w/ Trent", rowSpan: 2 },
      "2:30pm": { label: "Quodo Production", time: "2:30–5:00pm", duration: "2.5hrs", color: "quodo", subtitle: "Training w/ Taylor", rowSpan: 5 },
    },
    departures: [],
    evening: [],
  },
  "Wed 18 Feb": {
    blocks: {
      "8:30am": { label: "Complete Resource Modules", time: "8:30–9:30am", duration: "1hr", color: "training", rowSpan: 2 },
      "9:30am": { label: "📞 Call for Call (C4C)", time: "9:30–11:00am", duration: "1.5hrs", color: "c4c", rowSpan: 3 },
      "11:00am": { label: "📞 Supervised Calls", time: "11:00am–12:30pm", duration: "1.5hrs", color: "supervised", rowSpan: 3 },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": { label: "Quodo Production", time: "1:30–5:00pm", duration: "3.5hrs", color: "quodo", subtitle: "Training w/ Taylor", rowSpan: 7 },
    },
    departures: [],
    evening: [],
  },
  "Thu 19 Feb": {
    blocks: {
      "8:30am": { label: "Complete Resource Modules", time: "8:30–9:30am", duration: "1hr", color: "training", rowSpan: 2 },
      "9:30am": { label: "📞 Call for Call (C4C)", time: "9:30–11:00am", duration: "1.5hrs", color: "c4c", rowSpan: 3 },
      "11:00am": { label: "📞 Supervised Calls", time: "11:00am–12:30pm", duration: "1.5hrs", color: "supervised", rowSpan: 3 },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": { label: "Objection Handling", time: "1:30–5:00pm", duration: "3.5hrs", color: "objection", rowSpan: 7 },
    },
    departures: [],
    evening: [],
  },
  "Fri 20 Feb": {
    blocks: {
      "8:30am": { label: "Complete Resource Modules", time: "8:30–9:30am", duration: "1hr", color: "training", rowSpan: 2 },
      "9:30am": { label: "📞 Call for Call (C4C)", time: "9:30–11:00am", duration: "1.5hrs", color: "c4c", rowSpan: 3 },
      "11:00am": { label: "📞 Supervised Calls", time: "11:00am–12:30pm", duration: "1.5hrs", color: "supervised", rowSpan: 3 },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": { label: "Role Playing", time: "1:30–5:00pm", duration: "3.5hrs", color: "roleplay", rowSpan: 7 },
    },
    departures: [
      "Saturday 21 Feb",
      "Cindy · Adelaide → Sydney · Departs 12:35pm · Arrives 3:00pm",
      "Becks · Adelaide → Brisbane · Departs 10:55am · Arrives 12:55pm",
    ],
    evening: [],
  },
};

// Start with plan as a copy — Elly will provide changes
const ACTUAL_SCHEDULE: WeekData = JSON.parse(JSON.stringify(PLAN_SCHEDULE));

const TIME_SLOTS = [
  "8:30am", "9:00am", "9:30am", "10:00am", "10:30am",
  "11:00am", "11:30am", "12:00pm", "12:30pm", "1:00pm",
  "1:30pm", "2:00pm", "2:30pm", "3:00pm", "3:30pm",
  "4:00pm", "4:30pm",
];

const DAYS = ["Mon 16 Feb", "Tue 17 Feb", "Wed 18 Feb", "Thu 19 Feb", "Fri 20 Feb"];

function ScheduleTable({ data, label }: { data: WeekData; label: string }) {
  // Track which cells are covered by rowSpan
  const coveredCells: Record<string, Set<string>> = {};
  DAYS.forEach((day) => {
    coveredCells[day] = new Set();
  });

  // Pre-calculate which cells are covered
  DAYS.forEach((day) => {
    const dayData = data[day];
    if (!dayData) return;
    TIME_SLOTS.forEach((slot, idx) => {
      const block = dayData.blocks[slot];
      if (block && block.rowSpan && block.rowSpan > 1) {
        for (let i = 1; i < block.rowSpan; i++) {
          if (idx + i < TIME_SLOTS.length) {
            coveredCells[day].add(TIME_SLOTS[idx + i]);
          }
        }
      }
    });
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="p-1.5 text-left font-semibold w-16 border border-slate-700 text-[10px]">Time</th>
            {DAYS.map((day) => (
              <th key={day} className="p-1.5 text-center font-semibold border border-slate-700 text-[10px]">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Arrivals */}
          <tr>
            <td className="p-1.5 font-medium text-gray-600 border border-gray-200 bg-gray-50 text-[10px] whitespace-nowrap">✈️ Arrivals</td>
            {DAYS.map((day) => {
              const arrivals = data[day]?.arrivals;
              return (
                <td key={day} className="p-1.5 text-center border border-gray-200 align-top text-[10px]">
                  {arrivals && arrivals.length > 0 ? (
                    <div className="space-y-1">
                      {arrivals.map((a, i) => (
                        <div key={i} className="text-[9px] text-gray-500">{a}</div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              );
            })}
          </tr>

          {/* Time slots */}
          {TIME_SLOTS.map((slot) => (
            <tr key={slot}>
              <td className="p-1.5 font-medium text-gray-600 border border-gray-200 bg-gray-50 text-[10px] whitespace-nowrap">{slot}</td>
              {DAYS.map((day) => {
                // Skip if covered by rowSpan from above
                if (coveredCells[day].has(slot)) return null;

                const dayData = data[day];
                const block = dayData?.blocks[slot];

                if (!block) {
                  return (
                    <td key={day} className="p-1.5 text-center border border-gray-200 text-gray-300 text-[10px]">—</td>
                  );
                }

                const cls = colorClasses[block.color] || "";

                return (
                  <td
                    key={day}
                    rowSpan={block.rowSpan || 1}
                    className={`p-2 text-center border border-gray-200 align-top ${cls}`}
                  >
                    <div className="font-bold text-[11px]">{block.label}</div>
                    <div className="text-[9px] opacity-70 mt-0.5">{block.time}{block.duration ? ` · ${block.duration}` : ""}</div>
                    {block.subtitle && (
                      <div className="text-[9px] opacity-60 mt-0.5 whitespace-pre-line">{block.subtitle}</div>
                    )}
                    {block.details && (
                      <div className="text-left mt-1.5 space-y-0.5">
                        {block.details.map((d, i) => (
                          <div key={i} className="text-[9px] opacity-60">• {d}</div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Departures */}
          <tr>
            <td className="p-1.5 font-medium text-gray-600 border border-gray-200 bg-gray-50 text-[10px] whitespace-nowrap">✈️ Departures</td>
            {DAYS.map((day) => {
              const departures = data[day]?.departures;
              return (
                <td key={day} className="p-1.5 text-center border border-gray-200 align-top text-[10px]">
                  {departures && departures.length > 0 ? (
                    <div className="space-y-1">
                      {departures.map((d, i) => (
                        <div key={i} className={`text-[9px] ${i === 0 ? "font-semibold italic text-gray-600" : "text-gray-500"}`}>{d}</div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[9px]">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></span>Training / Modules</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-50 border border-cyan-200"></span>Call for Call (C4C)</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-50 border border-yellow-200"></span>Supervised Calls</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200"></span>Process & Technology</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-50 border border-teal-200"></span>Customer Service</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-50 border border-purple-200"></span>Quodo Production</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-50 border border-rose-200"></span>Objection Handling</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-50 border border-orange-200"></span>Role Playing</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200"></span>Lunch</div>
      </div>
    </div>
  );
}

export default function WeekScheduleCompare() {
  const [view, setView] = useState<"plan" | "actual">("plan");

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg">📅</div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Weekly Plan vs Actual</h2>
          <p className="text-xs text-slate-400">Compare what we planned vs what actually happened</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-5 w-fit">
        <button
          onClick={() => setView("plan")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            view === "plan" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          📐 The Plan
        </button>
        <button
          onClick={() => setView("actual")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            view === "actual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          📊 What Actually Happened
        </button>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        {view === "plan" ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold uppercase">Plan</span>
              <span className="text-xs text-slate-400">Training Week · Mon 16 Feb – Fri 20 Feb 2026</span>
            </div>
            <ScheduleTable data={PLAN_SCHEDULE} label="Plan" />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold uppercase">Actual</span>
              <span className="text-xs text-slate-400">Training Week · Mon 16 Feb – Fri 20 Feb 2026</span>
            </div>
            <ScheduleTable data={ACTUAL_SCHEDULE} label="Actual" />
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              💡 This schedule will be updated with the actual changes that were made during the week.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
