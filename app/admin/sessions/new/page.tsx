// app/admin/sessions/new/page.tsx
//
// Admin-only form for publishing a new training session. Design goal:
// the colleague only has to drag in the files Corie's team sent her,
// paste a YouTube URL, tick a couple of boxes, and hit Publish. The
// server auto-extracts Summary + KeyTakeaway from the debrief docx and
// parses the quiz docx into structured questions — she never writes
// prose or JSON.
//
// UX flow:
//   1. Colleague drops 4 files: debrief.docx, debrief.pdf, toolkit.pdf,
//      quiz.docx (docx types are parsed server-side; PDFs are served
//      as-is via Airtable attachments)
//   2. Fills the small handful of fields she owns:
//        • YouTube URL (paste)
//        • Session date (defaults to today)
//        • Number (auto-suggested — she can override)
//        • LG/CS display number (auto-suggested)
//        • Audience (checkboxes, default all three)
//        • Origin (default: sales)
//   3. Hits Publish. Server:
//        • Parses quiz docx → structured questions
//        • Parses debrief docx → summary, keyTakeaway, title
//        • Creates Airtable Sessions row with metadata + parsed QuizJSON
//        • Uploads 3 attachments to that row
//        • Marks Published=true so the portal picks it up on next fetch
//   4. Success screen shows the new session link (~60s until live).
//
// Auth: PasswordGate with requireMaster — same standard as /admin/*.

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

