// lib/docx-to-pdf.ts
//
// Server-only. Converts a debrief DOCX into a nicely-styled PDF so the
// colleague only ever uploads the DOCX (which is what Corie's team sends
// her). Two-step: mammoth extracts styled HTML from the DOCX, then a
// serverless-compatible headless Chromium renders that HTML to PDF.
//
// Runtime: Node (not Edge). Callers must set `export const runtime =
// "nodejs"` on any route that imports this module.
//
// Why puppeteer + @sparticuz/chromium: LibreOffice is too big to fit in
// a Vercel serverless function (>250MB). @sparticuz/chromium is a
// lambda-optimised chromium build sized for the deployment limit, and
// puppeteer-core drives it without shipping its own bundled browser.

import mammoth from "mammoth";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

/** Renders a Corie-format debrief DOCX to a PDF. Returns the PDF as a
 *  Buffer. Throws on conversion failure — caller should catch and fall
 *  back to attaching the raw DOCX so the record still lands. */
export async function convertDebriefDocxToPdf(
  docxBuffer: Buffer
): Promise<Buffer> {
  // 1. mammoth: DOCX → HTML. Includes headings, paragraphs, bold, italic,
  //    lists, tables — enough to render Corie's debrief faithfully.
  const { value: bodyHtml } = await mammoth.convertToHtml(
    { buffer: docxBuffer },
    {
      // Preserve headings + paragraph breaks so the PDF layout matches the
      // original. Mammoth's default style map handles most Word styles.
    }
  );

  // 2. Wrap in a print-friendly HTML document. Matches the Marketing
  //    Sweet training portal's visual language (deep navy accents,
  //    generous line-height, serif-ish body copy for reading comfort).
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 20mm 22mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #0f172a;
    margin: 0;
  }
  h1 { font-size: 20pt; color: #1F3A5F; margin: 0 0 0.5em; line-height: 1.2; }
  h2 { font-size: 14pt; color: #1F3A5F; margin: 1.4em 0 0.4em; }
  h3 { font-size: 12pt; color: #334155; margin: 1.2em 0 0.3em; }
  p { margin: 0 0 0.9em; }
  ul, ol { margin: 0 0 0.9em 1.4em; padding: 0; }
  li { margin: 0 0 0.35em; }
  strong { color: #0f172a; }
  em { color: #475569; }
  blockquote {
    border-left: 3px solid #C8A24B;
    padding: 0.3em 0 0.3em 1em;
    margin: 0.9em 0;
    color: #334155;
    font-style: italic;
  }
  table { border-collapse: collapse; width: 100%; margin: 0.9em 0; }
  td, th {
    border: 1px solid #e2e8f0;
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
  }
  th { background: #f8fafc; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  // 3. Launch headless chromium and render to PDF. @sparticuz/chromium
  //    v149 dropped the `headless`/`defaultViewport` exports; puppeteer
  //    defaults are fine for our use.
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    // "domcontentloaded" is the widest supported wait state on
    // puppeteer-core's setContent — we render pure inline HTML with no
    // external resources so this is plenty.
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "22mm", right: "22mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
