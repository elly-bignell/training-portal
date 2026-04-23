// app/promos/page.tsx
//
// Promotional Ideas board.
//
// • Admin-only page (wrapped in PasswordGate requireMaster).
// • Anyone with admin access can submit a promo idea.
// • New submissions land in the "To discuss" tab where they can be
//   approved, rejected, edited, or deleted.
// • Approved ideas move to the "Approved" tab, grouped by month.
// • Rejected ideas move to the "Rejected" tab — still editable and
//   restorable back into "To discuss" (or straight to Approved).
// • Every field (submitter, audience, month, notes) can be edited
//   live on the front end at any stage.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type PromoStatus = "to_discuss" | "approved" | "rejected";
type PromoAudience = "Inbound" | "External";
type TabKey = PromoStatus;

interface PromoRecord {
  id: string;
  submitted_by: string;
  audience: PromoAudience;
  month: string; // "" if not relevant
  notes: string;
  status: PromoStatus;
  submitted_at: string;
  updated_at?: string;
  decided_by?: string;
  decided_at?: string;
}

const SUBMITTERS = [
  "Corie",
  "Lucas",
  "Felipe",
  "Dylan",
  "Nick",
  "Elly",
  "Trent",
  "Taylor",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Return the 12 months in "soonest first from today" order — the current
// month leads, then each subsequent month, wrapping around so that
// already-passed months this calendar year sit at the end (they're
// effectively "next year" from a planning perspective).
function getMonthOrder(): string[] {
  const currentIdx = new Date().getMonth(); // 0-11 in local time
  return [...MONTHS.slice(currentIdx), ...MONTHS.slice(0, currentIdx)];
}

function formatRelative(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Adelaide",
  });
}

// ---------------------------------------------------------------------------
// Page (wrapper)
// ---------------------------------------------------------------------------

