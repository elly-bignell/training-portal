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
import { convertDebriefDocxToPdf } from "@/lib/docx-to-pdf";

// Puppeteer + @sparticuz/chromium need the Node runtime (not Edge).
export const runtime = "nodejs";
// PDF conversion + Airtable uploads can take longer than Vercel's default
// 10s cap on hobby plans; bump to 60s so a slow submit still completes.
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
  if (!debriefDocx && !debriefPdfUpload) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing debrief — upload the DOCX (server converts to PDF) or a PDF directly.",
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

  // ─── Auto-extract from debrief DOCX ──────────────────────────────────
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
      warnings.push(`Debrief extraction failed: ${err}`);
    }
  } else {
    warnings.push(
      "No debrief DOCX uploaded — Summary + KeyTakeaway will use overrides only."
    );
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
                [FIELDS.Origin]: origin,
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

  // ─── Resolve the debrief PDF ─────────────────────────────────────────
  // Preference order: a PDF the colleague uploaded directly, otherwise a
  // server-generated PDF from the debrief DOCX. Only one of these paths
  // actually runs per submit — DOCX conversion is the common case.
  let debriefPdfForUpload: File | { buffer: Buffer; name: string; type: string } | null =
    debriefPdfUpload;
  if (!debriefPdfForUpload && debriefDocx) {
    try {
      const docxBuf = Buffer.from(await debriefDocx.arrayBuffer());
      const pdfBuf = await convertDebriefDocxToPdf(docxBuf);
      const pdfName = debriefDocx.name.replace(/\.docx$/i, ".pdf");
      debriefPdfForUpload = {
        buffer: pdfBuf,
        name: pdfName,
        type: "application/pdf",
      };
    } catch (err) {
      warnings.push(
        `Debrief DOCX→PDF conversion failed: ${err}. The DOCX was still parsed for Summary/KeyTakeaway, but the portal won't have a debrief PDF to serve. You can convert manually (Word > Save As > PDF) and attach in Airtable.`
      );
    }
  }

  // ─── Upload attachments (sequential — Airtable rate-limits) ─────────
  try {
    if (debriefPdfForUpload) {
      if (debriefPdfForUpload instanceof File) {
        await uploadAttachment(recordId, FIELDS.DebriefPDF, debriefPdfForUpload);
      } else {
        await uploadAttachmentFromBuffer(
          recordId,
          FIELDS.DebriefPDF,
          debriefPdfForUpload.buffer,
          debriefPdfForUpload.name,
          debriefPdfForUpload.type
        );
      }
    }
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
