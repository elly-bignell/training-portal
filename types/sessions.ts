// types/sessions.ts
//
// Types for the Sales Training Portal Sessions area (per the May 2026 product
// brief). Each Session has 5 fixed assets: debrief PDF, toolkit PDF, podcast
// audio, presentation video/slides, and a quiz.

export type AssetKind =
  | "debrief"
  | "toolkit"
  | "intro"
  | "podcast"
  | "presentation"
  | "quiz";

export interface BaseAsset {
  kind: AssetKind;
  /** Estimated time, e.g. "10 min read", "22 min", "9 questions". */
  estimate: string;
}

export interface PdfAsset extends BaseAsset {
  kind: "debrief" | "toolkit";
  /** URL to the PDF (placeholder paths point at /sample-content/...). */
  url: string;
  /** Optional thumbnail for the inline preview. */
  thumbnailUrl?: string;
}

export interface PodcastAsset extends BaseAsset {
  kind: "podcast";
  /** URL to the MP3 (placeholder paths point at /sample-content/...). */
  url: string;
  /** Total duration in seconds — drives the resume position UX. */
  durationSeconds: number;
}

export interface PresentationAsset extends BaseAsset {
  kind: "presentation";
  /** Either a video URL or a slide-deck embed URL. Render is decided by `mode`. */
  url: string;
  mode: "video" | "slides";
}

export interface IntroAsset extends BaseAsset {
  kind: "intro";
  /** Drive embed URL — short orientation video shown before the podcast. */
  url: string;
}

export interface QuizAsset extends BaseAsset {
  kind: "quiz";
  questions: QuizQuestion[];
  /** Pass mark, 0-100. Brief default: 80. */
  passMark: number;
}

export type Asset =
  | PdfAsset
  | PodcastAsset
  | PresentationAsset
  | IntroAsset
  | QuizAsset;

export type QuizQuestionType = "multiple-choice" | "short-answer";

interface BaseQuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  /** Topic tag — used in the "you missed two on X" feedback after a fail. */
  topic: string;
  rationale: string;
}

export interface MultipleChoiceQuestion extends BaseQuizQuestion {
  type: "multiple-choice";
  options: string[];
  /** Index into `options`. */
  correctAnswer: number;
}

export interface ShortAnswerQuestion extends BaseQuizQuestion {
  type: "short-answer";
  /** Reference answer used for keyword auto-grading and the post-quiz review. */
  modelAnswer: string;
  /** Lowercase keywords; question is "correct" if at least `keywordsRequired` appear. */
  keywords: string[];
  keywordsRequired: number;
  /** Soft minimum length. Brief uses ~150 characters. */
  softMinChars?: number;
}

export type QuizQuestion = MultipleChoiceQuestion | ShortAnswerQuestion;

export interface Session {
  /** Stable slug used in the URL: /sessions/[id]. */
  id: string;
  /** "01", "02" — used for the "#01" prefix on the card. */
  number: string;
  /** ISO date string. */
  date: string;
  title: string;
  /** One-sentence "thesis" of the session — shown on the card and detail hero. */
  summary: string;
  /** Longer key-takeaway pulled from the debrief; shown in the gold callout block. */
  keyTakeaway: string;
  director: string;
  /** Total time across all five assets, e.g. "~50 min". */
  totalTime: string;
  assets: Asset[];
  /** Featured one-off sessions render as a full-width banner above the
   *  normal grid on the home page and use a stripped-down detail layout
   *  (banner + video only — no learning path, no how-this-works copy). */
  featured?: boolean;
  /** Label shown above the title in the feature banner (home + detail). */
  bannerLabel?: string;
  /** When true, only the sales team (Lucas, Dylan, Felipe) sees this
   *  session. Customer Service reps and Lead Gen reps don't see it on
   *  their home page or in their continue-where-you-left-off card. */
  salesOnly?: boolean;
  /** Optional small gold pill rendered on the card AND at the top of the
   *  detail page hero. Different from `featured` — the session stays in
   *  the normal grid, it just gets a visual differentiator. Use for
   *  one-off themed sessions you want to flag without hoisting them out
   *  of the lineup (e.g. "SPIN TO WIN"). */
  cardBanner?: string;
  /** Which team(s) the session was originally run for. Drives the
   *  coloured pill on the card + detail hero ("SALES TRAINING" in blue,
   *  "CUSTOMER SERVICE TRAINING" in teal) and grouping on the sessions
   *  grid. A session may belong to one origin (most common) or both — a
   *  "both" session shows in whichever section matches the viewer's team.
   *  Legacy string form is still accepted for bundled entries and old
   *  Airtable rows. Renderers should use the `sessionOrigins()` helper. */
  origin?: "sales" | "customer-service" | ("sales" | "customer-service")[];
}

/** Normalise a Session.origin into an array of origin tags. Handles the
 *  legacy string form, the new array form, and the missing-value case
 *  (defaults to ["sales"] since most historical sessions were sales). */
export function sessionOrigins(
  s: Session
): ("sales" | "customer-service")[] {
  if (Array.isArray(s.origin)) {
    return s.origin.length > 0 ? s.origin : ["sales"];
  }
  if (s.origin) return [s.origin];
  return ["sales"];
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-rep progress shape stored in localStorage (key: sessionsProgress:<slug>).
// ─────────────────────────────────────────────────────────────────────────────

export type AssetState = "not-viewed" | "in-progress" | "viewed";

export interface QuizAttempt {
  /** ISO timestamp. */
  attemptedAt: string;
  /** 0-100. */
  score: number;
  passed: boolean;
  /** questionId → answer. For MC, number index; for short-answer, raw text. */
  answers: Record<string, number | string>;
}

export interface SessionProgress {
  /** ISO timestamp of the last interaction with this session. */
  lastViewedAt?: string;
  /** kind → state. Quiz state derives from quizAttempts.passed. */
  assetStates: Partial<Record<AssetKind, AssetState>>;
  /** kind → resume position in seconds, for podcast/presentation. */
  resumePositions: Partial<Record<AssetKind, number>>;
  quizAttempts: QuizAttempt[];
}

export interface RepSessionsProgress {
  /** Filter chip pref, persisted across visits per the brief. */
  filterPref?: SessionFilter;
  sessions: Record<string, SessionProgress>;
}

export type SessionFilter = "all" | "in-progress" | "completed" | "not-started";

export type SessionStatus = "not-started" | "in-progress" | "completed";
