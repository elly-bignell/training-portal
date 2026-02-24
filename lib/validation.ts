// lib/validation.ts

export type BookingStatus = "pending" | "validated" | "rejected";

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
