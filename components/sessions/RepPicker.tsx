// components/sessions/RepPicker.tsx
//
// First-visit "Who are you?" screen for the Sessions area. Reps pick their
// name from the trainees list. Selection is persisted to localStorage so
// the next visit goes straight to the grid. There's a "Switch user" link
// rendered in the SessionsHeader for when a rep needs to change.

"use client";

import { useEffect, useState } from "react";
import { trainees } from "@/data/trainees";
import {
  getSelectedRepSlug,
  setSelectedRepSlug,
} from "@/hooks/useSessionsProgress";

// Sales-team allowlist: only these reps can access the Sessions area.
// Anyone else who lands on a /sessions URL won't see themselves in the
// dropdown and can't pick a name → can't proceed past the picker.
const SESSIONS_ALLOWED_SLUGS = [
  "lucas-tirri",
  "dylan-munro",
  "felipe-garcia",
];

interface Props {
  onSelected: (slug: string, name: string) => void;
  /** When true, render even if a rep is already chosen (used by Switch User). */
  forceShow?: boolean;
}

export default function RepPicker({ onSelected, forceShow = false }: Props) {
  const [pendingSlug, setPendingSlug] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const stored = getSelectedRepSlug();
    if (stored && !forceShow) {
      // Honour the stored selection only if it's still in the allowlist —
      // protects against a previously-selected rep losing access.
      const t = trainees.find(
        (tr) => tr.slug === stored && SESSIONS_ALLOWED_SLUGS.includes(tr.slug)
      );
      if (t) {
        onSelected(t.slug, t.name);
        setShouldShow(false);
      }
    }
    setHydrated(true);
    // We only care about this on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) return null;
  if (!shouldShow) return null;

  const handleConfirm = () => {
    if (!pendingSlug) return;
    const t = trainees.find((tr) => tr.slug === pendingSlug);
    if (!t) return;
    setSelectedRepSlug(t.slug);
    onSelected(t.slug, t.name);
    setShouldShow(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md">
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
            Pick yourself so we can track your sessions progress.
          </p>
        </div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your name
        </label>
        <select
          value={pendingSlug}
          onChange={(e) => setPendingSlug(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] outline-none mb-4"
        >
          <option value="">— Select your name —</option>
          {trainees
            .filter((t) => SESSIONS_ALLOWED_SLUGS.includes(t.slug))
            .map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
        </select>
        <button
          onClick={handleConfirm}
          disabled={!pendingSlug}
          className="w-full py-3 px-4 bg-[#1F3A5F] text-white font-semibold rounded-lg hover:bg-[#172d4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Open the portal
        </button>
        <p className="text-xs text-slate-400 mt-4 text-center">
          Not on the list? Ask Elly to add you.
        </p>
      </div>
    </div>
  );
}