interface SubmitResponse {
  ok: boolean;
  slug?: string;
  warnings?: string[];
  error?: string;
}

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function NewSessionForm() {
  const [debriefDocx, setDebriefDocx] = useState<File | null>(null);
  const [debriefPdf, setDebriefPdf] = useState<File | null>(null);
  const [toolkitPdf, setToolkitPdf] = useState<File | null>(null);
  const [quizDocx, setQuizDocx] = useState<File | null>(null);

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [sessionDate, setSessionDate] = useState(todayISO());
  const [number, setNumber] = useState("");
  const [lgNumber, setLgNumber] = useState("");
  const [audience, setAudience] = useState({
    Sales: true,
    "Lead Gen": true,
    "Customer Service": true,
  });
  const [origin, setOrigin] = useState<"sales" | "customer-service">("sales");

  // Title is a required visible field (auto-extract from PDF is
  // unreliable, so we always ask). Summary + KeyTakeaway are visible
  // optional fields — server still tries auto-extract as a fallback,
  // but the colleague can also type them here for full control.
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [keyTakeaway, setKeyTakeaway] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);

  const canSubmit = useMemo(() => {
    // Debrief DOCX is optional. Everything else is required (including
    // Title now, since PDF auto-extract is unreliable).
    if (!quizDocx) return false;
    if (!debriefPdf) return false;
    if (!toolkitPdf) return false;
    if (!title.trim()) return false;
    if (!Object.values(audience).some(Boolean)) return false;
    if (!sessionDate) return false;
    if (!number.trim()) return false;
    return !submitting;
  }, [
    debriefPdf,
    toolkitPdf,
    quizDocx,
    title,
    audience,
    sessionDate,
    number,
    submitting,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);

    try {
      const fd = new FormData();
      if (debriefDocx) fd.append("debriefDocx", debriefDocx);
      if (debriefPdf) fd.append("debriefPdf", debriefPdf);
      if (toolkitPdf) fd.append("toolkitPdf", toolkitPdf);
      if (quizDocx) fd.append("quizDocx", quizDocx);
      fd.append("youtubeUrl", youtubeUrl.trim());
      fd.append("sessionDate", sessionDate);
      fd.append("number", number.trim());
      fd.append("lgNumber", lgNumber.trim());
      fd.append("origin", origin);
      const teams = Object.entries(audience)
        .filter(([, v]) => v)
        .map(([k]) => k);
      fd.append("audience", JSON.stringify(teams));
      if (title.trim()) fd.append("titleOverride", title.trim());
      if (summary.trim()) fd.append("summaryOverride", summary.trim());
      if (keyTakeaway.trim())
        fd.append("keyTakeawayOverride", keyTakeaway.trim());

      // Pass the same password PasswordGate stored — the API validates it
      // matches an Admin-role Portal Users row before accepting the upload.
      let password = "";
      try {
        const raw = localStorage.getItem("training-portal-auth");
        if (raw) password = (JSON.parse(raw) as { password: string }).password;
      } catch {
        // ignore — API will return 401 and the UI will show it
      }
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: password ? { "x-auth-password": password } : undefined,
        body: fd,
      });
      const json = (await res.json()) as SubmitResponse;
      setResult(json);
      if (json.ok) {
        // Reset the file inputs AND the prose fields — the next session
        // will have different title/summary/keyTakeaway. Leave audience +
        // origin + date since those often carry across.
        setDebriefDocx(null);
        setDebriefPdf(null);
        setToolkitPdf(null);
        setQuizDocx(null);
        setTitle("");
        setSummary("");
        setKeyTakeaway("");
      }
    } catch (err) {
      setResult({ ok: false, error: String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to admin
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            Publish a new training session
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            Drag in the four files Corie&apos;s team sent, add the YouTube
            URL, tick the teams, hit publish. Goes live in ~60 seconds.
          </p>
        </div>

        {result?.ok && (
          <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4">
            <div className="font-semibold text-green-900">
              ✓ Session published
            </div>
            <p className="text-sm text-green-800 mt-1">
              Slug: <code className="font-mono">{result.slug}</code>. The
              portal picks it up within ~60 seconds. View it at{" "}
              <Link
                href={`/sessions/${result.slug}`}
                className="underline"
                target="_blank"
              >
                /sessions/{result.slug}
              </Link>
              .
            </p>
            {result.warnings && result.warnings.length > 0 && (
              <ul className="mt-3 text-xs text-green-800 list-disc list-inside">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {result && !result.ok && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
            <div className="font-semibold text-red-900">Publish failed</div>
            <p className="text-sm text-red-800 mt-1">
              {result.error ?? "Unknown error"}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6"
        >
          <FileField
            label="Debrief PDF"
            hint="The PDF version reps download. Server auto-extracts the summary + key takeaway from it."
            accept=".pdf"
            file={debriefPdf}
            onChange={setDebriefPdf}
          />
          <FileField
            label="Debrief DOCX (optional)"
            hint="Only if Corie sends you the DOCX too — extra cleanness for auto-extract. Skip if you only have the PDF."
            accept=".docx"
            file={debriefDocx}
            onChange={setDebriefDocx}
          />
          <FileField
            label="Toolkit PDF"
            hint="The single-page reference sheet."
            accept=".pdf"
            file={toolkitPdf}
            onChange={setToolkitPdf}
          />
          <FileField
            label="Quiz DOCX"
            hint="Standard Corie quiz format (Q1-Q8 with A/B/C/D + Answer Key section). Server parses this into the interactive quiz."
            accept=".docx"
            file={quizDocx}
            onChange={setQuizDocx}
          />

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Session title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Get Over the Curb."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Include the trailing full stop if the session title has one.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Summary
            </label>
            <textarea
              rows={3}
              placeholder="One-paragraph thesis of the session. Shown on the card and detail hero."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Optional. Leave blank to try auto-extract from the debrief PDF, or edit later in Airtable.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Key takeaway
            </label>
            <textarea
              rows={4}
              placeholder="The gold callout on the detail page. What the rep should walk away with."
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Optional. Leave blank to try auto-extract, or edit later in Airtable.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Intro YouTube URL
            </label>
            <input
              type="url"
              placeholder="https://youtu.be/xxxxxxx"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave blank if there&apos;s no intro video for this session.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Session date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Number (closer view)
              </label>
              <input
                type="text"
                placeholder="51"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                LG/CS number
              </label>
              <input
                type="text"
                placeholder="43"
                value={lgNumber}
                onChange={(e) => setLgNumber(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Blank = sales-only.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Audience
            </label>
            <div className="flex flex-wrap gap-4">
              {(["Sales", "Lead Gen", "Customer Service"] as const).map(
                (team) => (
                  <label
                    key={team}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={audience[team]}
                      onChange={(e) =>
                        setAudience({ ...audience, [team]: e.target.checked })
                      }
                    />
                    {team}
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Origin
            </label>
            <select
              value={origin}
              onChange={(e) =>
                setOrigin(e.target.value as "sales" | "customer-service")
              }
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="sales">Sales training</option>
              <option value="customer-service">Customer service training</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Drives the coloured pill on the session card.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-[#1F3A5F] px-6 py-3 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#183050]"
            >
              {submitting ? "Publishing…" : "Publish session"}
            </button>
            <p className="text-xs text-slate-500 mt-2">
              Files are uploaded to Airtable and the portal picks up the
              new session within ~60 seconds.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

interface FileFieldProps {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
}

function FileField({ label, hint, accept, file, onChange }: FileFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800 mb-1">
        {label}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
      />
      <p className="text-xs text-slate-500 mt-1">{hint}</p>
      {file && (
        <p className="text-xs text-green-700 mt-1">
          ✓ {file.name} ({Math.round(file.size / 1024)} KB)
        </p>
      )}
    </div>
  );
}

export default function NewSessionPage() {
  return (
    <PasswordGate requireMaster>
      <NewSessionForm />
    </PasswordGate>
  );
}
