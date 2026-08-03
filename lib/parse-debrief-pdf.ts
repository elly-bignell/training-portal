// lib/parse-debrief-pdf.ts
//
// Same job as parse-debrief-docx.ts but for the PDF format Corie's team
// now sends directly (so the colleague never has to convert anything).
// Uses pdf-parse to pull raw text out of the PDF, then applies the same
// landmark-finding as the docx parser: "WHAT THIS SESSION IS" for
// Summary, "Today's challenge" for KeyTakeaway.
//
// pdf-parse is pure Node (no chromium), tiny, reliable on Vercel — the
// opposite tradeoff to the puppeteer path.

// pdf-parse is CommonJS with a default export and no built-in types.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> = require("pdf-parse");

export interface ExtractedDebrief {
  summary: string;
  keyTakeaway: string;
  title: string;
  warnings: string[];
}

export async function parseDebriefPdf(
  buffer: Buffer
): Promise<ExtractedDebrief> {
  const warnings: string[] = [];
  const empty: ExtractedDebrief = {
    summary: "",
    keyTakeaway: "",
    title: "",
    warnings,
  };

  let text: string;
  try {
    const parsed = await pdfParse(buffer);
    text = parsed.text ?? "";
  } catch (err) {
    warnings.push(`Couldn't read the debrief PDF: ${String(err)}`);
    return empty;
  }

  // pdf-parse concatenates page text with \n\n between pages and \n
  // between lines. Split into paragraphs (blank-line separated) so the
  // landmark detection mirrors the docx parser's behaviour.
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length < 3) {
    warnings.push(
      "Debrief PDF has too few paragraphs to auto-extract — is the file the right one?"
    );
    return empty;
  }

  // ─── Title (header block, before "WHAT THIS SESSION IS") ─────────────
  let title = "";
  for (let i = 0; i < Math.min(6, paragraphs.length); i++) {
    const p = paragraphs[i];
    if (/^sales training/i.test(p) || /^team training/i.test(p)) continue;
    if (/marketing sweet/i.test(p)) continue;
    if (/^what this session is/i.test(p)) break;
    title = p;
    break;
  }

  // ─── Summary — the paragraph after "WHAT THIS SESSION IS" ────────────
  let summary = "";
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const match = p.match(/^WHAT THIS SESSION IS\s*(.*)$/i);
    if (match) {
      const rest = match[1].trim();
      if (rest.length > 30) {
        summary = rest;
      } else {
        summary = paragraphs[i + 1] ?? "";
      }
      break;
    }
    // Sometimes the label + summary land on the same line without the
    // exact ALL-CAPS split; fall back to a looser match.
    const looseMatch = p.match(/what this session is[^a-z]*(.*)/i);
    if (looseMatch && looseMatch[1].length > 40) {
      summary = looseMatch[1].trim();
      break;
    }
  }

  if (!summary) {
    warnings.push(
      "Couldn't find 'WHAT THIS SESSION IS' in the PDF — Summary will be blank."
    );
  }

  // ─── KeyTakeaway — the paragraph after "Today's challenge" ───────────
  let keyTakeaway = "";
  for (let i = 0; i < paragraphs.length; i++) {
    if (/(^|\s)today['’]?s challenge\b/i.test(paragraphs[i])) {
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

  // Fallback: last meaningful paragraph before "Action items"
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
      "Couldn't derive a KeyTakeaway from 'Today's challenge' — will be blank."
    );
  }

  return {
    summary: summary.slice(0, 800),
    keyTakeaway: keyTakeaway.slice(0, 1000),
    title,
    warnings,
  };
}
