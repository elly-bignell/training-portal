// app/api/admin/sessions/route.ts
//
// POST /api/admin/sessions — colleague submits a new training session via
// the form at /admin/sessions/new. This route does the heavy lifting:
//
//   1. Auth check — the "x-auth-password" header must belong to a
//      Portal Users row with Role=Admin (same rule PasswordGate enforces).
//   2. Parse the uploaded quiz DOCX into structured questions.
//   3. Parse the uploaded debrief DOCX to auto-extract Summary + KeyTakeaway
//      (colleague can override via titleOverride/summaryOverride/etc).
//   4. Derive a slug from the title.
//   5. Create the Airtable Sessions record with metadata + QuizJSON.
//   6. Upload each attachment (debrief.pdf, toolkit.pdf, quiz.docx) to
//      the freshly-created record via Airtable's content API. Attachment
//      upload requires the record to exist first, so it's a 2-step
//      process; if uploads fail mid-way, the record still exists — the
//      colleague can retry by editing the row in Airtable directly.
//
// Response: { ok, slug?, warnings?, error? }

import { NextResponse } from "next/server";
import { parseQuizDocx } from "@/lib/parse-quiz-docx";
import { parseDebriefDocx } from "@/lib/parse-debrief-docx";
// parseDebriefPdf is loaded lazily below — pdf-parse depends on pdfjs
// and can throw at import time in serverless environments. Deferring the
// import means the auto-extract feature degrades gracefully to "blank
// Summary/KeyTakeaway" instead of taking down the whole submit route.

// Attachment uploads to Airtable can outrun the default 10s Vercel cap,
// so give the route a generous ceiling.
export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY = process.env.AIRTABLE_API_KEY!;
const TABLE = "Sessions";

// Field IDs from the Sessions table (captured during creation). Using IDs
// rather than names insulates us from a colleague renaming a column in
// the Airtable UI down the track.
const FIELDS = {
  Slug: "fldAF2DQIBkreVsDm",
  Title: "fldgVqFuqINZtGQ0u",
  Number: "fldWMlEmucHmUI3nn",
  LGNumber: "fld6dMX7YCz0ezKPX",
  SessionDate: "fldIBmzYjzMugWG4O",
  Summary: "fldMATsqjNYukgxjN",
  KeyTakeaway: "fldNcjr23aYmNZTYE",
  Director: "fldyvu1pFC3t4CafD",
  TotalTime: "fldYqDIKHPa3sFw3G",
  IntroYouTubeUrl: "fldu2iAR2Q2GENhNX",
  DebriefPDF: "fld4Q1OHAMoXrOCtD",
  ToolkitPDF: "fldvgEAW4psrrFOzr",
  QuizDocx: "fldGX2RbtVddx4TXF",
  QuizJSON: "fldADe0TutRRuNxj6",
  Audience: "fldZ1SH9MPzSRKcRP",
  Origin: "fld1v0EoxX1YrWEVP",
  Origins: "fldnJ9yjPAzKnbTTE",
  Published: "flde0tYTLiP7ax5GB",
  Notes: "flds7ijnLSFgsFUtu",
};

// ─── Auth ─────────────────────────────────────────────────────────────
async function isMasterAuth(password: string | null): Promise<boolean> {
  if (!password) return false;
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent("Portal Users")}?filterByFormula=({Active}=TRUE())`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return false;
    const json = (await res.json()) as {
      records: { fields: { Password?: string; Role?: string } }[];
    };
    return json.records.some(
      (r) => r.fields.Password === password && r.fields.Role === "Admin"
    );
  } catch {
    return false;
  }
}

// ─── Slug helper ──────────────────────────────────────────────────────
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// ─── Airtable attachment upload ───────────────────────────────────────
// Endpoint docs: https://airtable.com/developers/web/api/upload-attachment
// POST https://content.airtable.com/v0/{baseId}/{recordId}/{fieldIdOrName}/uploadAttachment
// Body: { contentType, file (base64), filename }
async function uploadAttachment(
  recordId: string,
  fieldId: string,
  file: File
): Promise<void> {
  const buf = Buffer.from(await file.arrayBuffer());
  const contentType =
    file.type ||
    (file.name.endsWith(".pdf")
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  await uploadAttachmentFromBuffer(recordId, fieldId, buf, file.name, contentType);
}

async function uploadAttachmentFromBuffer(
  recordId: string,
  fieldId: string,
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<void> {
  const base64 = buffer.toString("base64");
  const res = await fetch(
    `https://content.airtable.com/v0/${BASE_ID}/${recordId}/${fieldId}/uploadAttachment`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType, file: base64, filename }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Attachment upload failed (${res.status}): ${text.slice(0, 200)}`
    );
  }
}

