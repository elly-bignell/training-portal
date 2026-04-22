// components/ChecklistTab.tsx
//
// Renders the week's checklist for a single booker — 5 day columns,
// each row has a 3-state toggle (Not Complete → Complete → N/A) and an
// optional note field. Auto-saves with a 400ms debounce.
//
// Admin mode (isAdmin=true) gets a week-picker dropdown at the top.

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CHECKLIST_SECTIONS,
  DAYS,
  ItemStatus,
  ItemState,
  WeekData,
  ALL_ITEM_IDS,
} from "@/data/checklistTemplate";
import {
  dayLabel,
  formatWeekRange,
  getCurrentWeekStart,
} from "@/lib/week";

interface ChecklistTabProps {
  bookerSlug: string;
  bookerName: string;
  isAdmin: boolean;
  readOnly?: boolean;
}

const STATUS_CYCLE: Record<string, ItemStatus> = {
  null: "complete",
  complete: "na",
  na: null as unknown as ItemStatus, // back to Not Complete
};

function nextStatus(s: ItemStatus): ItemStatus {
  if (s === null || s === undefined) return "complete";
  if (s === "complete") return "na";
  return null;
}

function statusLabel(s: ItemStatus): string {
  if (s === "complete") return "Complete";
  if (s === "na") return "N/A";
  return "Not Complete";
}

function statusClasses(s: ItemStatus): string {
  if (s === "complete") return "bg-emerald-500 text-white border-emerald-600";
  if (s === "na") return "bg-slate-400 text-white border-slate-500";
  return "bg-white text-slate-500 border-slate-300 hover:border-slate-400";
}

