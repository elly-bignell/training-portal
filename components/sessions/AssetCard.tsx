// components/sessions/AssetCard.tsx
//
// Renders one of the five asset slots on a Session detail page.
//   debrief / toolkit  → inline PDF preview + view/download
//   podcast            → HTML5 audio with speed controls + resume tracking
//   presentation       → video or slide embed
//   quiz               → CTA card → /sessions/[id]/quiz
//
// Asset state transitions per the brief:
//   – PDFs become "viewed" when scrolled past 50% (here we approximate via
//     "Mark viewed" button + auto-mark on Open after 30s; iframe scroll inside
//     a cross-origin frame can't be observed).
//   – Audio/video become "viewed" at 75% played.
//   – Quiz becomes "viewed" only when passed (handled in the quiz page).

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Asset,
  AssetKind,
  AssetState,
  PdfAsset,
  PodcastAsset,
  PresentationAsset,
  QuizAsset,
  SessionProgress,
} from "@/types/sessions";

interface CommonProps {
  sessionId: string;
  asset: Asset;
  progress: SessionProgress | undefined;
  state: AssetState;
  onSetState: (kind: AssetKind, state: AssetState) => void;
  onResume: (kind: AssetKind, seconds: number) => void;
}

const KIND_LABEL: Record<AssetKind, string> = {
  debrief: "ASSET 1 — THE DEBRIEF (PDF)",
  toolkit: "ASSET 2 — THE TOOLKIT (PDF)",
  podcast: "ASSET 3 — THE PODCAST",
  presentation: "ASSET 4 — THE PRESENTATION",
  quiz: "ASSET 5 — THE QUIZ",
};

function StatePill({ state }: { state: AssetState }) {
  if (state === "viewed") {
    return (
      <span className="text-xs font-semibold text-[#3C8055]">✓ Viewed</span>
    );
  }
  if (state === "in-progress") {
    return (
      <span className="text-xs font-semibold text-[#1F3A5F]">In progress</span>
    );
  }
  return <span className="text-xs font-semibold text-slate-400">Not started</span>;
}

function AssetShell({
  kind,
  state,
  children,
}: {
  kind: AssetKind;
  state: AssetState;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`asset-${kind}`}
      className="border-t border-slate-200 pt-6 mt-6 first:border-0 first:pt-0 first:mt-0 scroll-mt-24"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold tracking-wider text-slate-500">
          {KIND_LABEL[kind]}
        </h3>
        <StatePill state={state} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        {children}
      </div>
    </section>
  );
}

// ─── PDF ────────────────────────────────────────────────────────────────────

