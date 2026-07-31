// lib/parse-debrief-docx.ts
//
// Extracts the summary + key takeaway fields from a Corie-format debrief
// docx. Used by /api/admin/sessions (form submit) to auto-populate the
// Summary and KeyTakeaway columns of the Airtable Sessions row, so the
// colleague never has to write prose herself.
//
// Corie's debriefs follow a very consistent structure:
//
//   Sales Training — Session NN         ← header block
//   [Title]                             ← header block
//   [Subtitle / secondary line]         ← header block
//   Marketing Sweet · Sales Training    ← brand strip (ignore)
//
//   WHAT THIS SESSION IS  [summary paragraph]   ← THE SUMMARY
//
//   1. [section heading]                ← body sections start
//   [paragraphs...]
//   "[bold-quoted key line]"            ← candidates for key takeaway
//   2. [section heading]
//   ...
//
//   13. [final section heading]
//   Today's challenge                    ← THE KEY TAKEAWAY seed
//   [closing paragraph]
//   Action items — this week            ← ignore (action items)
//   1. ...
//   2. ...
//
// The parser is best-effort: if it can't find these landmarks, it returns
// empty strings and the form UI shows blanks for the colleague to fill.
// It never throws — auto-extraction is a UX aid, not a hard requirement.

import mammoth from "mammoth";

export interface ExtractedDebrief {
  /** First paragraph following "WHAT THIS SESSION IS" — the session thesis. */
  summary: string;
  /** Synthesized from "Today's challenge" section + bold-quoted key lines. */
  keyTakeaway: string;
  /** The title line from the header block (line 2), if we could find it. */
  title: string;
  /** Any warnings the parser wants to surface to the colleague. */
  warnings: string[];
}

/** Best-effort extraction. Never throws — returns empty fields on failure
 *  so the form can still submit with the colleague filling in blanks. */
export async function parseDebriefDocx(
  buffer: Buffer
): Promise<ExtractedDebrief> {
  const warnings: string[] = [];
  const empty: ExtractedDebrief = {
    summary: "",
    keyTakeaway: "",
    title: "",
    warnings,
  };

  let rawText: string;
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    rawText = value;
  } catch (err) {
    warnings.push(`Couldn't read the debrief docx: ${String(err)}`);
    return empty;
  }

  const paragraphs = rawText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length < 5) {
    warnings.push(
      "Debrief docx has fewer than 5 paragraphs — is this the right file?"
    );
    return empty;
  }

  // ─── Title (line 2 of header block, typically) ───────────────────────
  // Skip the "Sales Training — Session NN" line if present.
  let title = "";
  for (let i = 0; i < Math.min(4, paragraphs.length); i++) {
    const p = paragraphs[i];
    if (/^sales training/i.test(p) || /^team training/i.test(p)) continue;
    if (/marketing sweet/i.test(p)) continue;
    if (/^what this session is/i.test(p)) break;
    // First non-header-boilerplate line = title
    title = p;
    break;
  }

  // ─── Summary — the paragraph that begins with "WHAT THIS SESSION IS" ─
  // Mammoth typically renders it as one paragraph like:
  //   "WHAT THIS SESSION IS  The question every rep will be asked..."
  // The bit after the label is the summary. If the label is on its own
  // line, take the next non-empty paragraph.
  let summary = "";
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const match = p.match(/^WHAT THIS SESSION IS\s*(.*)$/i);
    if (match) {
      const rest = match[1].trim();
      if (rest.length > 30) {
        // Inline case — the summary follows the label on the same paragraph
        summary = rest;
      } else {
        // Label on its own line — grab the next paragraph
        summary = paragraphs[i + 1] ?? "";
      }
      break;
    }
  }

  if (!summary) {
    warnings.push(
      "Couldn't find 'WHAT THIS SESSION IS' section — Summary will be blank."
    );
  }

  // ─── Key takeaway — bias toward the closing thoughts ────────────────
  // Priority order:
  //   1. Content of a paragraph that immediately follows "Today's challenge"
  //   2. Concatenation of bold-quoted lines (starts and ends with " and is
  //      relatively short — Corie's callouts have this shape)
  //   3. The last full body paragraph before the "Action items" list
  let keyTakeaway = "";

  // Try (1): Today's challenge (may be prefixed with a section number like "13.")
  for (let i = 0; i < paragraphs.length; i++) {
    if (/(^|\s)today['’]?s challenge\b/i.test(paragraphs[i])) {
      // Take the next 1-2 paragraphs, stopping if we hit "Action items"
      const collected: string[] = [];
      for (let j = i + 1; j < paragraphs.length; j++) {
        if (/^action items/i.test(paragraphs[j])) break;
        collected.push(paragraphs[j]);
        if (collected.join(" ").length > 400) break;
      }
      keyTakeaway = collected.join(" ").trim();
      break;
    }
  }

  // Try (2): last significant body paragraph before Action items
  if (!keyTakeaway) {
    let actionIdx = paragraphs.findIndex((p) => /^action items/i.test(p));
    if (actionIdx === -1) actionIdx = paragraphs.length;
    for (let i = actionIdx - 1; i >= 0; i--) {
      const p = paragraphs[i];
      if (p.length > 120 && !p.match(/^[\d.]+\s/)) {
        keyTakeaway = p;
        break;
      }
    }
  }

  if (!keyTakeaway) {
    warnings.push(
      "Couldn't derive a KeyTakeaway from 'Today's challenge' or closing paragraphs — will be blank."
    );
  }

  return {
    summary: summary.slice(0, 800), // Cap so long paragraphs don't blow up UI
    keyTakeaway: keyTakeaway.slice(0, 1000),
    title,
    warnings,
  };
}
