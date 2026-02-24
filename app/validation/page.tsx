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

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
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

    E -->|"✅ Good"| F["Validated\n<b>Status: Validated</b>"]
    E -->|"❌ Poor"| G["Rejected\n<b>Status: Rejected</b>\nBuddy writes rejection note"]

    F --> H["📝 Buddy Provides Feedback\nto Staff Member"]
    G --> H

    F --> I["📅 Added to Observation Queue"]
    I --> J{"Next Available\nDay Free?"}
    J -->|"Yes"| K["✅ Scheduled for Observation\n<b>1 per day max</b>"]
    J -->|"No"| L["Rolls to Next\nAvailable Weekday"]
    L --> J

    K --> M["👀 Staff Member Observes\nBuddy Runs the Meeting"]

    G --> N["📊 Logged in Daily\nLodgement Dashboard"]
    F --> N

    N --> O["📈 Performance Report\nGenerated Weekly"]
    O --> P["Validation Rate =\nValidated ÷ Total Bookings"]

    style A fill:#E6017D,stroke:#E6017D,color:#fff
    style B fill:#fef3c7,stroke:#f59e0b,color:#92400e
    style F fill:#d1fae5,stroke:#10b981,color:#065f46
    style G fill:#fee2e2,stroke:#ef4444,color:#991b1b
    style K fill:#dbeafe,stroke:#3b82f6,color:#1e40af
    style M fill:#84D4BD,stroke:#84D4BD,color:#064e3b
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
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-400"></div>
            <span className="text-xs text-slate-600">Observation Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#84D4BD" }}></div>
            <span className="text-xs text-slate-600">Meeting Observation</span>
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
    meeting_datetime: "",
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
          meeting_datetime: "",
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date Booked *</label>
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

          <div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date/Time <span className="font-normal text-gray-400">(Adelaide time)</span></label>
              <input
                type="datetime-local"
                value={form.meeting_datetime}
                onChange={(e) => setForm({ ...form, meeting_datetime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
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
// TAB 2: Validation Queue
// ═══════════════════════════════════════════════════════════════════════════════

function ValidationQueueTab({ bookings, onUpdate, allBookings }: {
  bookings: Booking[];
  onUpdate: () => void;
  allBookings: Booking[];
}) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [rejectMode, setRejectMode] = useState<Record<string, boolean>>({});

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const today = toISODate(new Date());

  const getNote = (id: string) => notes[id] || "";
  const setNote = (id: string, val: string) => setNotes((prev) => ({ ...prev, [id]: val }));

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
        }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      setNotes((prev) => { const n = { ...prev }; delete n[booking.id]; return n; });
      setRejectMode((prev) => { const r = { ...prev }; delete r[booking.id]; return r; });
      onUpdate();
    } catch (err) {
      console.error("Failed to reject:", err);
      alert("Failed to reject booking — check console for details.");
    } finally {
      setProcessingId(null);
    }
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
        <div className="space-y-3">
          {pendingBookings.map((booking) => {
            const isRejecting = !!rejectMode[booking.id];
            const isProcessing = processingId === booking.id;
            const note = getNote(booking.id);

            return (
              <div key={booking.id} className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">Pending</span>
                      <span className="text-xs text-gray-400">Booked {formatDate(booking.booking_date)}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{booking.business_name}</h3>
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
                  <textarea
                    value={note}
                    onChange={(e) => setNote(booking.id, e.target.value)}
                    placeholder={isRejecting ? "Rejection reason (required)..." : "Feedback note (optional)..."}
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
                        onClick={() => setRejectMode((prev) => ({ ...prev, [booking.id]: true }))}
                        className="flex-1 py-2.5 bg-white text-red-600 border-2 border-red-200 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-1.5"
                      >
                        ❌ Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: Daily Lodgement
// ═══════════════════════════════════════════════════════════════════════════════

function LodgementTab({ bookings }: { bookings: Booking[] }) {
  const [dateFilter, setDateFilter] = useState(toISODate(new Date()));
  const [staffFilter, setStaffFilter] = useState("all");

  const processed = bookings.filter((b) => b.status !== "pending");
  const filtered = processed.filter((b) => {
    if (staffFilter !== "all" && b.staff_member !== staffFilter) return false;
    if (dateFilter && b.validation_date !== dateFilter) return false;
    return true;
  });

  const validated = filtered.filter((b) => b.status === "validated");
  const rejected = filtered.filter((b) => b.status === "rejected");

  function BookingCard({ booking, type }: { booking: Booking; type: "validated" | "rejected" }) {
    const isGood = type === "validated";
    return (
      <div className={`rounded-lg border-2 p-4 ${isGood ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${isGood ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {isGood ? "✅ Validated" : "❌ Rejected"}
          </span>
          <span className="text-[10px] text-gray-400">{formatDate(booking.booking_date)}</span>
        </div>
        <h4 className="font-semibold text-sm text-slate-800">{booking.business_name}</h4>
        <p className="text-xs text-slate-500 mt-1">👤 {booking.staff_member} · 🤝 {booking.buddy}</p>
        {booking.contact_name && <p className="text-xs text-slate-400 mt-0.5">📇 {booking.contact_name} {booking.contact_phone ? `· 📞 ${booking.contact_phone}` : ""}</p>}
        {booking.validation_note && (
          <div className={`mt-2 p-2 rounded text-xs ${isGood ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
            💬 {booking.validation_note}
          </div>
        )}
        {isGood && booking.observation_date && (
          <p className="text-xs text-emerald-600 font-medium mt-2">📅 Observation: {formatDate(booking.observation_date)}</p>
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
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <button onClick={() => setDateFilter("")} className="text-xs text-[#E6017D] hover:text-[#c9016c] font-medium">
            Show All
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{filtered.length}</div>
          <div className="text-xs text-slate-500">Total Processed</div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{validated.length}</div>
          <div className="text-xs text-emerald-600">Validated</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
          <div className="text-xs text-red-600">Rejected</div>
        </div>
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
              <p className="text-sm text-gray-400 italic">No validated bookings{dateFilter ? " for this date" : ""}</p>
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
              <p className="text-sm text-gray-400 italic">No rejected bookings{dateFilter ? " for this date" : ""}</p>
            ) : (
              rejected.map((b) => <BookingCard key={b.id} booking={b} type="rejected" />)
            )}
          </div>
        </div>
      </div>
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
  const validationRate = (validated + rejected) > 0 ? Math.round((validated / (validated + rejected)) * 100) : 0;

  const rejectionNotes = filtered
    .filter((b) => b.status === "rejected" && b.validation_note)
    .map((b) => ({ note: b.validation_note!, staff: b.staff_member, date: b.booking_date, business: b.business_name }));

  const exportCSV = () => {
    const headers = ["Booking Date", "Business Name", "Contact Name", "Contact Phone", "Staff Member", "Buddy", "Status", "Validation Date", "Note", "Observation Date"];
    const rows = filtered.map((b) => [
      b.booking_date, b.business_name, b.contact_name || "", b.contact_phone || "",
      b.staff_member, b.buddy, b.status,
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
      <div className="grid grid-cols-5 gap-4 mb-6">
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
          <div className="text-2xl font-bold text-amber-600">{pending}</div>
          <div className="text-xs text-amber-600">Pending</div>
        </div>
        <div className="bg-pink-50 rounded-xl border border-pink-200 p-4 text-center">
          <div className="text-2xl font-bold text-[#E6017D]">{validationRate}%</div>
          <div className="text-xs text-[#E6017D]">Validation Rate</div>
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
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Pending</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Val. Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.entries(byStaff).map(([staff, bks]) => {
              const v = bks.filter((b) => b.status === "validated").length;
              const r = bks.filter((b) => b.status === "rejected").length;
              const p = bks.filter((b) => b.status === "pending").length;
              const rate = (v + r) > 0 ? Math.round((v / (v + r)) * 100) : 0;
              return (
                <tr key={staff} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{staff}</td>
                  <td className="px-4 py-2.5 text-center">{bks.length}</td>
                  <td className="px-4 py-2.5 text-center text-emerald-600 font-semibold">{v}</td>
                  <td className="px-4 py-2.5 text-center text-red-600 font-semibold">{r}</td>
                  <td className="px-4 py-2.5 text-center text-amber-600">{p}</td>
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
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Pending</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Val. Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedDates.map((date) => {
              const dayBookings = byDate[date];
              const v = dayBookings.filter((b) => b.status === "validated").length;
              const r = dayBookings.filter((b) => b.status === "rejected").length;
              const p = dayBookings.filter((b) => b.status === "pending").length;
              const rate = (v + r) > 0 ? Math.round((v / (v + r)) * 100) : 0;
              return (
                <tr key={date} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{formatDate(date)}</td>
                  <td className="px-4 py-2.5 text-center">{dayBookings.length}</td>
                  <td className="px-4 py-2.5 text-center text-emerald-600 font-semibold">{v}</td>
                  <td className="px-4 py-2.5 text-center text-red-600 font-semibold">{r}</td>
                  <td className="px-4 py-2.5 text-center text-amber-600">{p}</td>
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
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════════
// AUTH GATE — role-based access using existing password system
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