function PdfCard({
  asset,
  state,
  onSetState,
}: CommonProps & { asset: PdfAsset }) {
  const [open, setOpen] = useState(false);

  // Auto-mark viewed 30s after opening (cross-origin iframe scroll can't be
  // inspected; this is a pragmatic placeholder until we host PDFs ourselves
  // and use PDF.js to track 50% scroll).
  useEffect(() => {
    if (!open || state === "viewed") return;
    onSetState(asset.kind, "in-progress");
    const t = setTimeout(() => onSetState(asset.kind, "viewed"), 30_000);
    return () => clearTimeout(t);
  }, [open, state, asset.kind, onSetState]);

  return (
    <div>
      <p className="text-sm text-slate-700 mb-2">
        {asset.kind === "debrief"
          ? "Structured summary of every concept covered in this session."
          : "Print-ready toolkit — pin it on the wall, open it before calls."}
      </p>
      <div className="text-xs text-slate-500 mb-4">⏱ {asset.estimate}</div>

      {open && (
        <div className="mb-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
          <iframe
            src={asset.url}
            title={`${asset.kind} preview`}
            className="w-full h-[60vh]"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-2 text-sm font-semibold bg-[#1F3A5F] text-white rounded-lg hover:bg-[#172d4a] transition-colors"
        >
          {open ? "Hide preview" : "View →"}
        </button>
        <a
          href={asset.url}
          download
          className="px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 rounded-lg hover:border-slate-400 transition-colors"
        >
          Download
        </a>
        {asset.kind === "toolkit" && (
          <a
            href={asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-semibold border border-[#D49A30] text-[#D49A30] rounded-lg hover:bg-[#D49A30] hover:text-white transition-colors"
          >
            Print
          </a>
        )}
        {state !== "viewed" && (
          <button
            onClick={() => onSetState(asset.kind, "viewed")}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Mark viewed
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Podcast (audio) ────────────────────────────────────────────────────────

function PodcastCard({
  asset,
  progress,
  state,
  onSetState,
  onResume,
}: CommonProps & { asset: PodcastAsset }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [rate, setRate] = useState(1);
  const lastPersistedSec = useRef(0);

  // Apply resume position once the audio element is ready.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const resume = progress?.resumePositions?.podcast;
    const onLoaded = () => {
      if (resume && resume > 0 && resume < (el.duration || Infinity)) {
        el.currentTime = resume;
      }
    };
    el.addEventListener("loadedmetadata", onLoaded);
    return () => el.removeEventListener("loadedmetadata", onLoaded);
  }, [progress]);

  const handleTimeUpdate = () => {
    const el = audioRef.current;
    if (!el) return;
    const sec = el.currentTime;
    // Persist resume every ~10 seconds to keep localStorage churn low.
    if (Math.abs(sec - lastPersistedSec.current) > 10) {
      onResume(asset.kind, sec);
      lastPersistedSec.current = sec;
    }
    if (state !== "viewed" && el.duration && sec / el.duration >= 0.75) {
      onSetState(asset.kind, "viewed");
    }
  };

  const handleRateClick = (r: number) => {
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  };

  return (
    <div>
      <p className="text-sm text-slate-700 mb-2">
        Listen on the way to a call. Resume picks up where you left off.
      </p>
      <div className="text-xs text-slate-500 mb-4">⏱ {asset.estimate}</div>

      <audio
        ref={audioRef}
        src={asset.url}
        controls
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => state === "not-viewed" && onSetState(asset.kind, "in-progress")}
        className="w-full mb-3"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 mr-1">Speed:</span>
        {[1, 1.25, 1.5, 2].map((r) => (
          <button
            key={r}
            onClick={() => handleRateClick(r)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
              rate === r
                ? "bg-[#1F3A5F] text-white border-[#1F3A5F]"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
            }`}
          >
            {r}x
          </button>
        ))}
        <a
          href={asset.url}
          download
          className="ml-auto px-3 py-1 text-xs font-semibold border border-slate-300 text-slate-700 rounded-md hover:border-slate-400 transition-colors"
        >
          Download MP3
        </a>
      </div>
    </div>
  );
}

// ─── Presentation (video or slides) ─────────────────────────────────────────

function PresentationCard({
  asset,
  progress,
  state,
  onSetState,
  onResume,
}: CommonProps & { asset: PresentationAsset }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastPersistedSec = useRef(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || asset.mode !== "video") return;
    const resume = progress?.resumePositions?.presentation;
    const onLoaded = () => {
      if (resume && resume > 0 && resume < (el.duration || Infinity)) {
        el.currentTime = resume;
      }
    };
    el.addEventListener("loadedmetadata", onLoaded);
    return () => el.removeEventListener("loadedmetadata", onLoaded);
  }, [progress, asset.mode]);

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    const sec = el.currentTime;
    if (Math.abs(sec - lastPersistedSec.current) > 10) {
      onResume(asset.kind, sec);
      lastPersistedSec.current = sec;
    }
    if (state !== "viewed" && el.duration && sec / el.duration >= 0.75) {
      onSetState(asset.kind, "viewed");
    }
  };

  return (
    <div>
      <p className="text-sm text-slate-700 mb-2">
        {asset.mode === "video"
          ? "Watch the presentation. Resume position is saved automatically."
          : "Click through the slides at your own pace."}
      </p>
      <div className="text-xs text-slate-500 mb-4">⏱ {asset.estimate}</div>

      {asset.mode === "video" ? (
        <video
          ref={videoRef}
          src={asset.url}
          controls
          onTimeUpdate={handleTimeUpdate}
          onPlay={() =>
            state === "not-viewed" && onSetState(asset.kind, "in-progress")
          }
          className="w-full rounded-lg bg-black"
        />
      ) : (
        <iframe
          src={asset.url}
          title="Presentation slides"
          className="w-full aspect-video rounded-lg border border-slate-200"
          allowFullScreen
        />
      )}

      {state !== "viewed" && (
        <button
          onClick={() => onSetState(asset.kind, "viewed")}
          className="mt-3 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Mark viewed
        </button>
      )}
    </div>
  );
}

// ─── Quiz CTA ────────────────────────────────────────────────────────────────

function QuizCard({
  sessionId,
  asset,
  progress,
}: CommonProps & { asset: QuizAsset }) {
  const passed = progress?.quizAttempts.some((a) => a.passed) ?? false;
  const attempts = progress?.quizAttempts.length ?? 0;
  const bestScore = passed
    ? Math.max(...progress!.quizAttempts.map((a) => a.score))
    : null;

  return (
    <div>
      <p className="text-sm text-slate-700 mb-1">
        {asset.questions.length} questions · ~10 min · {asset.passMark}% to
        pass · Unlimited retries
      </p>
      <p className="text-xs text-slate-500 italic mb-4">
        Recommended: complete the four assets above first.
      </p>
      {passed && (
        <div className="mb-3 px-3 py-2 bg-[#3C8055]/10 border border-[#3C8055]/30 rounded-lg text-sm text-[#3C8055] font-medium">
          ✓ Passed with {bestScore}% on attempt {attempts}
        </div>
      )}
      <Link
        href={`/sessions/${sessionId}/quiz`}
        className="inline-block px-5 py-2.5 text-sm font-bold bg-[#D49A30] text-white rounded-lg hover:bg-[#bb8527] transition-colors"
      >
        {passed ? "Review quiz →" : attempts > 0 ? "Try again →" : "Take quiz →"}
      </Link>
    </div>
  );
}

// ─── Public dispatcher ──────────────────────────────────────────────────────

export default function AssetCard(props: CommonProps) {
  const { asset, state } = props;

  let inner: React.ReactNode;
  switch (asset.kind) {
    case "debrief":
    case "toolkit":
      inner = <PdfCard {...props} asset={asset} />;
      break;
    case "podcast":
      inner = <PodcastCard {...props} asset={asset} />;
      break;
    case "presentation":
      inner = <PresentationCard {...props} asset={asset} />;
      break;
    case "quiz":
      inner = <QuizCard {...props} asset={asset} />;
      break;
  }

  return (
    <AssetShell kind={asset.kind} state={state}>
      {inner}
    </AssetShell>
  );
}