// ─── POST handler ─────────────────────────────────────────────────────
export async function POST(req: Request) {
  // Top-level guard: any uncaught throw inside the handler bubbles up
  // to Vercel and returns HTML (the "<!DOCTYPE" the client can't parse).
  // Wrapping in try/catch ensures the form always sees a JSON response
  // it can render as a readable error, not a stack trace it can't.
  try {
    return await handlePost(req);
  } catch (err) {
    console.error("[/api/admin/sessions] uncaught:", err);
    return NextResponse.json(
      {
        ok: false,
        error: `Server error: ${String(err).slice(0, 300)}`,
      },
      { status: 500 }
    );
  }
}

async function handlePost(req: Request) {
  // Auth
  const password = req.headers.get("x-auth-password");
  const authed = await isMasterAuth(password);
  if (!authed) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized — admin password required." },
      { status: 401 }
    );
  }

  // Config
  if (!BASE_ID || !API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Server config missing (AIRTABLE_*)." },
      { status: 500 }
    );
  }

  // Parse form
  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Bad form data: ${err}` },
      { status: 400 }
    );
  }

  const debriefDocx = form.get("debriefDocx") as File | null;
  const debriefPdfUpload = form.get("debriefPdf") as File | null;
  const toolkitPdf = form.get("toolkitPdf") as File | null;
  const quizDocx = form.get("quizDocx") as File | null;
  const youtubeUrl = (form.get("youtubeUrl") as string) ?? "";
  const sessionDate = (form.get("sessionDate") as string) ?? "";
  const number = (form.get("number") as string) ?? "";
  const lgNumber = (form.get("lgNumber") as string) ?? "";
  const origin = (form.get("origin") as string) ?? "sales";
  // Prefer the new multi-select `origins` (JSON array) over the legacy
  // singular `origin`. Map internal codes → Airtable option names.
  const originsRaw = (form.get("origins") as string) ?? "";
  const originCodes: string[] = (() => {
    try {
      const parsed = JSON.parse(originsRaw);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
    } catch {
      /* fall through */
    }
    return [origin];
  })();
  const originsForAirtable: string[] = originCodes
    .map((c): string | null =>
      c === "sales"
        ? "Sales"
        : c === "customer-service"
        ? "Customer Service"
        : null
    )
    .filter((v): v is string => v !== null);
  const audienceRaw = (form.get("audience") as string) ?? "[]";
  const titleOverride = (form.get("titleOverride") as string) ?? "";
  const summaryOverride = (form.get("summaryOverride") as string) ?? "";
  const keyTakeawayOverride =
    (form.get("keyTakeawayOverride") as string) ?? "";

  if (!quizDocx) {
    return NextResponse.json(
      { ok: false, error: "Missing quiz DOCX — required to build the quiz." },
      { status: 400 }
    );
  }
  if (!toolkitPdf) {
    return NextResponse.json(
      { ok: false, error: "Missing toolkit PDF." },
      { status: 400 }
    );
  }
  if (!debriefPdfUpload) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing debrief PDF. If Corie's team only sent a DOCX, ask them to also export as PDF.",
      },
      { status: 400 }
    );
  }

  let audience: string[];
  try {
    audience = JSON.parse(audienceRaw) as string[];
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad audience list." },
      { status: 400 }
    );
  }
  if (audience.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Pick at least one audience team." },
      { status: 400 }
    );
  }

  const warnings: string[] = [];

  // ─── Auto-extract Summary + KeyTakeaway ─────────────────────────────
  // Prefer the DOCX (structured text is cleaner) when Corie sends it too;
  // otherwise parse the PDF which she'll always have. Same landmarks
  // either way — "WHAT THIS SESSION IS" + "Today's challenge".
  let extractedTitle = "";
  let extractedSummary = "";
  let extractedKeyTakeaway = "";
  if (debriefDocx) {
    try {
      const buf = Buffer.from(await debriefDocx.arrayBuffer());
      const parsed = await parseDebriefDocx(buf);
      extractedTitle = parsed.title;
      extractedSummary = parsed.summary;
      extractedKeyTakeaway = parsed.keyTakeaway;
      warnings.push(...parsed.warnings);
    } catch (err) {
      warnings.push(`Debrief DOCX extraction failed: ${err}`);
    }
  }
  if (!extractedTitle || !extractedSummary || !extractedKeyTakeaway) {
    // Fall back to PDF for anything the DOCX didn't produce (or if the
    // colleague didn't upload a DOCX at all). Lazy-load pdf-parse so a
    // runtime import failure surfaces as a warning, not a 500.
    try {
      const { parseDebriefPdf } = await import("@/lib/parse-debrief-pdf");
      const pdfBuf = Buffer.from(await debriefPdfUpload.arrayBuffer());
      const parsedPdf = await parseDebriefPdf(pdfBuf);
      if (!extractedTitle) extractedTitle = parsedPdf.title;
      if (!extractedSummary) extractedSummary = parsedPdf.summary;
      if (!extractedKeyTakeaway) extractedKeyTakeaway = parsedPdf.keyTakeaway;
      warnings.push(...parsedPdf.warnings);
    } catch (err) {
      warnings.push(
        `Debrief PDF auto-extract skipped (${String(err).slice(0, 120)}). ` +
          "You can edit Summary + KeyTakeaway directly in the Airtable Sessions row after publish."
      );
    }
  }

  const title = titleOverride || extractedTitle;
  const summary = summaryOverride || extractedSummary;
  const keyTakeaway = keyTakeawayOverride || extractedKeyTakeaway;

  if (!title) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No title — provide one in the Title override field, or check the debrief DOCX header.",
      },
      { status: 400 }
    );
  }

  // ─── Slug generation ─────────────────────────────────────────────────
  const slug = `session-${number}-${slugify(title)}`;

  // ─── Parse quiz DOCX ────────────────────────────────────────────────
  let quizJson: string;
  try {
    const buf = Buffer.from(await quizDocx.arrayBuffer());
    const parsed = await parseQuizDocx(buf, slug);
    warnings.push(...parsed.warnings);
    quizJson = JSON.stringify(parsed.quiz);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `Couldn't parse the quiz DOCX: ${err}. Check the file follows Corie's standard format.`,
      },
      { status: 400 }
    );
  }

  // ─── Create Airtable record ─────────────────────────────────────────
  let recordId: string;
  try {
    const createRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                [FIELDS.Slug]: slug,
                [FIELDS.Title]: title,
                [FIELDS.Number]: number,
                [FIELDS.LGNumber]: lgNumber || undefined,
                [FIELDS.SessionDate]: sessionDate,
                [FIELDS.Summary]: summary,
                [FIELDS.KeyTakeaway]: keyTakeaway,
                [FIELDS.Director]: "Corie Dawson",
                [FIELDS.IntroYouTubeUrl]: youtubeUrl || undefined,
                [FIELDS.QuizJSON]: quizJson,
                [FIELDS.Audience]: audience,
                // Legacy singular field kept in sync for older readers.
                [FIELDS.Origin]: originCodes[0] ?? origin,
                // New multi-select — this is what the fetcher prefers.
                [FIELDS.Origins]:
                  originsForAirtable.length > 0 ? originsForAirtable : ["Sales"],
                [FIELDS.Published]: true,
              },
            },
          ],
        }),
      }
    );
    if (!createRes.ok) {
      const text = await createRes.text();
      return NextResponse.json(
        {
          ok: false,
          error: `Airtable record create failed (${createRes.status}): ${text.slice(0, 300)}`,
        },
        { status: 500 }
      );
    }
    const createJson = (await createRes.json()) as {
      records: { id: string }[];
    };
    recordId = createJson.records[0].id;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Airtable create threw: ${err}` },
      { status: 500 }
    );
  }

  // ─── Upload attachments (sequential — Airtable rate-limits) ─────────
  try {
    await uploadAttachment(recordId, FIELDS.DebriefPDF, debriefPdfUpload);
    await uploadAttachment(recordId, FIELDS.ToolkitPDF, toolkitPdf);
    await uploadAttachment(recordId, FIELDS.QuizDocx, quizDocx);
  } catch (err) {
    // Record is already created — don't roll back. Colleague can retry
    // the attachment upload from the Airtable UI directly.
    warnings.push(
      `Record created but attachment upload failed partway: ${err}. Open the row in Airtable to attach files manually.`
    );
  }

  return NextResponse.json({
    ok: true,
    slug,
    warnings,
  });
}
