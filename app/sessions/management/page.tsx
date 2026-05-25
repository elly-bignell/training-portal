// app/sessions/management/page.tsx
//
// Management area home — admin-only. Listed at /sessions/management.
// This is the static route that beats the dynamic /sessions/[id] catch-
// all, so the URL resolves here before anything tries to look up a
// session called "management".
//
// Wrapped in <PasswordGate requireMaster> — only the admin password
// unlocks it. Reps using their per-rep passwords don't see this page at
// all; the PasswordGate's localStorage check is keyed to the admin
// password specifically (requireMaster: true on /api/auth/validate).

"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";
import { managementModules } from "@/data/management";

function ManagementHomeInner() {
  // Newest modules first — same sort logic as the sessions home.
  const ordered = [...managementModules].sort((a, b) =>
    a.date === b.date ? (a.title < b.title ? -1 : 1) : a.date < b.date ? 1 : -1
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header — visually distinct from the trainee sessions area so it's
          immediately clear this is a different surface. Slate-900 + gold
          accents instead of the navy blue used for the rep portal. */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#D49A30] text-slate-900 rounded text-[10px] font-bold tracking-wider">
              ★ ADMIN
            </span>
            <span className="text-white font-bold text-base">
              Marketing Sweet — Management
            </span>
          </div>
          <Link
            href="/sessions"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Sessions
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Management
          </h1>
          <p className="text-slate-600 mt-1 max-w-2xl">
            Notes captured from conversations about company direction —
            strategy, infrastructure, positioning. This is an information
            store, not a testing ground. No quizzes, no progress tracking.
          </p>
        </div>

        {ordered.length === 0 ? (
          <div className="text-center text-slate-500 py-16 bg-white rounded-2xl border border-slate-200">
            <p className="font-medium text-slate-700">Nothing here yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {ordered.map((mod) => (
              <Link
                key={mod.id}
                href={`/sessions/management/${mod.id}`}
                className="group relative block bg-white rounded-2xl border border-slate-200 hover:border-slate-900/40 hover:shadow-md transition-all p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <div className="text-xs text-slate-400 font-medium mb-2">
                  {new Date(mod.date).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">
                  {mod.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {mod.summary}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                    PDF
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                    Word
                  </span>
                  {mod.introVideoDriveId && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D49A30]/20 text-[#8a6a1f] rounded font-medium">
                      Intro video
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-900 group-hover:text-[#D49A30] transition-colors">
                  Open →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ManagementHomePage() {
  return (
    <PasswordGate requireMaster>
      <ManagementHomeInner />
    </PasswordGate>
  );
}
