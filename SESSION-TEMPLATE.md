# Session publish template

Fill this in when you're publishing a new training session. Then drop your
three source files into the `/uploads/` folder in the repo root, then paste
this prompt into Cowork:

> **Publish the training session I've queued in SESSION-TEMPLATE.md. Files
> are in the uploads folder. Show me the diff first — I'll push to git
> myself once I've reviewed it.**

Claude will convert the debrief docx to PDF, place both PDFs in the right
folder, add the session entry to `data/sessions.ts`, wire the quiz
questions in, extend `LEAD_GEN_SESSION_MAP` if the audience includes Lead
Gen / Customer Service, and typecheck. When it's done, you review the
diff, then run the git commands Claude gives you to push.

---

## Session details

- **Session number (closer view):**  <!-- e.g. 42 — the next number in the sales training sequence -->
- **Title:**  <!-- exact title from the source doc, e.g. "Cement, Then Negotiate." -->
- **Date:**  <!-- YYYY-MM-DD, e.g. 2026-07-13 -->
- **Director:** Corie Dawson  <!-- almost always Corie; change if it's someone else -->
- **Intro video URL:**  <!-- full YouTube link, e.g. https://www.youtube.com/watch?v=abc123 -->
- **Audience:**  <!-- pick one option from the list below -->

### Audience options — pick ONE

Copy the exact label into the Audience field above.

| Label | Who sees it |
|---|---|
| `ALL TEAMS` | Sales + Lead Gen + Customer Service. The default for most sessions. |
| `SALES ONLY` | Closers only (Lucas, Dylan, Felipe). Advanced closing content that isn't relevant to Lead Gen. |
| `SALES + LG (CS HIDDEN)` | Closers + Lead Gen but NOT Customer Service. Sales-team plumbing like Competition Strategy. |
| `CS ORIGIN` | Session Corie ran for the CS team but also useful for Sales / LG. Tagged as CS origin, everyone can see it. |

If you're not sure, `ALL TEAMS` is almost always right for a standard weekly sales training.

---

## Source files

Drop these into the `/uploads/` folder in the repo root **before** running the prompt.

- **debrief.docx** — the session's debrief document (long-form written summary)
- **toolkit.pdf** — the 1-page toolkit reference card
- **quiz.docx** — the quiz questions with the answer key at the bottom

Filenames can be anything as long as it's obvious which is which. The
convention we use is:

- `Sales Training [N] - [Day DD Month YYYY].docx` — debrief
- `Sales Toolkit [N] - [Day DD Month YYYY].pdf` — toolkit
- `Sales Training [N] - [Day DD Month YYYY] - Quiz.docx` — quiz

---

## Optional overrides

Leave blank to use the defaults.

- **Total time estimate:**  <!-- e.g. "~40 min" — Claude uses "~40 min" by default -->
- **Card banner:**  <!-- e.g. "SPIN TO WIN" — only fill in if this session gets a special gold pill on its card. Rare. -->

---

## What "publish" actually does

Claude will:

1. Read this template file
2. Read the three uploaded files
3. Convert the debrief docx to PDF using LibreOffice
4. Place both PDFs in `public/sample-content/session-[N]-[slug]/`
5. Add a new session entry near the top of `data/sessions.ts` with all the fields
6. Read the quiz docx, parse the questions + answers + rationales, and wire them in with a 100% pass mark
7. Extend `LEAD_GEN_SESSION_MAP` with the next available LG number (if the audience includes LG/CS)
8. Run `npx tsc --noEmit` to typecheck
9. Give you the exact git commands to add, commit, and push

You review the diff (visible in Cowork), then run the push commands. Vercel
deploys within about 90 seconds.

---

## Reset for next time

After a successful publish, come back and clear this template ready for
the next session. Copy the blank version from git if you need a fresh
start — just re-run `git checkout SESSION-TEMPLATE.md` from the terminal
and it'll come back to the pristine version.
