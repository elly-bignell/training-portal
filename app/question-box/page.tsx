// app/question-box/page.tsx
//
// Team Question Box.
//
// • Any authenticated portal user can post a question.
// • Admins see "Answer" / "Mark resolved" controls; everyone else is
//   read-only on answered cards.
// • Two tabs: Unanswered (default) and Answered. Answered questions
//   stay forever as reference material.
//
// Auth reuses the same `/api/auth/validate` flow as /checklist — a custom
// password prompt (not the full PasswordGate) so we can tell "admin vs.
// trainee" from the response and gate the answer controls accordingly.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTraineeContext } from "@/hooks/useTraineeContext";

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

interface QuestionRecord {
  id: string;
  booker_slug: string;
  booker_name: string;
  question: string;
  posted_at: string;
  status: "unanswered" | "answered";
  answer_text?: string;
  answered_by?: string;
  answered_at?: string;
}

type TabKey = "unanswered" | "answered";

async function whoami(password: string): Promise<
  | { valid: true; slug: string; role: string }
  | { valid: false; expiry?: string }
> {
  try {
    const res = await fetch("/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

function formatRelative(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Adelaide",
  });
}

export default function QuestionBoxPage() {
  // Trainee list is Airtable-driven — used below to resolve auth.slug to
  // the person's display name for the question author field.
  const { allTrainees } = useTraineeContext();
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("unanswered");

  // --- resume session ---
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
  const authorName =
    (auth && allTrainees.find((t) => t.slug === auth.slug)?.name) ||
    (auth?.role === "Admin" ? "Admin" : auth?.slug || "");

  // --- load questions ---
  const refresh = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const res = await fetch("/api/questions", { cache: "no-store" });
      const json = await res.json();
      setQuestions(json.questions || []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unanswered = useMemo(
    () => questions.filter((q) => q.status === "unanswered"),
    [questions]
  );
  const answered = useMemo(
    () => questions.filter((q) => q.status === "answered"),
    [questions]
  );

  // ------------------------------------------------------------------
  // Auth gates
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

  const list = activeTab === "unanswered" ? unanswered : answered;

  return (
    <main className="min-h-screen bg-slate-100">
      <Header isAdmin={isAdmin} />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5">
        {/* New question form */}
        <NewQuestionCard
          authorSlug={auth.slug}
          authorName={authorName}
          onPosted={refresh}
        />

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-slate-200">
          <TabButton
            label={`Unanswered (${unanswered.length})`}
            active={activeTab === "unanswered"}
            onClick={() => setActiveTab("unanswered")}
          />
          <TabButton
            label={`Answered (${answered.length})`}
            active={activeTab === "answered"}
            onClick={() => setActiveTab("answered")}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading…</div>
        ) : list.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="space-y-3">
            {list.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                isAdmin={isAdmin}
                authorName={authorName}
                onChanged={refresh}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-5 sm:py-6 flex items-center justify-between">
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
            <h1 className="text-xl font-bold">Question Box</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Ask anything — we&apos;ll work through it together every morning
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
// Tab button
// ---------------------------------------------------------------------------
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        active
          ? "border-emerald-500 text-emerald-700 bg-white"
          : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ tab }: { tab: TabKey }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        {tab === "unanswered" ? "No open questions" : "No answered questions yet"}
      </h3>
      <p className="text-sm text-slate-500">
        {tab === "unanswered"
          ? "Nothing in the bay right now. Post a question above when something comes up."
          : "Answered questions will appear here as a searchable reference."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// New question card
// ---------------------------------------------------------------------------
function NewQuestionCard({
  authorSlug,
  authorName,
  onPosted,
}: {
  authorSlug: string;
  authorName: string;
  onPosted: () => void;
}) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setError("");
    setPosting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booker_slug: authorSlug,
          booker_name: authorName,
          question: trimmed,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to post question");
      }
      setText("");
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post question");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
          Ask a question
        </h2>
        <span className="text-xs text-slate-500">
          Posting as <span className="font-medium text-slate-700">{authorName}</span>
        </span>
      </div>
      <form onSubmit={submit} className="p-4 sm:p-5 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's the situation? Include any context so someone coming back later can follow along."
          rows={3}
          disabled={posting}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-y min-h-[80px]"
        />
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Goes into the Unanswered bay — we&apos;ll tackle it as a team in the morning.
          </span>
          <button
            type="submit"
            disabled={posting || text.trim().length === 0}
            className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {posting ? "Posting…" : "Post question"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Question card
// ---------------------------------------------------------------------------
function QuestionCard({
  question,
  isAdmin,
  authorName,
  onChanged,
}: {
  question: QuestionRecord;
  isAdmin: boolean;
  authorName: string; // logged-in user's name — used when admin answers
  onChanged: () => void;
}) {
  const [answering, setAnswering] = useState(false);
  const [answerText, setAnswerText] = useState(question.answer_text || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = answerText.trim();
    if (!trimmed) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer_text: trimmed,
          answered_by: authorName,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to save answer");
      }
      setAnswering(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save answer");
    } finally {
      setSaving(false);
    }
  };

  const reopen = async () => {
    if (!confirm("Move this back to Unanswered? The previous answer will be cleared.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reopen: true }),
      });
      if (!res.ok) throw new Error("Failed to reopen");
      onChanged();
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this question permanently? This can't be undone.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      onChanged();
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const isAnswered = question.status === "answered";

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
        isAnswered ? "border-slate-200" : "border-amber-200"
      }`}
    >
      {/* Meta strip */}
      <div
        className={`px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs ${
          isAnswered
            ? "bg-emerald-50 text-emerald-800 border-b border-emerald-100"
            : "bg-amber-50 text-amber-800 border-b border-amber-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isAnswered ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span className="font-semibold">{question.booker_name}</span>
          <span className="text-slate-500">• asked {formatRelative(question.posted_at)}</span>
        </div>
        <span className="uppercase font-semibold tracking-wide">
          {isAnswered ? "Answered" : "Awaiting answer"}
        </span>
      </div>

      {/* Question */}
      <div className="px-4 sm:px-5 py-4">
        <p className="text-sm text-slate-800 whitespace-pre-wrap">{question.question}</p>
      </div>

      {/* Answer (if any) */}
      {isAnswered && question.answer_text && (
        <div className="px-4 sm:px-5 pb-4">
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wide font-semibold text-emerald-800 mb-1.5">
              Answer
              {question.answered_by ? ` — ${question.answered_by}` : ""}
              {question.answered_at ? ` • ${formatRelative(question.answered_at)}` : ""}
            </div>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">
              {question.answer_text}
            </p>
          </div>
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <div className="px-4 sm:px-5 pb-4 flex flex-wrap gap-2">
          {!isAnswered && !answering && (
            <button
              onClick={() => setAnswering(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Answer
            </button>
          )}
          {isAnswered && (
            <>
              <button
                onClick={() => {
                  setAnswerText(question.answer_text || "");
                  setAnswering(true);
                }}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-60"
              >
                Edit answer
              </button>
              <button
                onClick={reopen}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-60"
              >
                Reopen
              </button>
            </>
          )}
          <button
            onClick={remove}
            disabled={saving}
            className="ml-auto px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      )}

      {/* Answer form */}
      {isAdmin && answering && (
        <form onSubmit={submitAnswer} className="px-4 sm:px-5 pb-5 space-y-2 bg-slate-50 border-t border-slate-200">
          <label className="block text-[11px] uppercase tracking-wide font-semibold text-slate-600 pt-3">
            Your answer
          </label>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            rows={4}
            autoFocus
            disabled={saving}
            placeholder="Write the answer here. Make it clear enough that someone reading this next week could follow."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-y min-h-[100px] bg-white"
          />
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setAnswering(false);
                setAnswerText(question.answer_text || "");
                setError("");
              }}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || answerText.trim().length === 0}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : isAnswered ? "Save changes" : "Save & mark resolved"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Password prompt
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Question Box</h1>
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
              "Access Question Box"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
