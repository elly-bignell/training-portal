// app/validation/page.tsx

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Booking,
  BookingStatus,
  BUDDY_PAIRS,
  STAFF_MEMBERS,
  getBuddy,
  formatDate,
  toISODate,
  getNextAvailableObservationDate,
} from "@/lib/validation";

type Tab = "flowchart" | "create" | "queue" | "lodgement" | "schedule" | "reports";

const TABS: { key: Tab; label: string; icon: string; publicTab?: boolean }[] = [
  { key: "flowchart", label: "Process", icon: "🔀", publicTab: true },
  { key: "create", label: "Create Booking", icon: "📝", publicTab: true },
  { key: "queue", label: "Validation Queue", icon: "⏳" },
  { key: "lodgement", label: "Daily Lodgement", icon: "📊" },
  { key: "schedule", label: "Observations", icon: "📅" },
  { key: "reports", label: "Reports", icon: "📈" },
];

type UserRole = "admin" | "senior" | "trainee";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

function ValidationContent({ role }: { role: UserRole }) {
  const [activeTab, setActiveTab] = useState<Tab>("flowchart");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/validation");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const pendingCount = bookings.filter((b) => b.status === "pending" && ((b as any).na_count || 0) < 2).length;
  const isFullAccess = role === "admin" || role === "senior";
  const visibleTabs = isFullAccess ? TABS : TABS.filter((t) => t.publicTab);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-3">
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Admin
            </Link>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
          <h1 className="text-2xl font-bold">Booking Validation</h1>
          <p className="text-slate-400 text-sm mt-1">Create, validate, schedule observations, and track performance</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 -mt-3">
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.key === "queue" && pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "flowchart" && <FlowchartTab />}
        {activeTab === "create" && <CreateBookingTab onCreated={fetchBookings} saving={saving} setSaving={setSaving} />}
        {activeTab === "queue" && <ValidationQueueTab bookings={bookings} onUpdate={fetchBookings} allBookings={bookings} />}
        {activeTab === "lodgement" && <LodgementTab bookings={bookings} />}
        {activeTab === "schedule" && <ObservationScheduleTab bookings={bookings} />}
        {activeTab === "reports" && <ReportsTab bookings={bookings} />}
      </div>
    </main>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 0: Flowchart
// ═══════════════════════════════════════════════════════════════════════════════

const FLOWCHART_DEF = `flowchart TD
    A["📞 Staff Member Makes a Booking"] --> B["📋 Booking Created\n<b>Status: Pending Validation</b>"]
    B --> C["⏰ Next Business Day"]
    C --> D["🤝 Buddy Calls the Booking\nto Validate Quality"]
    D --> E{"Booking\nQuality?"}

    E -->|"✅ Good"| EG{"Confirmed\nDay & Time?"}
    E -->|"❌ Poor"| G["Rejected\n<b>Status: Rejected</b>\nBuddy writes rejection note"]

    EG -->|"✅ Yes"| F["Validated\n<b>Status: Validated</b>"]
    EG -->|"🔥 Not Yet"| HTL["Hot Try Later\n<b>Status: Hot Try Later</b>\nInterested — no confirmed time"]

    F --> H["📝 Buddy Provides Feedback\nto Staff Member"]
    G --> H
    HTL --> H

    F --> I["📅 Added to Observation Queue"]
    HTL --> J["📋 Updated in ClickUp\nfor follow-up"]

    G --> N["📊 Logged in Daily\nLodgement Dashboard"]
    F --> N
    HTL --> N

    N --> O["📈 Performance Report\nGenerated Weekly"]
    O --> P["Validation Rate =\nValidated ÷ (Validated + Rejected)\n<i>HTL excluded — still a good booking</i>"]

    style A fill:#E6017D,stroke:#E6017D,color:#fff
    style B fill:#fef3c7,stroke:#f59e0b,color:#92400e
    style F fill:#d1fae5,stroke:#10b981,color:#065f46
    style G fill:#fee2e2,stroke:#ef4444,color:#991b1b
    style HTL fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    style EG fill:#f3f4f6,stroke:#9ca3af,color:#374151
    style J fill:#ede9fe,stroke:#7c3aed,color:#4c1d95

    style P fill:#fce7f3,stroke:#E6017D,color:#9d174d`;

function FlowchartTab() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMermaid = async () => {
      // @ts-ignore
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "14px",
          primaryColor: "#f1f5f9",
          primaryBorderColor: "#cbd5e1",
          primaryTextColor: "#1e293b",
          lineColor: "#94a3b8",
          secondaryColor: "#f8fafc",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 15,
          nodeSpacing: 40,
          rankSpacing: 50,
        },
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        const { svg } = await mermaid.render("validation-flowchart", FLOWCHART_DEF);
        containerRef.current.innerHTML = svg;

        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
        }
      }
    };

    loadMermaid();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Booking Validation Process</h2>
        <p className="text-sm text-slate-500 mt-1">
          Every booking goes through buddy validation the following day. Validated bookings are auto-scheduled for observation (1 per day per staff member).
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 overflow-x-auto">
        <div ref={containerRef} className="flex justify-center min-h-[400px] items-center">
          <div className="text-slate-400 text-sm">Loading flowchart...</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#E6017D" }}></div>
            <span className="text-xs text-slate-600">Booking Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-400"></div>
            <span className="text-xs text-slate-600">Pending Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400"></div>
            <span className="text-xs text-slate-600">Validated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-400"></div>
            <span className="text-xs text-slate-600">Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-pink-100 border border-pink-400"></div>
            <span className="text-xs text-slate-600">Performance Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: Create Booking
