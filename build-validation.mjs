// build-validation.mjs
// Run: node build-validation.mjs
// Creates the complete Booking Validation system at /validation

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

function ensureDir(dir) { mkdirSync(dir, { recursive: true }); }

// ─── 1. lib/validation.ts — Types & helpers ──────────────────────────────────

ensureDir('lib');
writeFileSync('lib/validation.ts', `// lib/validation.ts

export type BookingStatus = "pending" | "validated" | "rejected";

export interface Booking {
  id: string;
  airtable_id?: string;
  booking_date: string;
  business_name: string;
  contact_name?: string;
  contact_phone?: string;
  meeting_datetime?: string;
  lead_source?: string;
  staff_member: string;
  buddy: string;
  status: BookingStatus;
  validation_date?: string;
  validation_note?: string;
  observation_date?: string;
  created_at: string;
}

export const BUDDY_PAIRS: Record<string, string> = {
  "Connie Matthews": "Felipe Garcia",
  "Cindy Manrique": "Lucas Tirri",
  "Krishna Patel": "Dylan Munro",
};

export const STAFF_MEMBERS = Object.keys(BUDDY_PAIRS);
export const BUDDIES = Object.values(BUDDY_PAIRS);

export function getBuddy(staffMember: string): string {
  return BUDDY_PAIRS[staffMember] || "Unknown";
}

export function getStaffForBuddy(buddy: string): string | undefined {
  return Object.entries(BUDDY_PAIRS).find(([, b]) => b === buddy)?.[0];
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return \`\${y}-\${m}-\${d}\`;
}

export function getNextAvailableObservationDate(
  existingDates: string[],
  fromDate?: string
): string {
  const start = fromDate ? new Date(fromDate + "T00:00:00") : new Date();
  // Start from tomorrow at the earliest
  const tomorrow = new Date(start);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let candidate = new Date(tomorrow);
  const usedSet = new Set(existingDates);
  
  // Find next weekday not already used
  for (let i = 0; i < 60; i++) {
    const day = candidate.getDay();
    const iso = toISODate(candidate);
    if (day !== 0 && day !== 6 && !usedSet.has(iso)) {
      return iso;
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  return toISODate(candidate);
}
`);
console.log('✅ Created: lib/validation.ts');


// ─── 2. app/api/validation/route.ts — List & Create ──────────────────────────

ensureDir('app/api/validation');
writeFileSync('app/api/validation/route.ts', `// app/api/validation/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE = "Bookings";
const URL = \`https://api.airtable.com/v0/\${AIRTABLE_BASE_ID}/\${encodeURIComponent(TABLE)}\`;

const headers = {
  Authorization: \`Bearer \${AIRTABLE_API_KEY}\`,
  "Content-Type": "application/json",
};

// GET — fetch all bookings (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staff = searchParams.get("staff");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filters: string[] = [];
    if (staff) filters.push(\`{staff_member} = "\${staff}"\`);
    if (status) filters.push(\`{status} = "\${status}"\`);
    if (from) filters.push(\`IS_AFTER({booking_date}, "\${from}")\`);
    if (to) filters.push(\`IS_BEFORE({booking_date}, "\${to}")\`);

    let filterFormula = "";
    if (filters.length === 1) filterFormula = filters[0];
    else if (filters.length > 1) filterFormula = \`AND(\${filters.join(",")})\`;

    let allRecords: any[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams();
      if (filterFormula) params.set("filterByFormula", filterFormula);
      params.set("sort[0][field]", "booking_date");
      params.set("sort[0][direction]", "desc");
      if (offset) params.set("offset", offset);

      const res = await fetch(\`\${URL}?\${params.toString()}\`, {
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Airtable GET error:", err);
        throw new Error(\`Airtable error: \${res.status}\`);
      }

      const data = await res.json();
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset;
    } while (offset);

    const bookings = allRecords.map((r: any) => ({
      id: r.id,
      booking_date: r.fields.booking_date || "",
      business_name: r.fields.business_name || "",
      contact_name: r.fields.contact_name || "",
      contact_phone: r.fields.contact_phone || "",
      meeting_datetime: r.fields.meeting_datetime || "",
      lead_source: r.fields.lead_source || "",
      staff_member: r.fields.staff_member || "",
      buddy: r.fields.buddy || "",
      status: r.fields.status || "pending",
      validation_date: r.fields.validation_date || "",
      validation_note: r.fields.validation_note || "",
      observation_date: r.fields.observation_date || "",
      created_at: r.fields.created_at || "",
    }));

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST — create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_date, business_name, contact_name, contact_phone, meeting_datetime, lead_source, staff_member, buddy } = body;

    if (!business_name || !staff_member || !booking_date) {
      return NextResponse.json({ error: "business_name, staff_member, and booking_date are required" }, { status: 400 });
    }

    const fields: Record<string, any> = {
      booking_date,
      business_name,
      staff_member,
      buddy: buddy || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };
    if (contact_name) fields.contact_name = contact_name;
    if (contact_phone) fields.contact_phone = contact_phone;
    if (meeting_datetime) fields.meeting_datetime = meeting_datetime;
    if (lead_source) fields.lead_source = lead_source;

    const res = await fetch(URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Airtable POST error:", err);
      throw new Error(\`Airtable error: \${res.status}\`);
    }

    const data = await res.json();
    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
`);
console.log('✅ Created: app/api/validation/route.ts');


