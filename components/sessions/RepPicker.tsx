// components/sessions/RepPicker.tsx
//
// First-visit auth screen for the Sessions area. Reps pick their name from
// the trainees list AND enter the password Elly issued them. The password
// is validated server-side via /api/auth/validate with the picked slug —
// each rep's password only validates against their own slug, so they can't
// pick a teammate's name and proceed. This is what stops cheating /
// copy-pasting across reps.

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  trainees,
  SESSIONS_ALLOWED_SLUGS,
  SALES_TEAM_SLUGS,
  LEAD_GEN_SLUGS,
  CUSTOMER_SERVICE_SLUGS,
} from "@/data/trainees";
import {
  getSelectedRepSlug,
  setSelectedRepSlug,
} from "@/hooks/useSessionsProgress";

// Department options for the top-level dropdown. From the rep's point of
// view there are just two teams — Sales and Customer Service. The Sales
// bucket combines closers (Lucas, Dylan, Felipe) and lead gen reps into
// one alphabetical name list, because reps don't self-identify by that
// distinction. Under the hood, closer vs lead gen still drives content
// gating (closers see the full sales track with quizzes; lead gen sees
// the curated LG projection with MC-only quizzes) — that split is enforced
// downstream by isLeadGen / usesLeadGenTrack, not by this picker.
type Department = "sales" | "customer-service";

const DEPARTMENTS: { value: Department; label: string; slugs: string[] }[] = [
  {
    value: "sales",
    label: "Sales",
    // Closers + Lead Gen reps rolled up into a single Sales list.
    slugs: [...SALES_TEAM_SLUGS, ...LEAD_GEN_SLUGS],
  },
  {
    value: "customer-service",
    label: "Customer Service",
    slugs: CUSTOMER_SERVICE_SLUGS,
  },
];

function departmentForSlug(slug: string): Department | null {
  if (SALES_TEAM_SLUGS.includes(slug) || LEAD_GEN_SLUGS.includes(slug)) {
    return "sales";
  }
  if (CUSTOMER_SERVICE_SLUGS.includes(slug)) return "customer-service";
  return null;
}

// Per-rep auth lives in localStorage so a rep doesn't re-enter the password
// on every page hop within their browser. Expires after 12 hours so an
// unattended desk doesn't stay logged in indefinitely.
const REP_AUTH_KEY = "sessions-rep-auth";
const REP_AUTH_TTL_MS = 12 * 60 * 60 * 1000;

interface StoredAuth {
  slug: string;
  ts: number;
}

function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(REP_AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.slug || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > REP_AUTH_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredAuth(slug: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    REP_AUTH_KEY,
    JSON.stringify({ slug, ts: Date.now() })
  );
}

export function clearStoredRepAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REP_AUTH_KEY);
}

interface Props {
  onSelected: (slug: string, name: string) => void;
  /** When true, render even if a rep is already chosen (used by Switch User). */
  forceShow?: boolean;
}

export default function RepPicker({ onSelected, forceShow = false }: Props) {
  const [department, setDepartment] = useState<Department | "">("");
  const [pendingSlug, setPendingSlug] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Names to show in the second dropdown once a department is picked.
  // Sorted alphabetically by full name so reps can scan the list quickly.
  const departmentTrainees = useMemo(() => {
    if (!department) return [];
    const slugs = DEPARTMENTS.find((d) => d.value === department)?.slugs ?? [];
    return trainees
      .filter((t) => slugs.includes(t.slug))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [department]);

  useEffect(() => {
    if (forceShow) {
      setHydrated(true);
      return;
    }
    const stored = readStoredAuth();
    const repPickerSlug = getSelectedRepSlug();
    // Both the rep slug AND the auth marker must still be valid. The auth
    // marker is what gates re-entry; the rep slug just remembers their
    // choice across reloads. If either is missing/expired, force re-login.
    if (
      stored &&
      repPickerSlug === stored.slug &&
      SESSIONS_ALLOWED_SLUGS.includes(stored.slug)
    ) {
      const t = trainees.find((tr) => tr.slug === stored.slug);
      if (t) {
        onSelected(t.slug, t.name);
        setShouldShow(false);
      }
    }
    // If a rep-slug is remembered but not authed (e.g. TTL expired), pre-fill
    // the dropdowns so they only need to re-enter their password.
    if (repPickerSlug) {
      const dept = departmentForSlug(repPickerSlug);
      if (dept) {
        setDepartment(dept);
        setPendingSlug(repPickerSlug);
      }
    }
    setHydrated(true);
    // We only care about this on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) return null;
  if (!shouldShow) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSlug || !password) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, traineeSlug: pendingSlug }),
      });
      const json = await res.json();
      if (!res.ok || !json.valid) {
        setError(
          json.expiry ??
            "Wrong password for that rep. Check with Elly if you can't find it."
        );
        setSubmitting(false);
        return;
      }
      const t = trainees.find((tr) => tr.slug === pendingSlug);
      if (!t) {
        setError("Rep not found.");
        setSubmitting(false);
        return;
      }
      setSelectedRepSlug(t.slug);
      writeStoredAuth(t.slug);
      onSelected(t.slug, t.name);
      setShouldShow(false);
    } catch {
      setError("Couldn't reach the server. Try again in a moment.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleConfirm}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#1F3A5F] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Who are you?</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pick your department, then your name, then enter your password.
            Each rep&apos;s password only works for their own profile — no
            copying off your teammates.
          </p>
        </div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Department
        </label>
        <select
          value={department}
          onChange={(e) => {
            const next = e.target.value as Department | "";
            setDepartment(next);
            setPendingSlug("");
            setError("");
          }}
          disabled={submitting}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] outline-none mb-4"
        >
          <option value="">— Select your department —</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your name
        </label>
        <select
          value={pendingSlug}
          onChange={(e) => {
            setPendingSlug(e.target.value);
            setError("");
          }}
          disabled={submitting || !department}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] outline-none mb-4 disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">
            {department
              ? "— Select your name —"
              : "— Pick a department first —"}
          </option>
          {departmentTrainees.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          disabled={submitting}
          autoComplete="current-password"
          placeholder="Your personal password"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] outline-none mb-3"
        />
        {error && (
          <div className="mb-3 px-3 py-2 bg-[#B14545]/10 border border-[#B14545]/30 rounded-md text-sm text-[#B14545]">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={!pendingSlug || !password || submitting}
          className="w-full py-3 px-4 bg-[#1F3A5F] text-white font-semibold rounded-lg hover:bg-[#172d4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Checking…" : "Open the portal"}
        </button>
        <p className="text-xs text-slate-400 mt-4 text-center">
          Forgot your password? Ask Elly.
        </p>
      </form>
    </div>
  );
}