// ═══════════════════════════════════════════════════════════════════════════════

function CreateBookingTab({ onCreated, saving, setSaving }: {
  onCreated: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    business_name: "",
    staff_member: "",
    booking_date: toISODate(new Date()),
    contact_name: "",
    contact_phone: "",
    meeting_date: "",
    meeting_time: "",
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          meeting_datetime: form.meeting_date && form.meeting_time ? `${form.meeting_date}T${form.meeting_time}` : "",
          buddy: getBuddy(form.staff_member),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({
          business_name: "",
          staff_member: "",
          booking_date: toISODate(new Date()),
          contact_name: "",
          contact_phone: "",
          meeting_date: "",
          meeting_time: "",
        });
        onCreated();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to create booking:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">New Booking</h2>
        <p className="text-sm text-slate-500 mb-6">Created as Pending Validation — auto-assigned to the buddy for review.</p>

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium flex items-center gap-2">
            <span>✅</span> Booking created — pending validation by {getBuddy(form.staff_member)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Staff Member *</label>
              <select
                value={form.staff_member}
                onChange={(e) => setForm({ ...form, staff_member: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="" disabled>Select your name</option>
                {STAFF_MEMBERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1">{form.staff_member ? `Buddy: ${getBuddy(form.staff_member)}` : "Select a staff member to see buddy"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date Booked (Select Today&apos;s Date) *</label>
              <input
                type="date"
                value={form.booking_date}
                onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Business Name *</label>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              placeholder="e.g. Smith Plumbing Pty Ltd"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Name</label>
              <input
                type="text"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="e.g. John Smith"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="e.g. 0412 345 678"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date <span className="font-normal text-gray-400">(Adelaide time)</span></label>
              <input
                type="date"
                value={form.meeting_date}
                onChange={(e) => setForm({ ...form, meeting_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Time</label>
              <select
                value={form.meeting_time}
                onChange={(e) => setForm({ ...form, meeting_time: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Select time</option>
                <option value="08:30">8:30 AM</option>
                <option value="09:00">9:00 AM</option>
                <option value="09:30">9:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="13:30">1:30 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="14:30">2:30 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="15:30">3:30 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="16:30">4:30 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="17:30">5:30 PM</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#E6017D] text-white font-semibold rounded-lg hover:bg-[#c9016c] disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating..." : "Create Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: Validation Queue (GROUPED BY BUDDY, SPLIT BY DATE)
// ═══════════════════════════════════════════════════════════════════════════════

// Buddy sort order — Lucas (Cindy's buddy) first, Felipe (Connie's buddy) second, Dylan (Krishna's buddy) third
const BUDDY_SORT_ORDER = ["Lucas Tirri", "Felipe Garcia", "Dylan Munro"];

const REJECTION_REASONS = [
  "Not interested",
  "Happy with current provider",
  "Foreign",
  "Can't afford",
  "Foreign & can't afford",
];

function ValidationQueueTab({ bookings, onUpdate, allBookings }: {
  bookings: Booking[];
  onUpdate: () => void;
  allBookings: Booking[];
}) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [rejectMode, setRejectMode] = useState<Record<string, boolean>>({});
  const [hotTryLaterMode, setHotTryLaterMode] = useState<Record<string, boolean>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string[]>>({});
  const [showFuture, setShowFuture] = useState(false);

  const pendingBookings = bookings.filter((b) => b.status === "pending" && ((b as any).na_count || 0) < 2);
  const today = toISODate(new Date());

  // Split pending bookings: yesterday & older vs today
  const yesterdayBookings = pendingBookings
    .filter((b) => b.booking_date < today)
    .sort((a, b) => a.booking_date.localeCompare(b.booking_date)); // oldest first
  const todayBookings = pendingBookings
    .filter((b) => b.booking_date >= today)
    .sort((a, b) => a.booking_date.localeCompare(b.booking_date));

  // Helper: group bookings by buddy and sort by buddy order
  const groupByBuddy = (bks: Booking[]) => {
    const grouped: Record<string, Booking[]> = {};
    bks.forEach((b) => {
      const buddy = b.buddy || "Unknown";
      if (!grouped[buddy]) grouped[buddy] = [];
      grouped[buddy].push(b);
    });
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const ai = BUDDY_SORT_ORDER.indexOf(a);
      const bi = BUDDY_SORT_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return sortedKeys.map((key) => ({
      buddyName: key,
      bookings: grouped[key].sort((a, b) => {
        // N/A'd today → bottom of list
        const aNa = (a as any).na_date === today ? 1 : 0;
        const bNa = (b as any).na_date === today ? 1 : 0;
        if (aNa !== bNa) return aNa - bNa;
        return a.booking_date.localeCompare(b.booking_date);
      }),
    }));
  };

  const yesterdayGroups = groupByBuddy(yesterdayBookings);
  const todayGroups = groupByBuddy(todayBookings);

  const getNote = (id: string) => notes[id] || "";
  const setNote = (id: string, val: string) => setNotes((prev) => ({ ...prev, [id]: val }));
  const getReasons = (id: string) => rejectionReasons[id] || [];
  const toggleReason = (id: string, reason: string) => {
    setRejectionReasons((prev) => {
      const current = prev[id] || [];
      const updated = current.includes(reason) ? current.filter((r) => r !== reason) : [...current, reason];
      return { ...prev, [id]: updated };
    });
  };

  const handleValidate = async (booking: Booking) => {
    setProcessingId(booking.id);
    try {
      const staffObsDates = allBookings
        .filter((b) => b.staff_member === booking.staff_member && b.observation_date)
        .map((b) => b.observation_date!);
      const obsDate = getNextAvailableObservationDate(staffObsDates, today);

      const res = await fetch(`/api/validation/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "validated",
          validation_date: today,
          validation_note: getNote(booking.id),
          observation_date: obsDate,
        }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      setNotes((prev) => { const n = { ...prev }; delete n[booking.id]; return n; });
      onUpdate();
    } catch (err) {
      console.error("Failed to validate:", err);
      alert("Failed to validate booking — check console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (booking: Booking) => {
    const note = getNote(booking.id);
    if (!note.trim()) {
      alert("Please enter a rejection reason before confirming.");
      return;
    }
    setProcessingId(booking.id);
    try {
      const res = await fetch(`/api/validation/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          validation_date: today,
          validation_note: note,
          rejection_reason: getReasons(booking.id).join(", "),
        }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      setNotes((prev) => { const n = { ...prev }; delete n[booking.id]; return n; });
      setRejectMode((prev) => { const r = { ...prev }; delete r[booking.id]; return r; });
      setRejectionReasons((prev) => { const r = { ...prev }; delete r[booking.id]; return r; });
      onUpdate();
    } catch (err) {
      console.error("Failed to reject:", err);
      alert("Failed to reject booking — check console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleNA = async (booking: Booking) => {
    setProcessingId(booking.id);
    try {
      const currentCount = (booking as any).na_count || 0;
      const res = await fetch(`/api/validation/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          na_date: today,
          na_count: currentCount + 1,
        }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      onUpdate();
    } catch (err) {
      console.error("Failed to mark N/A:", err);
      alert("Failed to mark as N/A — check console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleHotTryLater = async (booking: Booking) => {
    setProcessingId(booking.id);
    try {
      const res = await fetch(`/api/validation/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "hot_try_later",
          validation_date: today,
          validation_note: getNote(booking.id),
        }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      setNotes((prev) => { const n = { ...prev }; delete n[booking.id]; return n; });
      setHotTryLaterMode((prev) => { const h = { ...prev }; delete h[booking.id]; return h; });
      onUpdate();
    } catch (err) {
      console.error("Failed to mark Hot Try Later:", err);
      alert("Failed to mark as Hot Try Later — check console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  // Shared booking card renderer
  const renderBookingCard = (booking: Booking) => {
    const isRejecting = !!rejectMode[booking.id];
    const isHotTryLater = !!hotTryLaterMode[booking.id];
    const isProcessing = processingId === booking.id;
    const note = getNote(booking.id);
    const isNA = (booking as any).na_date === today;
    const naCount = (booking as any).na_count || 0;

    return (
      <div key={booking.id} className={`bg-white rounded-xl border shadow-sm p-5 ${isNA ? "border-slate-200 bg-slate-50/50" : "border-amber-200"}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">Pending</span>
              {naCount > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                  📞 N/A × {naCount}
                </span>
              )}
              {isNA && (
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                  ↓ moved to bottom for today
                </span>
              )}
              <span className="text-xs text-gray-400">Booked {formatDate(booking.booking_date)}</span>
            </div>
            <h3 className={`text-base font-bold ${isNA ? "text-slate-500" : "text-slate-800"}`}>{booking.business_name}</h3>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              <span>👤 {booking.staff_member}</span>
              <span>🤝 Buddy: {booking.buddy}</span>
              {booking.contact_name && <span>📇 {booking.contact_name}</span>}
              {booking.contact_phone && <span>📞 {booking.contact_phone}</span>}
              {booking.meeting_datetime && <span>🕐 {booking.meeting_datetime}</span>}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {isRejecting && (
            <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[10px] font-bold text-red-600 uppercase mb-2">Rejection reason — select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {REJECTION_REASONS.map((reason) => {
                  const selected = getReasons(booking.id).includes(reason);
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => toggleReason(booking.id, reason)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all ${
                        selected
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white text-red-500 border-red-200 hover:border-red-400"
                      }`}
                    >
                      {selected ? "✓ " : ""}{reason}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(booking.id, e.target.value)}
            placeholder={isRejecting ? "Additional notes (optional)..." : isHotTryLater ? "Follow-up note (optional, e.g. call back in 3 months)..." : "Feedback note (optional)..."}
            className={`w-full border rounded-lg px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${isRejecting ? "border-red-300 bg-red-50/30" : "border-gray-200"}`}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleValidate(booking)}
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1.5"
            >
              ✅ Validate
            </button>
            {isHotTryLater ? (
              <button
                onClick={() => handleHotTryLater(booking)}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                🔥 Confirm HTL
              </button>
            ) : (
              <button
                onClick={() => { setHotTryLaterMode((prev) => ({ ...prev, [booking.id]: true })); setRejectMode((prev) => { const r = { ...prev }; delete r[booking.id]; return r; }); }}
                disabled={isRejecting}
                className="flex-1 py-2.5 bg-white text-purple-600 border-2 border-purple-200 font-semibold rounded-lg hover:bg-purple-50 transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                🔥 Hot Try Later
              </button>
            )}
            {isRejecting ? (
              <button
                onClick={() => handleReject(booking)}
                disabled={isProcessing || !note.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                ❌ Confirm Rejection
              </button>
            ) : (
              <button
                onClick={() => { setRejectMode((prev) => ({ ...prev, [booking.id]: true })); setHotTryLaterMode((prev) => { const h = { ...prev }; delete h[booking.id]; return h; }); }}
                disabled={isHotTryLater}
                className="flex-1 py-2.5 bg-white text-red-600 border-2 border-red-200 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                ❌ Reject
              </button>
            )}
            {!isRejecting && !isHotTryLater && !isNA && (
              <button
                onClick={() => handleNA(booking)}
                disabled={isProcessing}
                className="py-2.5 px-4 bg-white text-slate-500 border-2 border-slate-200 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                📞 Call N/A
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render a section of buddy groups
  const renderBuddyGroups = (groups: { buddyName: string; bookings: Booking[] }[]) => {
    return groups.map(({ buddyName, bookings: groupBookings }) => {
      const firstName = buddyName.split(" ")[0];
      return (
        <div key={buddyName}>
          <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {firstName} — {groupBookings.length} booking{groupBookings.length !== 1 ? "s" : ""}
          </h4>
          <div className="space-y-3">
            {groupBookings.map(renderBookingCard)}
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Validation Queue</h2>
          <p className="text-sm text-slate-500">{pendingBookings.length} booking{pendingBookings.length !== 1 ? "s" : ""} pending validation</p>
        </div>
      </div>

      {pendingBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-slate-600 font-medium">All bookings have been validated</p>
          <p className="text-slate-400 text-sm mt-1">New bookings will appear here when created</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* ── Section 1: Yesterday's Bookings (validate today) ── */}
          {yesterdayBookings.length > 0 && (
            <div>
              <div className="mb-4 pb-2 border-b-2 border-[#E6017D]">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E6017D] animate-pulse"></span>
                  Validation Calls to be Made Today
                  <span className="text-sm font-normal text-slate-500">— Yesterday&apos;s Bookings ({yesterdayBookings.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">These bookings were made yesterday or earlier — validate them now</p>
              </div>
              <div className="space-y-6">
                {renderBuddyGroups(yesterdayGroups)}
              </div>
            </div>
          )}

          {/* ── Section 2: Today's Bookings (validate tomorrow) ── */}
          {todayBookings.length > 0 && (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50/50">
              {/* Warning banner */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-4 flex items-start gap-3">
                <span className="text-2xl">⛔</span>
                <div>
                  <h3 className="text-sm font-bold text-amber-800">Do NOT Call These Yet</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    These {todayBookings.length} booking{todayBookings.length !== 1 ? "s were" : " was"} made <strong>today</strong> — they need to be validated <strong>tomorrow</strong>, not today.
                    Calling the same day the booking is made is too soon.
                  </p>
                </div>
              </div>

              {/* Collapsed header */}
              <button
                onClick={() => setShowFuture(!showFuture)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-base font-bold text-slate-500 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  Future Validation Calls
                  <span className="text-sm font-normal text-slate-400">— Today&apos;s Bookings to be Validated Tomorrow ({todayBookings.length})</span>
                </h3>
                <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-white border border-slate-200 rounded-lg">
                  {showFuture ? "Hide ▲" : "Preview ▼"}
                </span>
              </button>

              {/* Collapsible content */}
              {showFuture && (
                <div className="mt-4 space-y-6 opacity-50 pointer-events-none select-none">
                  {renderBuddyGroups(todayGroups)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: Daily Lodgement
// ═══════════════════════════════════════════════════════════════════════════════

function LodgementTab({ bookings }: { bookings: Booking[] }) {
  const [fromDate, setFromDate] = useState(toISODate(new Date()));
  const [toDate, setToDate] = useState(toISODate(new Date()));
  const [staffFilter, setStaffFilter] = useState("all");

  const processed = bookings.filter((b) => b.status !== "pending");
  const filtered = processed.filter((b) => {
    if (staffFilter !== "all" && b.staff_member !== staffFilter) return false;
    if (fromDate && b.validation_date && b.validation_date < fromDate) return false;
    if (toDate && b.validation_date && b.validation_date > toDate) return false;
    return true;
  });

  const validated = filtered.filter((b) => b.status === "validated");
  const rejected = filtered.filter((b) => b.status === "rejected");
  const hotTryLater = filtered.filter((b) => b.status === "hot_try_later");

  // NA × 2 bookings — removed from validation queue
  const na2All = bookings.filter((b) => b.status === "pending" && ((b as any).na_count || 0) >= 2);
  const na2Filtered = na2All.filter((b) => {
    if (staffFilter !== "all" && b.staff_member !== staffFilter) return false;
    return true;
  });

  // N/A calls: pending bookings that were marked N/A on the selected date (or have any na_count if no date filter)
  const naCalls = bookings.filter((b) => {
    if (staffFilter !== "all" && b.staff_member !== staffFilter) return false;
    const naDate = (b as any).na_date;
    if (fromDate && toDate) return naDate >= fromDate && naDate <= toDate;
    if (fromDate) return naDate >= fromDate;
    return ((b as any).na_count || 0) > 0;
  });

  function BookingCard({ booking, type }: { booking: Booking; type: "validated" | "rejected" | "hot_try_later" }) {
    const isGood = type === "validated";
    const isHTL = type === "hot_try_later";
    const borderClass = isGood ? "border-emerald-200 bg-emerald-50/50" : isHTL ? "border-purple-200 bg-purple-50/50" : "border-red-200 bg-red-50/50";
    const badgeClass = isGood ? "bg-emerald-100 text-emerald-700" : isHTL ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700";
    const noteClass = isGood ? "bg-emerald-100 text-emerald-800" : isHTL ? "bg-purple-100 text-purple-800" : "bg-red-100 text-red-800";
    const badgeLabel = isGood ? "✅ Validated" : isHTL ? "🔥 Hot Try Later" : "❌ Rejected";
    return (
      <div className={`rounded-lg border-2 p-4 ${borderClass}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${badgeClass}`}>
            {badgeLabel}
          </span>
          <span className="text-[10px] text-gray-400">{formatDate(booking.booking_date)}</span>
        </div>
        <h4 className="font-semibold text-sm text-slate-800">{booking.business_name}</h4>
        <p className="text-xs text-slate-500 mt-1">👤 {booking.staff_member} · 🤝 {booking.buddy}</p>
        {booking.contact_name && <p className="text-xs text-slate-400 mt-0.5">📇 {booking.contact_name} {booking.contact_phone ? `· 📞 ${booking.contact_phone}` : ""}</p>}
        {booking.validation_note && (
          <div className={`mt-2 p-2 rounded text-xs ${noteClass}`}>
            💬 {booking.validation_note}
          </div>
        )}
        {isGood && booking.observation_date && (
          <p className="text-xs text-emerald-600 font-medium mt-2">📅 Observation: {formatDate(booking.observation_date)}</p>
        )}
        {isHTL && (
          <p className="text-xs text-purple-600 font-medium mt-2">🔥 Interested — follow up later</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Daily Lodgement Dashboard</h2>
        <div className="flex items-center gap-3">
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="all">All Staff</option>
            {STAFF_MEMBERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={() => { setFromDate(""); setToDate(""); }}
            className="text-xs text-[#E6017D] hover:text-[#c9016c] font-medium"
          >
            Show All
          </button>
          <button
            onClick={() => { setFromDate(toISODate(new Date())); setToDate(toISODate(new Date())); }}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Today
          </button>
        </div>
      </div>

      {/* Week quick-picks */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[0, 1, 2, 3, 4].map((weeksAgo) => {
          const mon = new Date();
          const day = mon.getDay();
          const diff = (day === 0 ? -6 : 1 - day) - weeksAgo * 7;
          mon.setDate(mon.getDate() + diff);
          const fri = new Date(mon); fri.setDate(fri.getDate() + 4);
          const fmt = (d: Date) => d.toISOString().split("T")[0];
          const label = weeksAgo === 0 ? "This Week" : weeksAgo === 1 ? "Last Week" : `${weeksAgo}w ago`;
          const isActive = fromDate === fmt(mon) && toDate === fmt(fri);
          return (
            <button
              key={weeksAgo}
              onClick={() => { setFromDate(fmt(mon)); setToDate(fmt(fri)); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${isActive ? "bg-[#E6017D] text-white border-[#E6017D]" : "bg-white text-slate-600 border-gray-200 hover:border-[#E6017D] hover:text-[#E6017D]"}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {(() => {
          const total = filtered.length;
          const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
          return (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-slate-800">{total}</div>
                <div className="text-xs text-slate-500">Total Processed</div>
              </div>
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{validated.length}</div>
                <div className="text-xs text-emerald-500 font-semibold mt-0.5">{validated.length}/{total} · {pct(validated.length)}%</div>
                <div className="text-xs text-emerald-600">Validated</div>
              </div>
              <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
                <div className="text-xs text-red-500 font-semibold mt-0.5">{rejected.length}/{total} · {pct(rejected.length)}%</div>
                <div className="text-xs text-red-600">Rejected</div>
              </div>
              <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{naCalls.length}</div>
                <div className="text-xs text-orange-500 font-semibold mt-0.5">{naCalls.length}/{total} · {pct(naCalls.length)}%</div>
                <div className="text-xs text-orange-600">Call N/A</div>
              </div>
              <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{hotTryLater.length}</div>
                <div className="text-xs text-purple-500 font-semibold mt-0.5">{hotTryLater.length}/{total} · {pct(hotTryLater.length)}%</div>
                <div className="text-xs text-purple-600">Hot Try Later</div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Split columns */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Validated ({validated.length})
          </h3>
          <div className="space-y-3">
            {validated.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No validated bookings{fromDate ? " for this date range" : ""}</p>
            ) : (
              validated.map((b) => <BookingCard key={b.id} booking={b} type="validated" />)
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Rejected ({rejected.length})
          </h3>
          <div className="space-y-3">
            {rejected.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No rejected bookings{fromDate ? " for this date range" : ""}</p>
            ) : (
              rejected.map((b) => <BookingCard key={b.id} booking={b} type="rejected" />)
            )}
          </div>
        </div>
      </div>

      {/* Hot Try Later section */}
      {hotTryLater.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            🔥 Hot Try Later ({hotTryLater.length})
          </h3>
          <p className="text-xs text-gray-400 mb-3">Interested but not right now — good bookings to follow up on later.</p>
          <div className="grid grid-cols-2 gap-3">
            {hotTryLater.map((b) => <BookingCard key={b.id} booking={b} type="hot_try_later" />)}
          </div>
        </div>
      )}

      {/* N/A Calls section */}
      {naCalls.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            Call N/A ({naCalls.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {naCalls.map((b) => (
              <div key={b.id} className="rounded-lg border-2 border-orange-200 bg-orange-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-orange-100 text-orange-700">
                      📞 N/A × {(b as any).na_count || 1}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-amber-100 text-amber-700">Pending</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{formatDate(b.booking_date)}</span>
                </div>
                <h4 className="font-semibold text-sm text-slate-800">{b.business_name}</h4>
                <p className="text-xs text-slate-500 mt-1">👤 {b.staff_member} · 🤝 {b.buddy}</p>
                {b.contact_name && <p className="text-xs text-slate-400 mt-0.5">📇 {b.contact_name} {b.contact_phone ? `· 📞 ${b.contact_phone}` : ""}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* NA × 2 — Removed from Queue */}
      {na2Filtered.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            📞 NA × 2 — Removed from Queue ({na2Filtered.length})
          </h3>
          <p className="text-xs text-gray-400 mb-3">Called twice with no answer — removed from the validation queue.</p>
          <div className="grid grid-cols-2 gap-3">
            {na2Filtered.map((b) => (
              <div key={b.id} className="rounded-lg border-2 border-orange-200 bg-orange-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase">
                    📞 NA × {(b as any).na_count || 0}
                  </span>
                  <span className="text-[10px] text-gray-400">{formatDate(b.booking_date)}</span>
                </div>
                <h4 className="font-semibold text-sm text-slate-800">{b.business_name}</h4>
                <p className="text-xs text-slate-500 mt-1">👤 {b.staff_member} · 🤝 {b.buddy}</p>
                {b.contact_name && <p className="text-xs text-slate-400 mt-0.5">📇 {b.contact_name} {b.contact_phone ? ` · 📞 ${b.contact_phone}` : ""}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: Observation Schedule
// ═══════════════════════════════════════════════════════════════════════════════

function ObservationScheduleTab({ bookings }: { bookings: Booking[] }) {
  const [staffFilter, setStaffFilter] = useState("all");

  const scheduled = bookings
    .filter((b) => b.status === "validated" && b.observation_date)
    .sort((a, b) => (a.observation_date! > b.observation_date! ? 1 : -1));

  const filtered = staffFilter === "all" ? scheduled : scheduled.filter((b) => b.staff_member === staffFilter);

  const today = toISODate(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Observation Schedule</h2>
          <p className="text-sm text-slate-500">1 validated booking per staff member per day — auto-scheduled on validation</p>
        </div>
        <select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="all">All Staff</option>
          {STAFF_MEMBERS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-slate-600 font-medium">No observations scheduled yet</p>
          <p className="text-slate-400 text-sm mt-1">Validated bookings will be auto-scheduled here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Observation Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Business</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Booked</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => {
                const isPast = b.observation_date! < today;
                const isToday = b.observation_date === today;
                return (
                  <tr key={b.id} className={`${isToday ? "bg-pink-50" : isPast ? "bg-gray-50/50" : "bg-white"} hover:bg-gray-50`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isToday && <span className="w-2 h-2 rounded-full bg-[#E6017D] animate-pulse"></span>}
                        <span className={`font-medium ${isToday ? "text-[#E6017D]" : isPast ? "text-gray-400" : "text-slate-800"}`}>
                          {formatDate(b.observation_date!)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{b.staff_member}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{b.business_name}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(b.booking_date)}</td>
                    <td className="px-4 py-3 text-slate-500">{b.contact_name || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {isToday ? (
                        <span className="px-2 py-1 bg-pink-100 text-[#E6017D] text-xs font-bold rounded-full">TODAY</span>
                      ) : isPast ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">DONE</span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">UPCOMING</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: Reports
// ═══════════════════════════════════════════════════════════════════════════════

function ReportsTab({ bookings }: { bookings: Booking[] }) {
  const [staffFilter, setStaffFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = bookings.filter((b) => {
    if (staffFilter !== "all" && b.staff_member !== staffFilter) return false;
    if (fromDate && b.booking_date < fromDate) return false;
    if (toDate && b.booking_date > toDate) return false;
    return true;
  });

  // Group by date
  const byDate: Record<string, Booking[]> = {};
  filtered.forEach((b) => {
    const key = b.booking_date;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(b);
  });
  const sortedDates = Object.keys(byDate).sort().reverse();

  // Group by staff
  const byStaff: Record<string, Booking[]> = {};
  filtered.forEach((b) => {
    if (!byStaff[b.staff_member]) byStaff[b.staff_member] = [];
    byStaff[b.staff_member].push(b);
  });

  const total = filtered.length;
  const validated = filtered.filter((b) => b.status === "validated").length;
  const rejected = filtered.filter((b) => b.status === "rejected").length;
  const pending = filtered.filter((b) => b.status === "pending").length;
  const firstCallPending = filtered.filter((b) => b.status === "pending" && !((b as any).na_count > 0)).length;
  const naAwaitingRetry = filtered.filter((b) => b.status === "pending" && (b as any).na_count > 0).length;
  const htl = filtered.filter((b) => b.status === "hot_try_later").length;
  // Validation rate: validated ÷ (validated + rejected) — HTL excluded (it's a good outcome, not a failure)
  const validationRate = (validated + rejected) > 0 ? Math.round((validated / (validated + rejected)) * 100) : 0;

  const rejectionNotes = filtered
    .filter((b) => b.status === "rejected" && b.validation_note)
    .map((b) => ({ note: b.validation_note!, staff: b.staff_member, date: b.booking_date, business: b.business_name }));

  // Rejection reason breakdown — per staff × reason
  const rejectedBookings = filtered.filter((b) => b.status === "rejected");
  const staffList = Array.from(new Set(rejectedBookings.map((b) => b.staff_member))).sort();
  const reasonCounts: Record<string, Record<string, number>> = {};
  staffList.forEach((staff) => { reasonCounts[staff] = {}; REJECTION_REASONS.forEach((r) => { reasonCounts[staff][r] = 0; }); reasonCounts[staff]["Other / untagged"] = 0; });
  rejectedBookings.forEach((b) => {
    const staff = b.staff_member;
    if (!reasonCounts[staff]) return;
    const reasons = (b as any).rejection_reason ? String((b as any).rejection_reason).split(",").map((s: string) => s.trim()).filter(Boolean) : [];
    if (reasons.length === 0) { reasonCounts[staff]["Other / untagged"] += 1; }
    else { reasons.forEach((r: string) => { if (reasonCounts[staff][r] !== undefined) reasonCounts[staff][r] += 1; else reasonCounts[staff][r] = 1; }); }
  });
  const allReasonCols = [...REJECTION_REASONS, "Other / untagged"];

  const exportCSV = () => {
    const headers = ["Booking Date", "Business Name", "Contact Name", "Contact Phone", "Staff Member", "Buddy", "Status", "N/A Count", "Validation Date", "Note", "Observation Date"];
    const rows = filtered.map((b) => [
      b.booking_date, b.business_name, b.contact_name || "", b.contact_phone || "",
      b.staff_member, b.buddy, b.status, (b as any).na_count || 0,
      b.validation_date || "", b.validation_note || "", b.observation_date || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `validation-report-${toISODate(new Date())}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Performance Reports</h2>
        <div className="flex items-center gap-3">
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="all">All Staff</option>
            {STAFF_MEMBERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={exportCSV} className="px-4 py-1.5 bg-[#E6017D] text-white text-sm font-semibold rounded-lg hover:bg-[#c9016c] transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-7 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{total}</div>
          <div className="text-xs text-slate-500">Total Bookings</div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{validated}</div>
          <div className="text-xs text-emerald-600">Validated</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{rejected}</div>
          <div className="text-xs text-red-600">Rejected</div>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{firstCallPending}</div>
          <div className="text-xs text-amber-600">1st Call Pending</div>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{naAwaitingRetry}</div>
          <div className="text-xs text-orange-600">N/A, Retry Pending</div>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{htl}</div>
          <div className="text-xs text-purple-600">Hot Try Later</div>
        </div>
        <div className="bg-pink-50 rounded-xl border border-pink-200 p-4 text-center">
          <div className="text-2xl font-bold text-[#E6017D]">{validationRate}%</div>
          <div className="text-xs text-[#E6017D]">Val. Rate</div>
        </div>
      </div>

      {/* Per Staff Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-slate-700">Summary by Staff Member</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Staff</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Total</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Validated</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Rejected</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-purple-500">🔥 HTL</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">1st Call Pending</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">NA × 1</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">NA × 2<br/><span className="font-normal normal-case text-gray-400">(conf. call day prior)</span></th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Contacted</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Contact Rate</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Val. Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.entries(byStaff).map(([staff, bks]) => {
              const v = bks.filter((b) => b.status === "validated").length;
              const r = bks.filter((b) => b.status === "rejected").length;
              const h = bks.filter((b) => b.status === "hot_try_later").length;
              const fcp = bks.filter((b) => b.status === "pending" && !((b as any).na_count > 0)).length;
              const na1 = bks.filter((b) => b.status === "pending" && (b as any).na_count === 1).length;
              const na2 = bks.filter((b) => b.status === "pending" && ((b as any).na_count || 0) >= 2).length;
              const contacted = v + r;
              const contactRate = (contacted + na2) > 0 ? Math.round((contacted / (contacted + na2)) * 100) : 0;
              const rate = (v + r) > 0 ? Math.round((v / (v + r)) * 100) : 0;
              return (
                <tr key={staff} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{staff}</td>
                  <td className="px-4 py-2.5 text-center">{bks.length}</td>
                  <td className="px-4 py-2.5 text-center text-emerald-600 font-semibold">{v}</td>
                  <td className="px-4 py-2.5 text-center text-red-600 font-semibold">{r}</td>
                  <td className="px-4 py-2.5 text-center text-purple-600 font-semibold">{h}</td>
                  <td className="px-4 py-2.5 text-center text-amber-600">{fcp}</td>
                  <td className="px-4 py-2.5 text-center text-orange-500 font-semibold">{na1}</td>
                  <td className="px-4 py-2.5 text-center text-orange-700 font-bold">{na2}</td>
                  <td className="px-4 py-2.5 text-center text-blue-600 font-semibold">{contacted}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${contactRate >= 80 ? "bg-emerald-100 text-emerald-700" : contactRate >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {contactRate}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rate >= 80 ? "bg-emerald-100 text-emerald-700" : rate >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-slate-700">Daily Breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Date</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Total</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Validated</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Rejected</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-purple-500">🔥 HTL</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">1st Call Pending</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">NA × 1</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">NA × 2 (Conf.)</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Contacted</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Contact Rate</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Val. Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedDates.map((date) => {
              const dayBookings = byDate[date];
              const v = dayBookings.filter((b) => b.status === "validated").length;
              const r = dayBookings.filter((b) => b.status === "rejected").length;
              const h = dayBookings.filter((b) => b.status === "hot_try_later").length;
              const fcp = dayBookings.filter((b) => b.status === "pending" && !((b as any).na_count > 0)).length;
              const na1 = dayBookings.filter((b) => b.status === "pending" && (b as any).na_count === 1).length;
              const na2 = dayBookings.filter((b) => b.status === "pending" && ((b as any).na_count || 0) >= 2).length;
              const contacted = v + r;
              const contactRate = (contacted + na2) > 0 ? Math.round((contacted / (contacted + na2)) * 100) : 0;
              const rate = (v + r) > 0 ? Math.round((v / (v + r)) * 100) : 0;
              return (
                <tr key={date} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{formatDate(date)}</td>
                  <td className="px-4 py-2.5 text-center">{dayBookings.length}</td>
                  <td className="px-4 py-2.5 text-center text-emerald-600 font-semibold">{v}</td>
                  <td className="px-4 py-2.5 text-center text-red-600 font-semibold">{r}</td>
                  <td className="px-4 py-2.5 text-center text-purple-600 font-semibold">{h}</td>
                  <td className="px-4 py-2.5 text-center text-amber-600">{fcp}</td>
                  <td className="px-4 py-2.5 text-center text-orange-500 font-semibold">{na1}</td>
                  <td className="px-4 py-2.5 text-center text-orange-700 font-bold">{na2}</td>
                  <td className="px-4 py-2.5 text-center text-blue-600 font-semibold">{contacted}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${contactRate >= 80 ? "bg-emerald-100 text-emerald-700" : contactRate >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {contactRate}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rate >= 80 ? "bg-emerald-100 text-emerald-700" : rate >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rejection Reason Breakdown */}
      {rejectedBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-700">❌ Rejection Reason Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Why bookings were rejected — by staff member</p>
            </div>
            <span className="text-xs text-slate-400">{rejectedBookings.length} rejections total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Staff</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Total Rejected</th>
                  {allReasonCols.map((r) => (
                    <th key={r} className="px-4 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.map((staff) => {
                  const total = rejectedBookings.filter((b) => b.staff_member === staff).length;
                  return (
                    <tr key={staff} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{staff}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-red-600">{total}</td>
                      {allReasonCols.map((r) => {
                        const count = reasonCounts[staff]?.[r] || 0;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <td key={r} className="px-4 py-2.5 text-center">
                            {count > 0 ? (
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-slate-700">{count}</span>
                                <span className="text-[10px] text-slate-400">{pct}%</span>
                              </div>
                            ) : (
                              <span className="text-slate-200">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-2.5 font-bold text-slate-600">Total</td>
                  <td className="px-4 py-2.5 text-center font-bold text-red-600">{rejectedBookings.length}</td>
                  {allReasonCols.map((r) => {
                    const total = staffList.reduce((sum, s) => sum + (reasonCounts[s]?.[r] || 0), 0);
                    return (
                      <td key={r} className="px-4 py-2.5 text-center font-bold text-slate-600">
                        {total > 0 ? total : <span className="text-slate-200">—</span>}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Reasons */}
      {rejectionNotes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Rejection Notes</h3>
          <div className="space-y-2">
            {rejectionNotes.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-red-400 mt-0.5">❌</span>
                <div className="flex-1">
                  <p className="text-xs text-red-800 font-medium">{item.note}</p>
                  <p className="text-[10px] text-red-500 mt-1">{item.staff} · {item.business} · {formatDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// AUTH GATE
// ═══════════════════════════════════════════════════════════════════════════════

function AuthGate() {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem("validation_role");
    if (saved === "admin" || saved === "senior" || saved === "trainee") {
      setRole(saved as UserRole);
    }
    setLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(false);

    try {
      const res = await fetch("/api/validation/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.role) {
        setRole(data.role);
        window.sessionStorage.setItem("validation_role", data.role);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  };

  if (!loaded) return null;

  if (role) {
    return <ValidationContent role={role} />;
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-xl font-bold text-slate-800">Booking Validation</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent " + (error ? "border-red-300 bg-red-50" : "border-gray-300")}
          />
          {error && <p className="text-xs text-red-500 mt-2">Invalid password. Try again.</p>}
          <button
            type="submit"
            disabled={checking || !password}
            className="w-full mt-4 py-3 bg-[#E6017D] text-white font-semibold rounded-lg hover:bg-[#c9016c] disabled:opacity-50 transition-colors"
          >
            {checking ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ValidationPage() {
  return <AuthGate />;
}
