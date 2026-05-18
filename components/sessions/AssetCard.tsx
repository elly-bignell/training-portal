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
  IntroAsset,
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
  /** 1-based position of this asset in the session's asset list. */
  position: number;
  onSetState: (kind: AssetKind, state: AssetState) => void;
  onResume: (kind: AssetKind, seconds: number) => void;
}

const KIND_LABEL: Record<AssetKind, string> = {
  debrief: "THE DEBRIEF (PDF)",
  toolkit: "THE TOOLKIT (PDF)",
  intro: "INTRODUCTORY VIDEO",
  podcast: "THE PODCAST",
  presentation: "THE PRESENTATION",
  quiz: "THE QUIZ",
};

// Per-asset instructions shown above the controls. Tells the rep what
// "complete" looks like for this asset so they know when to mark it viewed.
const KIND_INSTRUCTIONS: Record<AssetKind, string> = {
  debrief:
    "Read the debrief end-to-end, then hit Mark Viewed below to record that you've completed it.",
  toolkit:
    "Skim the toolkit so you know what's on it — pin it on the wall if you'd like. Hit Mark Viewed once you've reviewed it.",
  intro:
    "Watch the short introductory video to orient yourself for this session, then hit Mark Viewed.",
  podcast:
    "Listen all the way through (on the way to a call works fine). Hit Mark Viewed once it's done.",
  presentation:
    "Watch the recorded session in full. Hit Mark Viewed once you've finished watching.",
  quiz:
    "Once every asset above is marked viewed, take the quiz. You need to pass before the session is marked complete.",
};

// Non-quiz assets that gate the quiz. The quiz can only be opened once
// every one of these is in the "viewed" state.
const QUIZ_PREREQUISITES: AssetKind[] = [
  "debrief",
  "toolkit",
  "intro",
  "podcast",
  "presentation",
];

