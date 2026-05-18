// app/api/sessions/quiz/submit/route.ts
//
// Receives Sales Training quiz submissions and writes them to the
// "Quiz Submissions" Airtable table so trainers (Corie/Elly) can review
// scores, attempt counts, and short-answer responses outside the rep's
// browser. The localStorage state on the rep's device remains the
// authoritative source for the rep-facing experience — this is a mirror.

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Quiz Submissions";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL =
  process.env.NOTIFICATION_EMAIL || "elly@marketingsweet.com.au";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  AIRTABLE_TABLE_NAME
)}`;

/** Email Elly the rep's short-answer responses so she can read them
 *  inline without opening Airtable. Fire-and-forget — silent on failure
 *  so quiz submit responses never block on the email send. */
async function emailShortAnswers(args: {
  repName: string;
  sessionNumber: string;
  sessionTitle: string;
  score: number;
  passed: boolean;
  attemptNumber: number;
  shortAnswers: string;
}) {
  if (!RESEND_API_KEY) {
    console.log("[quiz/submit] no RESEND_API_KEY — skipping email");
    return;
  }
  if (!args.shortAnswers || !args.shortAnswers.trim()) {
    return; // no short answers → nothing to email
  }

  const statusEmoji = args.passed ? "✅" : "❌";
  const statusText = args.passed ? "PASSED" : "NOT YET";

  // Convert plain-text short answers to HTML — preserve line breaks and
  // separator lines so the email reads cleanly.
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const shortAnswersHtml = escapeHtml(args.shortAnswers)
    .replace(/\n/g, "<br/>")
    .replace(/—————/g, '<hr style="margin:18px 0; border:0; border-top:1px solid #e5e5e5;"/>')
    .replace(/———/g, '<hr style="margin:18px 0; border:0; border-top:1px solid #e5e5e5;"/>');

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Training Portal <onboarding@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: `${statusEmoji} ${args.repName} — Session ${args.sessionNumber} short answers (${args.score}%)`,
        html: `
          <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
            <h2 style="color: #1F3A5F; margin-bottom: 8px;">${escapeHtml(args.repName)} just submitted Session ${escapeHtml(args.sessionNumber)}</h2>
            <p style="color: #666; margin-top: 0;">${escapeHtml(args.sessionTitle)}</p>
            <ul style="line-height: 1.7;">
              <li><strong>Score:</strong> ${args.score}%</li>
              <li><strong>Status:</strong> ${statusText}</li>
              <li><strong>Attempt:</strong> ${args.attemptNumber}</li>
            </ul>
            <h3 style="color: #1F3A5F; margin-top: 24px;">Short-answer responses</h3>
            <div style="background:#f7f7f7; border-left:3px solid #1F3A5F; padding:14px 18px; border-radius:4px; line-height:1.55; font-size:14px;">
              ${shortAnswersHtml}
            </div>
            <p style="color:#999; font-size:12px; margin-top:24px;">
              Full quiz history in Airtable → Quiz Submissions table.
            </p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error("[quiz/submit] email send failed:", err);
  }
}

interface SubmitBody {
  repSlug?: string;
  repName?: string;
  sessionId?: string;
  sessionNumber?: string;
  sessionTitle?: string;
  score?: number;
  passed?: boolean;
  attemptNumber?: number;
  submittedAt?: string;
  answers?: Record<string, number | string>;
  /** Pre-formatted human-readable short-answer text, one block per SA question. */
  shortAnswers?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitBody;
    const {
      repSlug,
      repName,
      sessionId,
      sessionNumber,
      sessionTitle,
      score,
      passed,
      attemptNumber,
      submittedAt,
      answers,
      shortAnswers,
    } = body;

    if (!repSlug || !sessionId || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (repSlug, sessionId, score)." },
        { status: 400 }
      );
    }

    const response = await fetch(AIRTABLE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              event_type: "quiz_attempt",
              rep_slug: repSlug,
              rep_name: repName ?? "",
              session_id: sessionId,
              session_number: sessionNumber ?? "",
              session_title: sessionTitle ?? "",
              score: score,
              passed: passed === true,
              attempt_number: attemptNumber ?? 1,
              submitted_at: submittedAt ?? new Date().toISOString(),
              answers_json: JSON.stringify(answers ?? {}),
              short_answers: shortAnswers ?? "",
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Airtable error", response.status, errText);
      return NextResponse.json(
        { error: `Airtable error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Fire-and-forget email to Elly with the short-answer responses (skipped
    // automatically if there are none). We don't await — the rep's UI should
    // never block on email delivery.
    emailShortAnswers({
      repName: repName ?? repSlug,
      sessionNumber: sessionNumber ?? "",
      sessionTitle: sessionTitle ?? "",
      score: score,
      passed: passed === true,
      attemptNumber: attemptNumber ?? 1,
      shortAnswers: shortAnswers ?? "",
    });

    return NextResponse.json({
      success: true,
      recordId: data.records?.[0]?.id ?? null,
    });
  } catch (err) {
    console.error("Quiz submit failed", err);
    return NextResponse.json(
      { error: "Failed to record quiz submission." },
      { status: 500 }
    );
  }
}
