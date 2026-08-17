// components/PBInput.tsx
//
// Inline number input for editing a trainee's PB Bookings (Day or Week)
// straight from the Calls & Bookings table on the home page. Optimistic
// update: shows the new value immediately, then POSTs to /api/pbs and
// reverts if the request fails.

"use client";

import { useEffect, useState } from "react";

interface PBInputProps {
  slug: string;
  kind: "day" | "week";
  initial: number | undefined;
}

export default function PBInput({ slug, kind, initial }: PBInputProps) {
  // Local value so typing is responsive. Sync back to `initial` when the
  // upstream trainee context refreshes (e.g. after another rep updates
  // and the polling picks it up).
  const [value, setValue] = useState<string>(
    initial != null ? String(initial) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(initial != null ? String(initial) : "");
  }, [initial]);

  const persist = async () => {
    const trimmed = value.trim();
    // Empty input → null (clears the field)
    const numeric: number | null = trimmed === "" ? null : Number(trimmed);
    if (numeric !== null && (!Number.isFinite(numeric) || numeric < 0)) {
      setError("bad");
      return;
    }
    // No-op if unchanged
    if ((numeric ?? null) === (initial ?? null)) {
      setError(null);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/pbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind, value: numeric }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setError(json.error?.slice(0, 40) ?? "save failed");
        // Revert
        setValue(initial != null ? String(initial) : "");
      } else {
        // Patch the localStorage trainee-context cache so a page refresh
        // within the 10-minute TTL still shows the new value (otherwise
        // the stale cached snapshot would flash for ~200ms until the
        // background /api/trainees fetch resolves).
        try {
          const raw = localStorage.getItem("trainee-context-v2");
          if (raw) {
            const parsed = JSON.parse(raw) as {
              value: { allTrainees?: Array<{ slug: string; pbBookingsDay?: number; pbBookingsWeek?: number }> };
              ts: number;
            };
            const list = parsed.value?.allTrainees ?? [];
            const target = list.find((t) => t.slug === slug);
            if (target) {
              if (kind === "day") {
                target.pbBookingsDay = numeric ?? undefined;
              } else {
                target.pbBookingsWeek = numeric ?? undefined;
              }
              localStorage.setItem("trainee-context-v2", JSON.stringify(parsed));
            }
          }
        } catch {
          // Cache patch is best-effort — safe to ignore failures since
          // the background fetch will overwrite on next mount anyway.
        }
      }
    } catch (err) {
      setError(String(err).slice(0, 40));
      setValue(initial != null ? String(initial) : "");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="number"
        min={0}
        max={999}
        step={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={persist}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className={`w-14 rounded border px-1.5 py-1 text-sm text-center tabular-nums ${
          error
            ? "border-red-400 bg-red-50"
            : saving
            ? "border-blue-300 bg-blue-50"
            : "border-gray-300 bg-white hover:border-gray-400 focus:border-[#1F3A5F] focus:outline-none"
        }`}
        title={error ? `Failed: ${error}` : `PB ${kind}`}
      />
    </div>
  );
}