// ─── 3. app/api/validation/[id]/route.ts — Update (validate/reject/schedule) ─

ensureDir('app/api/validation/[id]');
writeFileSync('app/api/validation/[id]/route.ts', `// app/api/validation/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE = "Bookings";
const URL = \`https://api.airtable.com/v0/\${AIRTABLE_BASE_ID}/\${encodeURIComponent(TABLE)}\`;

const headers = {
  Authorization: \`Bearer \${AIRTABLE_API_KEY}\`,
  "Content-Type": "application/json",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const fields: Record<string, any> = {};
    if (body.status) fields.status = body.status;
    if (body.validation_date) fields.validation_date = body.validation_date;
    if (body.validation_note !== undefined) fields.validation_note = body.validation_note;
    if (body.observation_date) fields.observation_date = body.observation_date;

    const res = await fetch(\`\${URL}/\${id}\`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Airtable PATCH error:", err);
      throw new Error(\`Airtable error: \${res.status}\`);
    }

    const data = await res.json();
    return NextResponse.json({ success: true, record: data });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
`);
console.log('✅ Created: app/api/validation/[id]/route.ts');


// ─── 4. app/validation/page.tsx — Full validation dashboard ──────────────────

ensureDir('app/validation');
writeFileSync('app/validation/page.tsx', `// app/validation/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";
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

type Tab = "create" | "queue" | "lodgement" | "schedule" | "reports";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "create", label: "Create Booking", icon: "📝" },
  { key: "queue", label: "Validation Queue", icon: "⏳" },
  { key: "lodgement", label: "Daily Lodgement", icon: "📊" },
  { key: "schedule", label: "Observation Schedule", icon: "📅" },
  { key: "reports", label: "Reports", icon: "📈" },
];

function ValidationContent() {
  const [activeTab, setActiveTab] = useState<Tab>("create");
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

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Admin Dashboard
            </Link>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          <h1 className="text-2xl font-bold">Booking Validation</h1>
          <p className="text-slate-400 text-sm mt-1">Create bookings, validate, schedule observations, and track performance</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 -mt-3">
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={\`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all \${
                activeTab === tab.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }\`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "create" && (
          <CreateBookingTab onCreated={fetchBookings} saving={saving} setSaving={setSaving} />
        )}
        {activeTab === "queue" && (
          <ValidationQueueTab bookings={bookings} onUpdate={fetchBookings} allBookings={bookings} />
        )}
        {activeTab === "lodgement" && (
          <LodgementTab bookings={bookings} />
        )}
        {activeTab === "schedule" && (
          <ObservationScheduleTab bookings={bookings} />
        )}
        {activeTab === "reports" && (
          <ReportsTab bookings={bookings} />
        )}
      </div>
    </main>
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
    staff_member: STAFF_MEMBERS[0],
    booking_date: toISODate(new Date()),
    contact_name: "",
    contact_phone: "",
    meeting_datetime: "",
    lead_source: "",
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
          staff_member: form.staff_member,
          booking_date: toISODate(new Date()),
          contact_name: "",
          contact_phone: "",
          meeting_datetime: "",
          lead_source: "",
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
        <p className="text-sm text-slate-500 mb-6">Booking will be created as Pending Validation and assigned to the buddy automatically.</p>

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
                {STAFF_MEMBERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Buddy: {getBuddy(form.staff_member)}</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date/Time</label>
              <input
                type="datetime-local"
                value={form.meeting_datetime}
                onChange={(e) => setForm({ ...form, meeting_datetime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Lead Source</label>
              <select
                value={form.lead_source}
                onChange={(e) => setForm({ ...form, lead_source: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Referral">Referral</option>
                <option value="Inbound">Inbound</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
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
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const today = toISODate(new Date());

  const handleValidate = async (booking: Booking) => {
    setValidatingId(booking.id);
    try {
      // Find next available observation date for this staff member
      const staffObsDates = allBookings
        .filter((b) => b.staff_member === booking.staff_member && b.observation_date)
        .map((b) => b.observation_date!);
      const obsDate = getNextAvailableObservationDate(staffObsDates, today);

      await fetch(\`/api/validation/\${booking.id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "validated",
          validation_date: today,
          validation_note: noteText || "",
          observation_date: obsDate,
        }),
      });
      setNoteText("");
      onUpdate();
    } catch (err) {
      console.error("Failed to validate:", err);
    } finally {
      setValidatingId(null);
    }
  };

  const handleReject = async (booking: Booking) => {
    if (!noteText.trim()) {
      alert("A rejection note is required.");
      return;
    }
    setValidatingId(booking.id);
    try {
      await fetch(\`/api/validation/\${booking.id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          validation_date: today,
          validation_note: noteText,
        }),
      });
      setNoteText("");
      setRejectingId(null);
      onUpdate();
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setValidatingId(null);
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
          {pendingBookings.map((booking) => (
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
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <textarea
                  value={rejectingId === booking.id || validatingId === booking.id ? noteText : ""}
                  onChange={(e) => {
                    setNoteText(e.target.value);
                    if (!rejectingId) setRejectingId(null);
                  }}
                  onFocus={() => setNoteText(noteText)}
                  placeholder={rejectingId === booking.id ? "Rejection reason (required)..." : "Feedback note (optional)..."}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleValidate(booking)}
                    disabled={validatingId === booking.id}
                    className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1.5"
                  >
                    ✅ Mark Validated
                  </button>
                  {rejectingId === booking.id ? (
                    <button
                      onClick={() => handleReject(booking)}
                      disabled={validatingId === booking.id || !noteText.trim()}
                      className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1.5"
                    >
                      ❌ Confirm Rejection
                    </button>
                  ) : (
                    <button
                      onClick={() => { setRejectingId(booking.id); setNoteText(""); }}
                      className="flex-1 py-2.5 bg-white text-red-600 border-2 border-red-200 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-1.5"
                    >
                      ❌ Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
      <div className={\`rounded-lg border-2 p-4 \${isGood ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}\`}>
        <div className="flex items-center justify-between mb-2">
          <span className={\`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase \${isGood ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}\`}>
            {isGood ? "✅ Validated" : "❌ Rejected"}
          </span>
          <span className="text-[10px] text-gray-400">{formatDate(booking.booking_date)}</span>
        </div>
        <h4 className="font-semibold text-sm text-slate-800">{booking.business_name}</h4>
        <p className="text-xs text-slate-500 mt-1">👤 {booking.staff_member} · 🤝 {booking.buddy}</p>
        {booking.validation_note && (
          <div className={\`mt-2 p-2 rounded text-xs \${isGood ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}\`}>
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
          <button onClick={() => setDateFilter("")} className="text-xs text-pink-600 hover:text-pink-700 font-medium">
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
          <p className="text-sm text-slate-500">1 validated booking per staff member per day</p>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Business Name</th>
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
                  <tr key={b.id} className={\`\${isToday ? "bg-pink-50" : isPast ? "bg-gray-50/50" : "bg-white"} hover:bg-gray-50\`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isToday && <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>}
                        <span className={\`font-medium \${isToday ? "text-pink-700" : isPast ? "text-gray-400" : "text-slate-800"}\`}>
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
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-full">TODAY</span>
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

  // Filter
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

  // Totals
  const total = filtered.length;
  const validated = filtered.filter((b) => b.status === "validated").length;
  const rejected = filtered.filter((b) => b.status === "rejected").length;
  const pending = filtered.filter((b) => b.status === "pending").length;
  const validationRate = total > 0 ? Math.round((validated / (validated + rejected || 1)) * 100) : 0;

  // Rejection reasons
  const rejectionNotes = filtered
    .filter((b) => b.status === "rejected" && b.validation_note)
    .map((b) => b.validation_note!);

  // CSV Export
  const exportCSV = () => {
    const headers = ["Booking Date", "Business Name", "Staff Member", "Buddy", "Status", "Validation Date", "Note", "Observation Date"];
    const rows = filtered.map((b) => [
      b.booking_date, b.business_name, b.staff_member, b.buddy, b.status,
      b.validation_date || "", b.validation_note || "", b.observation_date || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => \`"\${c}"\`).join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`validation-report-\${toISODate(new Date())}.csv\`;
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
          <span className="text-gray-400">to</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={exportCSV} className="px-4 py-1.5 bg-pink-600 text-white text-sm font-semibold rounded-lg hover:bg-pink-700 transition-colors">
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
          <div className="text-2xl font-bold text-pink-600">{validationRate}%</div>
          <div className="text-xs text-pink-600">Validation Rate</div>
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
                    <span className={\`px-2 py-0.5 rounded-full text-xs font-bold \${rate >= 80 ? "bg-emerald-100 text-emerald-700" : rate >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}\`}>
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
                    <span className={\`px-2 py-0.5 rounded-full text-xs font-bold \${rate >= 80 ? "bg-emerald-100 text-emerald-700" : rate >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}\`}>
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Common Rejection Reasons */}
      {rejectionNotes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Common Rejection Reasons</h3>
          <div className="space-y-2">
            {rejectionNotes.map((note, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                <span className="text-red-400 mt-0.5">❌</span>
                <p className="text-xs text-red-800">{note}</p>
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

export default function ValidationPage() {
  return (
    <PasswordGate requireMaster>
      <ValidationContent />
    </PasswordGate>
  );
}
`);
console.log('✅ Created: app/validation/page.tsx');

console.log(`
🎉 Validation system created!

Files created:
  ├── lib/validation.ts (types, buddy mapping, helpers)
  ├── app/api/validation/route.ts (GET all, POST create)
  ├── app/api/validation/[id]/route.ts (PATCH validate/reject)
  └── app/validation/page.tsx (full dashboard with 5 tabs)

⚠️  REQUIRED: Create a "Bookings" table in your Airtable base with these fields:
  ┌──────────────────┬──────────────────┐
  │ Field Name       │ Type             │
  ├──────────────────┼──────────────────┤
  │ booking_date     │ Date             │
  │ business_name    │ Single line text │
  │ contact_name     │ Single line text │
  │ contact_phone    │ Single line text │
  │ meeting_datetime │ Single line text │
  │ lead_source      │ Single line text │
  │ staff_member     │ Single line text │
  │ buddy            │ Single line text │
  │ status           │ Single line text │
  │ validation_date  │ Date             │
  │ validation_note  │ Long text        │
  │ observation_date │ Date             │
  │ created_at       │ Single line text │
  └──────────────────┴──────────────────┘

Your existing AIRTABLE_API_KEY and AIRTABLE_BASE_ID env vars will be used.
The page lives at /validation and is admin-only (master password).
`);
