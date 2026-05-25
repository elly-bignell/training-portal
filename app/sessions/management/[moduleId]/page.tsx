// app/sessions/management/[moduleId]/page.tsx
//
// Management module detail — admin-only. The static parent route
// (/sessions/management/page.tsx) handles the list view; this dynamic
// segment renders one module.
//
// Layout:
//   1. Slate-900 admin header (matches the list page)
//   2. Module hero — title, date, gold callout with the core thesis
//   3. Optional Drive intro video embed (when introVideoDriveId is set)
//   4. Inline PDF (served from /public/management/*.pdf)
//   5. Download buttons — Word doc + PDF
//
// No progress tracking, no quiz, no Mark Viewed. This is reference
// material the admin keeps in one place.

"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";
import { getManagementModuleById } from "@/data/management";

function ManagementDetailInner() {
  const params = useParams<{ moduleId: string }>();
  const mod = getManagementModuleById(params.moduleId);
  if (!mod) return notFound();

  const driveEmbed = mod.introVideoDriveId
    ? `https://drive.google.com/file/d/${mod.introVideoDriveId}/preview`
    : null;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Admin header (matches list page) */}
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
            href="/sessions/management"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← All modules
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/sessions/management"
          className="inline-block text-sm text-slate-500 hover:text-slate-900 mb-4"
        >
          ← Management
        </Link>

        {/* Hero */}
        <div className="mb-6">
          <div className="text-xs font-bold tracking-wider text-slate-500 mb-3">
            {new Date(mod.date)
              .toLocaleDateString("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              .toUpperCase()}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
            {mod.title}
          </h1>
          <p className="text-slate-600 leading-relaxed mb-6 max-w-3xl">
            {mod.summary}
          </p>

          {/* Core thesis callout */}
          <div className="border-l-4 border-[#D49A30] bg-[#D49A30]/5 px-5 py-4 rounded-r-lg mb-6">
            <div className="text-xs font-bold tracking-wider text-[#D49A30] mb-1">
              CORE THESIS
            </div>
            <p className="text-slate-800 leading-relaxed">{mod.coreThesis}</p>
          </div>

          {/* Download row */}
          <div className="flex flex-wrap gap-2">
            <a
              href={mod.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 3v4a1 1 0 001 1h4M5 8V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"
                />
              </svg>
              Open PDF
            </a>
            <a
              href={mod.docxUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 rounded-lg hover:border-slate-500 hover:text-slate-900 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                />
              </svg>
              Download Word
            </a>
          </div>
        </div>

        {/* Optional intro video */}
        {driveEmbed && (
          <div className="mb-8">
            <div className="text-xs font-bold tracking-wider text-slate-500 mb-3">
              INTRODUCTORY VIDEO
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video">
              <iframe
                src={driveEmbed}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
                title={`${mod.title} — intro video`}
              />
            </div>
          </div>
        )}

        {/* Inline PDF */}
        <div>
          <div className="text-xs font-bold tracking-wider text-slate-500 mb-3">
            DOCUMENT
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
            <iframe
              src={`${mod.pdfUrl}#view=FitH`}
              className="w-full h-[800px]"
              title={`${mod.title} — PDF`}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 italic">
            PDF preview can be slow on mobile. Use the Open PDF / Download
            Word buttons above for a clean read.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ManagementDetailPage() {
  return (
    <PasswordGate requireMaster>
      <ManagementDetailInner />
    </PasswordGate>
  );
}
