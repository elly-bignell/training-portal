// lib/docx-to-pdf.ts
//
// DEPRECATED. This module used puppeteer + @sparticuz/chromium to convert
// a debrief DOCX into a PDF server-side. Turned out to be too flaky on
// Vercel serverless (deployment size, cold-start timeouts, chromium
// version drift), so the flow was reverted to accepting the debrief PDF
// directly on the form. Corie's team now generates the PDF for us.
//
// Left as a stub so any lingering imports fail with a clear message
// rather than silently pulling the whole chromium chain back in. File
// can be removed in a later cleanup pass — keeping it around briefly so
// git blame keeps the context of why the puppeteer path was abandoned.

export async function convertDebriefDocxToPdf(): Promise<never> {
  throw new Error(
    "convertDebriefDocxToPdf has been removed — colleague uploads the debrief PDF directly."
  );
}