export default function PromosPage() {
  return (
    <PasswordGate requireMaster>
      <PromosContent />
    </PasswordGate>
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

function PromosContent() {
  const [promos, setPromos] = useState<PromoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("to_discuss");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promos", { cache: "no-store" });
      const json = await res.json();
      setPromos(json.promos || []);
    } catch {
      setPromos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toDiscuss = useMemo(
    () => promos.filter((p) => p.status === "to_discuss"),
    [promos]
  );
  const approved = useMemo(
    () => promos.filter((p) => p.status === "approved"),
    [promos]
  );
  const rejected = useMemo(
    () => promos.filter((p) => p.status === "rejected"),
    [promos]
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5">
        {/* Submit form */}
        <NewPromoCard onSubmitted={refresh} />

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
          <TabButton
            label={`To discuss (${toDiscuss.length})`}
            active={activeTab === "to_discuss"}
            onClick={() => setActiveTab("to_discuss")}
          />
          <TabButton
            label={`Approved (${approved.length})`}
            active={activeTab === "approved"}
            onClick={() => setActiveTab("approved")}
          />
          <TabButton
            label={`Rejected (${rejected.length})`}
            active={activeTab === "rejected"}
            onClick={() => setActiveTab("rejected")}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading…</div>
        ) : activeTab === "to_discuss" ? (
          <PromoMonthGrid list={toDiscuss} emptyTab="to_discuss" onChanged={refresh} />
        ) : activeTab === "approved" ? (
          <PromoMonthGrid list={approved} emptyTab="approved" onChanged={refresh} />
        ) : (
          <PromoMonthGrid list={rejected} emptyTab="rejected" onChanged={refresh} />
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header() {
  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-slate-400 hover:text-white transition-colors"
            title="Back to admin"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Promotional Ideas</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Pitch ideas, workshop them in the morning, ship the winners.
            </p>
          </div>
        </div>
        <span className="text-xs uppercase font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
          Admin view
        </span>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Tab button
// ---------------------------------------------------------------------------
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
        active
          ? "border-emerald-500 text-emerald-700 bg-white"
          : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ tab }: { tab: TabKey }) {
  const copy = {
    to_discuss: {
      title: "No promo ideas in the queue",
      body: "Use the form above to pitch something. Good ideas come from anywhere.",
    },
    approved: {
      title: "No approved promos yet",
      body: "Once an idea gets the green light it will appear here, grouped by month.",
    },
    rejected: {
      title: "No rejected promos",
      body: "Ideas that don't make the cut end up here. They can still be restored later.",
    },
  }[tab];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
      <h3 className="text-base font-semibold text-slate-900 mb-1">{copy.title}</h3>
      <p className="text-sm text-slate-500">{copy.body}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Submit form
// ---------------------------------------------------------------------------
function NewPromoCard({ onSubmitted }: { onSubmitted: () => void }) {
  const [submittedBy, setSubmittedBy] = useState("");
  const [audience, setAudience] = useState<PromoAudience>("Inbound");
  const [month, setMonth] = useState("");
  const [notes, setNotes] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = notes.trim();
    if (!submittedBy) {
      setError("Please choose who's submitting this.");
      return;
    }
    if (!trimmed) {
      setError("Add some notes about the promo idea.");
      return;
    }
    setError("");
    setPosting(true);
    try {
      const res = await fetch("/api/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submitted_by: submittedBy,
          audience,
          month,
          notes: trimmed,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to submit");
      }
      setNotes("");
      setMonth("");
      // Leave submittedBy and audience as-is so multiple ideas from the
      // same person in one sitting are quicker to post.
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
          Pitch a promo idea
        </h2>
      </div>
      <form onSubmit={submit} className="p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Submitted by */}
          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold text-slate-600 mb-1">
              Submitted by
            </label>
            <select
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              disabled={posting}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="">Choose…</option>
              {SUBMITTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Audience */}
          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold text-slate-600 mb-1">
              For
            </label>
            <div className="flex rounded-lg overflow-hidden border border-slate-300">
              <button
                type="button"
                onClick={() => setAudience("Inbound")}
                disabled={posting}
                className={`flex-1 px-3 py-2.5 sm:py-2 text-sm font-medium transition-colors ${
                  audience === "Inbound"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Inbound (Team)
              </button>
              <button
                type="button"
                onClick={() => setAudience("External")}
                disabled={posting}
                className={`flex-1 px-3 py-2.5 sm:py-2 text-sm font-medium transition-colors border-l border-slate-300 ${
                  audience === "External"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                External (Clients)
              </button>
            </div>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold text-slate-600 mb-1">
              Suggested month <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={posting}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="">Not relevant</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] uppercase tracking-wide font-semibold text-slate-600 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's the promo? What's the hook? Any context the rest of the team needs when we review it in the morning."
            rows={3}
            disabled={posting}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-y min-h-[100px] sm:min-h-[80px]"
          />
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xs text-slate-500">
            Goes into &lsquo;To discuss&rsquo; for the team to work through.
          </span>
          <button
            type="submit"
            disabled={posting || !submittedBy || notes.trim().length === 0}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 text-base sm:text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {posting ? "Submitting…" : "Submit idea"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unified two-column month grid
// -----------------------------------------------------------------------------
// Used for all three tabs (To discuss / Approved / Rejected). Ideas are
// grouped by month in "soonest-first from today" order, then split into
// two columns within each month: Inbound (Team) on the left, External
// (Clients) on the right. A month row with ideas on one side and nothing
// on the other renders an empty placeholder cell so the alignment is
// obvious at a glance.
// ---------------------------------------------------------------------------
function PromoMonthGrid({
  list,
  emptyTab,
  onChanged,
}: {
  list: PromoRecord[];
  emptyTab: TabKey;
  onChanged: () => void;
}) {
  if (list.length === 0) return <EmptyState tab={emptyTab} />;

  // Group by month + audience.
  const buckets: Record<string, { Inbound: PromoRecord[]; External: PromoRecord[] }> = {};
  for (const p of list) {
    const key = p.month || "No month set";
    if (!buckets[key]) buckets[key] = { Inbound: [], External: [] };
    buckets[key][p.audience].push(p);
  }

  // Within each cell, newest submissions first.
  for (const key of Object.keys(buckets)) {
    buckets[key].Inbound.sort((a, b) =>
      (b.submitted_at || "").localeCompare(a.submitted_at || "")
    );
    buckets[key].External.sort((a, b) =>
      (b.submitted_at || "").localeCompare(a.submitted_at || "")
    );
  }

  // Month order: soonest-first rotation starting at today's month.
  // "No month set" lives at the bottom as a catch-all.
  const monthOrder = getMonthOrder();
  const orderedKeys: string[] = [
    ...monthOrder.filter((m) => buckets[m]),
    ...(buckets["No month set"] ? ["No month set"] : []),
  ];

  // Header accent swaps between tabs so each tab feels distinct.
  const headerAccent =
    emptyTab === "approved"
      ? "bg-emerald-50 border-emerald-100 text-emerald-900"
      : emptyTab === "rejected"
      ? "bg-rose-50 border-rose-100 text-rose-900"
      : "bg-amber-50 border-amber-100 text-amber-900";

  return (
    <div className="space-y-5">
      {/* Column legend — desktop only (mobile stacks, so each cell has
          its own sub-header instead). */}
      <div className="hidden md:grid grid-cols-2 gap-3 px-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-bold text-emerald-700">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          Inbound (Team)
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-bold text-blue-700">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          External (Clients)
        </div>
      </div>

      {orderedKeys.map((key) => {
        const bucket = buckets[key];
        const total = bucket.Inbound.length + bucket.External.length;
        return (
          <section
            key={key}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <header
              className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between ${headerAccent}`}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                {key}
              </h3>
              <span className="text-xs opacity-80">
                {total} promo{total === 1 ? "" : "s"}
              </span>
            </header>

            {/* grid-cols-1 on mobile (stacked) → grid-cols-2 on md+ (side-by-side).
                The divider flips orientation to match. */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-3 space-y-3 min-h-[90px]">
                <CellHeader variant="inbound" />
                {bucket.Inbound.length === 0 ? (
                  <EmptyCell label="No inbound ideas" />
                ) : (
                  bucket.Inbound.map((p) => (
                    <PromoCard key={p.id} promo={p} onChanged={onChanged} dense />
                  ))
                )}
              </div>
              <div className="p-3 space-y-3 min-h-[90px]">
                <CellHeader variant="external" />
                {bucket.External.length === 0 ? (
                  <EmptyCell label="No external ideas" />
                ) : (
                  bucket.External.map((p) => (
                    <PromoCard key={p.id} promo={p} onChanged={onChanged} dense />
                  ))
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

// Sub-header shown inside each cell on mobile only (so when the two
// columns stack vertically it's still obvious which group is which).
function CellHeader({ variant }: { variant: "inbound" | "external" }) {
  if (variant === "inbound") {
    return (
      <div className="md:hidden flex items-center gap-2 text-[11px] uppercase tracking-wide font-bold text-emerald-700 pb-1">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
        Inbound (Team)
      </div>
    );
  }
  return (
    <div className="md:hidden flex items-center gap-2 text-[11px] uppercase tracking-wide font-bold text-blue-700 pb-1">
      <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
      External (Clients)
    </div>
  );
}

function EmptyCell({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center text-center text-xs text-slate-400 italic py-6">
      {label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Promo card — inline editable, with admin action buttons.
// ---------------------------------------------------------------------------
function PromoCard({
  promo,
  onChanged,
  dense = false,
}: {
  promo: PromoRecord;
  onChanged: () => void;
  dense?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [submittedBy, setSubmittedBy] = useState(promo.submitted_by);
  const [audience, setAudience] = useState<PromoAudience>(promo.audience);
  const [month, setMonth] = useState(promo.month);
  const [notes, setNotes] = useState(promo.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Re-sync local state when the promo prop changes from a refresh.
  useEffect(() => {
    if (!editing) {
      setSubmittedBy(promo.submitted_by);
      setAudience(promo.audience);
      setMonth(promo.month);
      setNotes(promo.notes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promo.id, promo.submitted_by, promo.audience, promo.month, promo.notes]);

  const patch = async (payload: Record<string, unknown>) => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/promos/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to save");
      }
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = notes.trim();
    if (!submittedBy) {
      setError("Choose a submitter.");
      return;
    }
    if (trimmed.length === 0) {
      setError("Notes cannot be empty.");
      return;
    }
    await patch({
      submitted_by: submittedBy,
      audience,
      month,
      notes: trimmed,
    });
    setEditing(false);
  };

  const approve = () => patch({ status: "approved" });
  const reject = () => patch({ status: "rejected" });
  const restore = () => patch({ status: "to_discuss" });

  const remove = async () => {
    if (
      !confirm(
        "Delete this promo idea permanently? This can't be undone."
      )
    )
      return;
    setSaving(true);
    try {
      const res = await fetch(`/api/promos/${promo.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onChanged();
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const audienceBadge =
    promo.audience === "Inbound"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  const statusStyles =
    promo.status === "to_discuss"
      ? { border: "border-amber-200", metaBg: "bg-amber-50 text-amber-800 border-amber-100", dot: "bg-amber-500", label: "To discuss" }
      : promo.status === "approved"
      ? { border: "border-emerald-200", metaBg: "bg-emerald-50 text-emerald-800 border-emerald-100", dot: "bg-emerald-500", label: "Approved" }
      : { border: "border-rose-200", metaBg: "bg-rose-50 text-rose-800 border-rose-100", dot: "bg-rose-500", label: "Rejected" };

  return (
    <div
      className={`bg-white rounded-2xl ${dense ? "" : "shadow-sm"} border overflow-hidden ${statusStyles.border}`}
    >
      {/* Meta strip */}
      <div
        className={`px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs border-b ${statusStyles.metaBg}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-block w-2 h-2 rounded-full ${statusStyles.dot}`}
          />
          <span className="font-semibold">{promo.submitted_by || "Unknown"}</span>
          <span className="text-slate-500">
            • submitted {formatRelative(promo.submitted_at)}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${audienceBadge}`}
          >
            {promo.audience === "Inbound" ? "Inbound" : "External"}
          </span>
          {promo.month && (
            <span className="inline-flex items-center px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 text-[10px] font-semibold uppercase tracking-wide">
              {promo.month}
            </span>
          )}
        </div>
        <span className="uppercase font-semibold tracking-wide">
          {statusStyles.label}
          {promo.decided_by && promo.status !== "to_discuss"
            ? ` • ${promo.decided_by}`
            : ""}
        </span>
      </div>

      {/* Body */}
      {!editing ? (
        <>
          <div className="px-4 sm:px-5 py-4">
            <p className="text-sm text-slate-800 whitespace-pre-wrap">
              {promo.notes}
            </p>
          </div>

          {/* Controls */}
          <div className="px-4 sm:px-5 pb-4 flex flex-wrap gap-2">
            {promo.status === "to_discuss" && (
              <>
                <button
                  onClick={approve}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  onClick={reject}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors disabled:opacity-60"
                >
                  Reject
                </button>
              </>
            )}
            {promo.status === "approved" && (
              <>
                <button
                  onClick={restore}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-60"
                >
                  Move back to discuss
                </button>
                <button
                  onClick={reject}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors disabled:opacity-60"
                >
                  Reject instead
                </button>
              </>
            )}
            {promo.status === "rejected" && (
              <>
                <button
                  onClick={restore}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-60"
                >
                  Restore to discuss
                </button>
                <button
                  onClick={approve}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  Approve instead
                </button>
              </>
            )}
            <button
              onClick={() => setEditing(true)}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-60"
            >
              Edit
            </button>
            <button
              onClick={remove}
              disabled={saving}
              className="ml-auto px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-60"
            >
              Delete
            </button>
          </div>

          {error && (
            <div className="px-4 sm:px-5 pb-4 -mt-2">
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            </div>
          )}
        </>
      ) : (
        // ---------------------------------------------------------------
        // Edit mode
        // ---------------------------------------------------------------
        <form onSubmit={saveEdits} className="px-4 sm:px-5 py-4 space-y-3 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold text-slate-600 mb-1">
                Submitted by
              </label>
              <select
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                disabled={saving}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="">Choose…</option>
                {SUBMITTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold text-slate-600 mb-1">
                For
              </label>
              <div className="flex rounded-lg overflow-hidden border border-slate-300">
                <button
                  type="button"
                  onClick={() => setAudience("Inbound")}
                  disabled={saving}
                  className={`flex-1 px-3 py-2.5 sm:py-2 text-sm font-medium transition-colors ${
                    audience === "Inbound"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Inbound
                </button>
                <button
                  type="button"
                  onClick={() => setAudience("External")}
                  disabled={saving}
                  className={`flex-1 px-3 py-2.5 sm:py-2 text-sm font-medium transition-colors border-l border-slate-300 ${
                    audience === "External"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  External
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wide font-semibold text-slate-600 mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={saving}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="">Not relevant</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wide font-semibold text-slate-600 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={saving}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-y min-h-[120px] sm:min-h-[100px] bg-white"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setSubmittedBy(promo.submitted_by);
                setAudience(promo.audience);
                setMonth(promo.month);
                setNotes(promo.notes);
                setError("");
              }}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !submittedBy || notes.trim().length === 0}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