export default function ChecklistTab({
  bookerSlug,
  bookerName,
  isAdmin,
  readOnly = false,
}: ChecklistTabProps) {
  const currentWeekStart = useMemo(() => getCurrentWeekStart(), []);
  const [weekStart, setWeekStart] = useState<string>(currentWeekStart);
  const [data, setData] = useState<WeekData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [historyWeeks, setHistoryWeeks] = useState<string[]>([]);
  const [openNote, setOpenNote] = useState<string | null>(null); // "mon:am-1"

  const isPastWeek = weekStart !== currentWeekStart;
  const locked = readOnly || isPastWeek;

  // --- load the week ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/checklist?booker=${encodeURIComponent(bookerSlug)}&week=${weekStart}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        setData(res.data || {});
      })
      .catch(() => {
        if (!cancelled) setData({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookerSlug, weekStart]);

  // --- load admin history list ---
  useEffect(() => {
    if (!isAdmin) return;
    fetch(`/api/checklist?booker=${encodeURIComponent(bookerSlug)}&list=1`)
      .then((r) => r.json())
      .then((res) => setHistoryWeeks(res.weeks || []))
      .catch(() => setHistoryWeeks([]));
  }, [bookerSlug, isAdmin]);

  // --- debounced auto-save ---
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(
    (next: WeekData) => {
      if (locked) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        try {
          await fetch("/api/checklist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              booker_slug: bookerSlug,
              booker_name: bookerName,
              week_start: weekStart,
              data: next,
            }),
          });
          setSavedAt(new Date());
        } catch {
          // Silently retry on next change
        } finally {
          setSaving(false);
        }
      }, 400);
    },
    [bookerSlug, bookerName, weekStart, locked]
  );

  const updateCell = useCallback(
    (dayKey: string, itemId: string, patch: Partial<ItemState>) => {
      setData((prev) => {
        const day = { ...(prev[dayKey] || {}) };
        const current: ItemState = day[itemId] || { status: null };
        const merged: ItemState = { ...current, ...patch };
        // Clean up: drop empty notes and null-status+empty-note entries
        if (merged.note === "" || merged.note === undefined) delete merged.note;
        if (merged.status === null && merged.note === undefined) {
          delete day[itemId];
        } else {
          day[itemId] = merged;
        }
        const next: WeekData = { ...prev, [dayKey]: day };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const cycleStatus = (dayKey: string, itemId: string) => {
    if (locked) return;
    const cur = data[dayKey]?.[itemId]?.status ?? null;
    updateCell(dayKey, itemId, { status: nextStatus(cur) });
  };

  // --- progress counter for current tab ---
  const progress = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const day of DAYS) {
      for (const id of ALL_ITEM_IDS) {
        total += 1;
        const s = data[day.key]?.[id]?.status ?? null;
        if (s !== null) done += 1; // Complete OR N/A counts as handled
      }
    }
    return { done, total };
  }, [data]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header strip */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {bookerName}&apos;s Daily Checklist
            </h2>
            <p className="text-sm text-slate-500">{formatWeekRange(weekStart)}</p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 uppercase">
                  Week
                </label>
                <select
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white"
                >
                  {/* Always offer the current week, even if no record yet */}
                  {!historyWeeks.includes(currentWeekStart) && (
                    <option value={currentWeekStart}>
                      {formatWeekRange(currentWeekStart)} (current)
                    </option>
                  )}
                  {historyWeeks.map((w) => (
                    <option key={w} value={w}>
                      {formatWeekRange(w)}
                      {w === currentWeekStart ? " (current)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="text-xs text-slate-500 min-w-[100px] text-right">
              {saving ? (
                <span className="text-amber-600">Saving…</span>
              ) : savedAt ? (
                <span className="text-emerald-600">Saved</span>
              ) : locked ? (
                <span className="text-slate-400">Read only</span>
              ) : (
                <span>Auto-saves</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{
                width:
                  progress.total > 0
                    ? `${Math.round((progress.done / progress.total) * 100)}%`
                    : "0%",
              }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {progress.done} / {progress.total} handled
          </span>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-10 text-center text-slate-500">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-100 sticky top-0 z-10">
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 py-3 px-3 border-b border-slate-200 w-10">#</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 py-3 px-3 border-b border-slate-200 min-w-[260px]">
                  Item
                </th>
                {DAYS.map((d, i) => (
                  <th
                    key={d.key}
                    className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 py-3 px-3 border-b border-slate-200 min-w-[140px]"
                  >
                    <div>{d.label}</div>
                    <div className="text-[10px] font-normal normal-case text-slate-400">
                      {dayLabel(weekStart, i)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHECKLIST_SECTIONS.map((section) => (
                <SectionGroup
                  key={section.id}
                  section={section}
                  data={data}
                  openNote={openNote}
                  setOpenNote={setOpenNote}
                  cycleStatus={cycleStatus}
                  updateCell={updateCell}
                  locked={locked}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="font-medium">Legend:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-slate-300 bg-white" />
          Not Complete
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500" />
          Complete
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-400" />
          N/A
        </span>
        <span className="text-slate-400">
          Click a cell to cycle status. Click the pencil to add a note.
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section group (header + rows)
// ---------------------------------------------------------------------------
function SectionGroup({
  section,
  data,
  openNote,
  setOpenNote,
  cycleStatus,
  updateCell,
  locked,
}: {
  section: (typeof CHECKLIST_SECTIONS)[number];
  data: WeekData;
  openNote: string | null;
  setOpenNote: (v: string | null) => void;
  cycleStatus: (dayKey: string, itemId: string) => void;
  updateCell: (dayKey: string, itemId: string, patch: Partial<ItemState>) => void;
  locked: boolean;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={2 + DAYS.length}
          className="bg-emerald-50 text-emerald-900 font-bold text-sm px-3 py-2 border-b border-emerald-200 uppercase tracking-wide"
        >
          {section.time}
        </td>
      </tr>
      {section.rows.map((row) => {
        if (row.kind === "subheading") {
          return (
            <tr key={row.id}>
              <td />
              <td
                colSpan={1 + DAYS.length}
                className="text-sm italic font-semibold text-slate-700 px-3 pt-4 pb-1"
              >
                {row.label}
              </td>
            </tr>
          );
        }
        if (row.kind === "divider") {
          return (
            <tr key={row.id}>
              <td
                colSpan={2 + DAYS.length}
                className="bg-sky-50 text-sky-900 font-semibold text-xs uppercase tracking-wide px-3 py-2 border-y border-sky-100"
              >
                {row.label}
              </td>
            </tr>
          );
        }
        return (
          <ItemRow
            key={row.id}
            itemId={row.id}
            number={row.number}
            label={row.label}
            data={data}
            openNote={openNote}
            setOpenNote={setOpenNote}
            cycleStatus={cycleStatus}
            updateCell={updateCell}
            locked={locked}
          />
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// One item row (with Mon–Fri cells + per-day notes)
// ---------------------------------------------------------------------------
function ItemRow({
  itemId,
  number,
  label,
  data,
  openNote,
  setOpenNote,
  cycleStatus,
  updateCell,
  locked,
}: {
  itemId: string;
  number: number;
  label: string;
  data: WeekData;
  openNote: string | null;
  setOpenNote: (v: string | null) => void;
  cycleStatus: (dayKey: string, itemId: string) => void;
  updateCell: (dayKey: string, itemId: string, patch: Partial<ItemState>) => void;
  locked: boolean;
}) {
  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="text-xs text-slate-400 px-3 py-2 border-b border-slate-100 align-top">
          {number}
        </td>
        <td className="text-sm text-slate-800 px-3 py-2 border-b border-slate-100 align-top">
          {label}
        </td>
        {DAYS.map((day) => {
          const cell = data[day.key]?.[itemId];
          const status = cell?.status ?? null;
          const noteKey = `${day.key}:${itemId}`;
          const hasNote = !!cell?.note;
          return (
            <td
              key={day.key}
              className="px-2 py-2 border-b border-slate-100 align-top"
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => cycleStatus(day.key, itemId)}
                  disabled={locked}
                  title={`${statusLabel(status)} — click to change`}
                  className={`flex-1 text-xs font-semibold rounded border px-2 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${statusClasses(
                    status
                  )}`}
                >
                  {statusLabel(status)}
                </button>
                <button
                  onClick={() =>
                    setOpenNote(openNote === noteKey ? null : noteKey)
                  }
                  title={hasNote ? "Edit note" : "Add note"}
                  className={`p-1 rounded border text-xs ${
                    hasNote
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
              {openNote === noteKey && (
                <textarea
                  autoFocus
                  defaultValue={cell?.note || ""}
                  onBlur={(e) => {
                    updateCell(day.key, itemId, { note: e.target.value.trim() });
                    setOpenNote(null);
                  }}
                  disabled={locked}
                  placeholder="Optional note…"
                  className="mt-1.5 w-full text-xs px-2 py-1 border border-slate-300 rounded resize-y min-h-[48px]"
                />
              )}
            </td>
          );
        })}
      </tr>
    </>
  );
}
