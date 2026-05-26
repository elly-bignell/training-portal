// data/management.ts
//
// Management area module catalogue. Lives at /sessions/management — admin-
// only, gated by the master password (same PasswordGate.requireMaster auth
// pattern used by /admin and friends). This is an information store, not a
// testing ground: no quizzes, no progress tracking, no "Mark Viewed".
//
// Each module is a single thinking-out-loud document captured from a
// conversation about company direction. Reps don't see this. Only the
// admin password unlocks it.

export interface ManagementModule {
  /** URL slug — /sessions/management/[id]. */
  id: string;
  /** ISO date the discussion / note was captured. */
  date: string;
  /** Short heading shown on the card + at the top of the detail page. */
  title: string;
  /** One-or-two sentence summary, shown on the card. */
  summary: string;
  /** Bold one-line "thesis" pulled from the doc — shown in the gold
   *  callout block on the detail page so the core idea hits first. */
  coreThesis: string;
  /** Path under /public — served directly. */
  pdfUrl: string;
  /** Path under /public — served directly. */
  docxUrl: string;
  /** Optional Drive intro-video file ID. Renders as a Drive iframe embed
   *  when present; omitted modules just show the PDF + downloads. */
  introVideoDriveId?: string;
}

export const managementModules: ManagementModule[] = [
  {
    id: "ai-business",
    date: "2026-05-25",
    title: "We Are An AI Business",
    summary:
      "Positioning, infrastructure, and the asymmetric window. Why Marketing Sweet is no longer an agency that uses AI — it's an AI business — and what that means for data, scripts, and how every team member operates.",
    coreThesis:
      "Marketing Sweet is not an agency that uses AI. From this point forward, Marketing Sweet is an AI business. The way we operate — data, scripts, vertical execution — needs to reflect that.",
    pdfUrl: "/management/ai-business.pdf",
    docxUrl: "/management/ai-business.docx",
    introVideoDriveId: "1rQ_EONrXQtQYG_xbRt66nJnwbkvp5ghq",
  },
  {
    id: "ai-training",
    date: "2026-05-25",
    title: "How We're Using AI for Training",
    summary:
      "Current workflow plus the Marketing Sweet University vision — indexing lessons across sessions rather than per-session, virtual Corie for new hires, and the academic-pressure thesis as a pre-screening filter.",
    coreThesis:
      "Index the lessons, not the sessions. Build the chapters. Let the academic pressure pre-condition the talent pool — the job becomes the prize, not the starting point.",
    pdfUrl: "/management/ai-training.pdf",
    docxUrl: "/management/ai-training.docx",
    introVideoDriveId: "1qNOsvPdKPT5728xu6jvtnNyXbbYRdhty",
  },
];

export function getManagementModuleById(
  id: string
): ManagementModule | undefined {
  return managementModules.find((m) => m.id === id);
}
