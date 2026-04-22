// app/checklist/page.tsx
//
// Daily Checklist hub — a single URL with tabs for every Lead Genner.
//
// Access model (via /api/auth/validate, Airtable `Portal Users` table):
//   - Admin role ............ sees + edits every booker's tab
//   - Booker (matching slug). sees + edits only their own tab
//   - Anyone else ........... sees an "access denied" message
//
// Deep-link: /checklist?booker=<slug> selects that tab on load (falls
// back to the user's own tab if they don't have access to the requested
// one).

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BOOKERS } from "@/data/checklistTemplate";
import ChecklistTab from "@/components/ChecklistTab";

const AUTH_STORAGE_KEY = "training-portal-auth";
const AUTH_EXPIRY_HOURS = 24;

interface AuthState {
  slug: string;
  role: string;
}

interface StoredAuth {
  password: string;
  timestamp: number;
}

async function whoami(password: string): Promise<
  | { valid: true; slug: string; role: string }
  | { valid: false; expiry?: string }
> {
  try {
    const res = await fetch("/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Omit both traineeSlug and requireMaster → endpoint returns
      // {valid, role, slug} for any active user.
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return { valid: false };
    const json = await res.json();
    if (json.valid) return { valid: true, slug: json.slug, role: json.role };
    return { valid: false, expiry: json.expiry };
  } catch {
    return { valid: false };
  }
}

function ChecklistPageInner() {
  const searchParams = useSearchParams();
  const requestedBooker = searchParams.get("booker");

  const [auth, setAuth] = useState<AuthState | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Resume stored session
  useEffect(() => {
    const run = async () => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const parsed: StoredAuth = JSON.parse(stored);
          const hours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
          if (hours < AUTH_EXPIRY_HOURS) {
            const result = await whoami(parsed.password);
            if (result.valid) {
              setAuth({ slug: result.slug, role: result.role });
              setAuthLoading(false);
              return;
            }
          }
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setAuthLoading(false);
      setShowPrompt(true);
    };
    run();
  }, []);

  const isAdmin = auth?.role === "Admin";

  // Which tabs the current user can see
  const visibleBookers = useMemo(() => {
    if (!auth) return [];
    if (isAdmin) return BOOKERS;
    return BOOKERS.filter((b) => b.slug === auth.slug);
  }, [auth, isAdmin]);

  // Pick initial tab from query string if allowed, else first visible
  useEffect(() => {
    if (!auth || visibleBookers.length === 0) return;
    const allowed = visibleBookers.some((b) => b.slug === requestedBooker);
    if (allowed && requestedBooker) {
      setActiveTab(requestedBooker);
    } else {
      setActiveTab(visibleBookers[0].slug);
    }
  }, [auth, visibleBookers, requestedBooker]);

  // ------------------------------------------------------------------
  // Password prompt
  // ------------------------------------------------------------------
  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!auth && showPrompt) {
    return (
      <PasswordPrompt
        onSuccess={(slug, role, password) => {
          const payload: StoredAuth = { password, timestamp: Date.now() };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
          setAuth({ slug, role });
          setShowPrompt(false);
        }}
      />
    );
  }

  if (!auth) return null;

  // User is authenticated but isn't an admin and isn't a Lead Genner
  if (visibleBookers.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Header isAdmin={false} />
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              No checklist for your account
            </h2>
            <p className="text-sm text-slate-500">
              The daily checklist is only available to Lead Genners. If you
              think this is a mistake, contact your manager.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const activeBooker = visibleBookers.find((b) => b.slug === activeTab);

  return (
    <main className="min-h-screen bg-slate-100">
      <Header isAdmin={isAdmin} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5">
        {/* Tab bar — only meaningful when >1 booker visible */}
        {visibleBookers.length > 1 && (
          <div className="flex flex-wrap gap-1 border-b border-slate-200">
            {visibleBookers.map((b) => {
              const active = b.slug === activeTab;
              return (
                <button
                  key={b.slug}
                  onClick={() => setActiveTab(b.slug)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    active
                      ? "border-emerald-500 text-emerald-700 bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {b.shortName}
                </button>
              );
            })}
          </div>
        )}

        {activeBooker ? (
          <ChecklistTab
            key={activeBooker.slug}
            bookerSlug={activeBooker.slug}
            bookerName={activeBooker.name}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="text-center text-slate-500 py-10">
            Select a tab to begin.
          </div>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Page header
// ---------------------------------------------------------------------------
function Header({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={isAdmin ? "/admin" : "/"}
            className="text-slate-400 hover:text-white transition-colors"
            title="Back"
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
            <h1 className="text-xl font-bold">Daily Checklist</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Lead Genner accountability — resets every Sunday
            </p>
          </div>
        </div>
        {isAdmin && (
          <span className="text-xs uppercase font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
            Admin view
          </span>
        )}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Password prompt (mirrors PasswordGate styling)
// ---------------------------------------------------------------------------
function PasswordPrompt({
  onSuccess,
}: {
  onSuccess: (slug: string, role: string, password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await whoami(password);
    if (result.valid) {
      onSuccess(result.slug, result.role, password);
    } else {
      setError(result.expiry || "Invalid password. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Checklist</h1>
          <p className="text-gray-600 mt-2">Enter your password to continue</p>
        </div>
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter your password"
              autoFocus
              disabled={submitting}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking…
              </>
            ) : (
              "Access Checklist"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wrap in Suspense because useSearchParams() requires it
// ---------------------------------------------------------------------------
export default function ChecklistPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <ChecklistPageInner />
    </Suspense>
  );
}
