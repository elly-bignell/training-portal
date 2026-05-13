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

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  AIRTABLE_TABLE_NAME
)}`;

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
