// components/sessions/SessionCard.tsx
//
// Anatomy from the brief, exactly:
//   – Status pill (NEW / IN PROGRESS / COMPLETE / NOT STARTED) top-right
//   – Session number + date (small, secondary)
//   – Title (large navy bold)
//   – One-sentence summary
//   – Total time (clock + estimate)
//   – Asset progress dots (5)
//   – Quiz score (if attempted)
//   – Primary CTA (Open / Resume / Review) — entire card click target

"use client";

import Link from "next/link";
import {
  Session,
  SessionProgress,
  SessionStatus,
} from "@/types/sessions";
import {
  assetsViewedCount,
  bestQuizScore,
  isNewForRep,
} from "@/hooks/useSessionsProgress";

interface Props {
  session: Session;
  progress: SessionProgress | undefined;
  status: SessionStatus;
}

const STATUS_PILL: Record<
  SessionStatus | "new",
  { label: string; bg: string; fg: string }
> = {
  "not-started": { label: "NOT STARTED", bg: "#E5E5E5", fg: "#404040" },
  "in-progress": { label: "IN PROGRESS", bg: "#1F3A5F", fg: "#FFFFFF" },
  completed: { label: "COMPLETE", bg: "#3C8055", fg: "#FFFFFF" },
  new: { label: "NEW", bg: "#D49A30", fg: "#FFFFFF" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

export default function SessionCard({ session, progress, status }: Props) {
  const isNew = isNewForRep(session, progress);
  const pill = isNew ? STATUS_PILL.new : STATUS_PILL[status];
  const viewed = assetsViewedCount(progress, session.assets.length);
  const score = bestQuizScore(progress);

  const cta =
    status === "completed"
      ? "Review →"
      : status === "in-progress"
      ? "Resume →"
      : "Open →";

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group relative block bg-white rounded-2xl border border-slate-200 hover:border-[#1F3A5F]/40 hover:shadow-md transition-all p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A5F] focus-visible:ring-offset-2"
    >
      {/* Status pill */}
      <span
        className="absolute top-4 right-4 text-[10px] font-bold tracking-wider px-2 py-1 rounded-full"
        style={{ backgroundColor: pill.bg, color: pill.fg }}
      >
        {pill.label}
      </span>

      {/* Optional gold "card banner" pill — for sessions we want to flag
          in the grid without hoisting them out as featured (e.g. SPIN TO WIN). */}
      {session.cardBanner && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D49A30] text-[#1F3A5F] rounded text-[10px] font-bold tracking-wider mb-2">
          ★ {session.cardBanner}
        </div>
      )}

      {/* Session # · date */}
      <div className="text-xs text-slate-400 font-medium mb-2">
        #{session.number} · {formatDate(session.date)}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-[#1F3A5F] leading-tight mb-2 pr-16">
        {session.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
        {session.summary}
      </p>

      {/* Time + asset dots */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span className="inline-flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M12 7v5l3 2" />
          </svg>
          {session.totalTime}
        </span>
        <span
          className="flex items-center gap-1"
          aria-label={`${viewed} of ${session.assets.length} assets viewed`}
        >
          {Array.from({ length: session.assets.length }).map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: i < viewed ? "#1F3A5F" : "#E5E5E5",
              }}
            />
          ))}
        </span>
      </div>

      {/* Quiz score */}
      <div className="text-xs text-slate-500 mb-4 min-h-[1rem]">
        {score !== null ? (
          <>
            Quiz: <span className="font-medium text-slate-700">{score}%</span>{" "}
            on {progress!.quizAttempts.length === 1
              ? "1st"
              : progress!.quizAttempts.length === 2
              ? "2nd"
              : progress!.quizAttempts.length === 3
              ? "3rd"
              : `${progress!.quizAttempts.length}th`}{" "}
            attempt
          </>
        ) : (
          <span className="text-slate-400">Quiz: not yet attempted</span>
        )}
      </div>

      {/* CTA */}
      <div className="text-sm font-semibold text-[#1F3A5F] group-hover:text-[#D49A30] transition-colors">
        {cta}
      </div>
    </Link>
  );
}
