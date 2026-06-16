// lib/validation.ts

export type BookingStatus = "pending" | "validated" | "rejected" | "hot_try_later";

export interface Booking {
  id: string;
  booking_date: string;
  business_name: string;
  contact_name?: string;
  contact_phone?: string;
  meeting_datetime?: string;
  staff_member: string;
  buddy: string;
  status: BookingStatus;
  validation_date?: string;
  validation_note?: string;
  observation_date?: string;
  na_date?: string;
  na_count?: number;
  rejection_reason?: string;
  created_at: string;
}

// Staff → buddy mapping. Includes archived staff (Krishna, Tom) so historical
// bookings still resolve to a buddy via getBuddy(); the dropdown for new
// submissions uses ACTIVE_STAFF_MEMBERS below, which excludes archived staff.
export const BUDDY_PAIRS: Record<string, string> = {
  // Active
  "Cindy Manrique": "Lucas Tirri",
  "Daren Ravikumar": "Lucas Tirri",
  "Jade Bautista": "Dylan Munro",
  "Riley Kerrison": "Dylan Munro",
  "Sydney Arnold": "Felipe Garcia",
  "Shian Roux": "Felipe Garcia",
  // Archived — kept so historical bookings still display a buddy in the UI.
  // Krishna's existing bookings stay under Dylan, Tom's stay under Felipe.
  "Krishna Patel": "Dylan Munro",
  "Tom Rennie": "Felipe Garcia",
};

// Staff that appear in the New Booking dropdown (currently active only).
export const ACTIVE_STAFF_MEMBERS = ["Cindy Manrique", "Shian Roux", "Riley Kerrison", "Sydney Arnold", "Daren Ravikumar", "Jade Bautista"];

// STAFF_MEMBERS is the dropdown source for forms / filters across the app.
// Aliased to ACTIVE_STAFF_MEMBERS so archived staff don't reappear in pickers.
export const STAFF_MEMBERS = ACTIVE_STAFF_MEMBERS;

export const BUDDIES = Array.from(new Set(Object.values(BUDDY_PAIRS)));

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
  return `${y}-${m}-${d}`;
}

export function getNextAvailableObservationDate(
  existingDates: string[],
  fromDate?: string
): string {
  const start = fromDate ? new Date(fromDate + "T00:00:00") : new Date();
  const tomorrow = new Date(start);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let candidate = new Date(tomorrow);
  const usedSet = new Set(existingDates);

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