// Returns the Drive file ID if `url` is a Google Drive link, else null.
function driveFileId(url: string): string | null {
  if (!url || !url.includes("drive.google.com")) return null;
  const m = url.match(/\/file\/d\/([^/?#]+)/);
  return m ? m[1] : null;
}

/** Drive iframe embed used for both podcast (audio) and presentation (video). */
function DriveEmbed({
  fileId,
  kind,
  state,
  onSetState,
}: {
  fileId: string;
  kind: AssetKind;
  state: AssetState;
  onSetState: (kind: AssetKind, state: AssetState) => void;
}) {
  const isAudio = kind === "podcast";
  return (
    <div>
      <iframe
        src={`https://drive.google.com/file/d/${fileId}/preview`}
        title={`${kind} embed`}
        className={
          isAudio
            ? "w-full rounded-lg border border-slate-200 h-[120px] bg-slate-50"
            : "w-full aspect-video rounded-lg border border-slate-200 bg-black"
        }
        allow="autoplay; encrypted-media"
        allowFullScreen
        onLoad={() =>
          state === "not-viewed" && onSetState(kind, "in-progress")
        }
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={`https://drive.google.com/file/d/${fileId}/view`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-700 rounded-md hover:border-slate-400 transition-colors"
        >
          Open in Drive
        </a>
        {state !== "viewed" && (
          <button
            onClick={() => onSetState(kind, "viewed")}
            className="px-4 py-2 text-sm font-bold bg-[#3C8055] text-white rounded-md hover:bg-[#2d6342] transition-colors shadow-sm"
          >
            ✓ Mark viewed
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">
          Drive player · sign in with your Marketing Sweet account
        </span>
      </div>
    </div>
  );
}

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
  position,
  children,
}: {
  kind: AssetKind;
  state: AssetState;
  position: number;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`asset-${kind}`}
      className="border-t border-slate-200 pt-6 mt-6 first:border-0 first:pt-0 first:mt-0 scroll-mt-24"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold tracking-wider text-slate-500">
          ASSET {position} — {KIND_LABEL[kind]}
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
      <div className="mb-3 px-3 py-2 bg-[#1F3A5F]/5 border-l-2 border-[#1F3A5F] rounded text-xs text-slate-700">
        <span className="font-semibold">How to complete: </span>
        {KIND_INSTRUCTIONS[asset.kind]}
      </div>
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
            className="px-4 py-2 text-sm font-bold bg-[#3C8055] text-white rounded-lg hover:bg-[#2d6342] transition-colors shadow-sm"
          >
            ✓ Mark viewed
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
  const driveId = driveFileId(asset.url);

  // Apply resume position once the audio element is ready. Runs unconditionally
  // (rules-of-hooks); the body bails out early when there is no audio element
  // to operate on, e.g. when we render the Drive iframe instead.
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

  // Drive-hosted: render iframe (no native controls available).
  if (driveId) {
    return (
      <div>
        <p className="text-sm text-slate-700 mb-2">
          Listen on the way to a call. Speed and resume are controlled in
          Drive&apos;s own player.
        </p>
        <div className="text-xs text-slate-500 mb-4">⏱ {asset.estimate}</div>
        <DriveEmbed
          fileId={driveId}
          kind="podcast"
          state={state}
          onSetState={onSetState}
        />
      </div>
    );
  }

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
  const driveId = driveFileId(asset.url);

  // Apply resume position once the video element is ready. Always called
  // (rules-of-hooks); body bails out early when there's no video element.
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

  // Drive-hosted: render iframe.
  if (driveId) {
    return (
      <div>
        <p className="text-sm text-slate-700 mb-2">
          Watch the recorded session. Drive&apos;s player handles playback,
          captions, and full-screen.
        </p>
        <div className="text-xs text-slate-500 mb-4">⏱ {asset.estimate}</div>
        <DriveEmbed
          fileId={driveId}
          kind="presentation"
          state={state}
          onSetState={onSetState}
        />
      </div>
    );
  }

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
          className="mt-3 px-4 py-2 text-sm font-bold bg-[#3C8055] text-white rounded-lg hover:bg-[#2d6342] transition-colors shadow-sm"
        >
          ✓ Mark viewed
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

  // Quiz lockout: every prerequisite asset must be in "viewed" state.
  // We still allow passed-quiz reviews to bypass (they've already done it).
  const missingPrereqs = QUIZ_PREREQUISITES.filter(
    (k) => progress?.assetStates[k] !== "viewed"
  );
  const unlocked = missingPrereqs.length === 0;
  const showLocked = !unlocked && !passed;

  return (
    <div>
      <p className="text-sm text-slate-700 mb-1">
        {asset.questions.length} questions · ~10 min · {asset.passMark}% to
        pass · Unlimited retries
      </p>
      <div className="mb-3 px-3 py-2 bg-[#1F3A5F]/5 border-l-2 border-[#1F3A5F] rounded text-xs text-slate-700">
        <span className="font-semibold">How to complete: </span>
        {KIND_INSTRUCTIONS.quiz}
      </div>
      <p className="text-xs text-slate-500 italic mb-4">
        Pass mark is calculated on the multiple-choice questions only. Short
        answers are recorded for trainer review.
      </p>
      {passed && (
        <div className="mb-3 px-3 py-2 bg-[#3C8055]/10 border border-[#3C8055]/30 rounded-lg text-sm text-[#3C8055] font-medium">
          ✓ Passed with {bestScore}% on attempt {attempts}
        </div>
      )}
      {showLocked && (
        <div className="mb-3 px-4 py-3 bg-[#D49A30]/10 border border-[#D49A30]/40 rounded-lg text-sm text-slate-700">
          <div className="font-bold text-[#a87520] mb-1">
            🔒 Quiz locked
          </div>
          Mark every asset above as viewed first. Still to do:{" "}
          <span className="font-semibold">
            {missingPrereqs
              .map((k) => KIND_LABEL[k].replace(/\s*\(PDF\)/, ""))
              .join(", ")}
          </span>
          .
        </div>
      )}
      {showLocked ? (
        <button
          disabled
          className="inline-block px-5 py-2.5 text-sm font-bold bg-slate-300 text-slate-500 rounded-lg cursor-not-allowed"
        >
          🔒 Take quiz
        </button>
      ) : (
        <Link
          href={`/sessions/${sessionId}/quiz`}
          className="inline-block px-5 py-2.5 text-sm font-bold bg-[#D49A30] text-white rounded-lg hover:bg-[#bb8527] transition-colors"
        >
          {passed
            ? "Review quiz →"
            : attempts > 0
            ? "Try again →"
            : "Take quiz →"}
        </Link>
      )}
    </div>
  );
}

// ─── Intro video ────────────────────────────────────────────────────────────

function IntroCard({
  asset,
  state,
  onSetState,
}: CommonProps & { asset: IntroAsset }) {
  const driveId = driveFileId(asset.url);
  return (
    <div>
      <p className="text-sm text-slate-700 mb-2">
        A short orientation video — watch this before the podcast and
        presentation to get the most out of the session.
      </p>
      <div className="text-xs text-slate-500 mb-4">⏱ {asset.estimate}</div>
      {driveId ? (
        <DriveEmbed
          fileId={driveId}
          kind="intro"
          state={state}
          onSetState={onSetState}
        />
      ) : (
        <div className="text-sm text-slate-500 italic">
          Intro video not available — please contact your admin.
        </div>
      )}
    </div>
  );
}

// ─── Public dispatcher ──────────────────────────────────────────────────────

export default function AssetCard(props: CommonProps) {
  const { asset, state, position } = props;

  let inner: React.ReactNode;
  switch (asset.kind) {
    case "debrief":
    case "toolkit":
      inner = <PdfCard {...props} asset={asset} />;
      break;
    case "intro":
      inner = <IntroCard {...props} asset={asset} />;
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
    <AssetShell kind={asset.kind} state={state} position={position}>
      {inner}
    </AssetShell>
  );
}
