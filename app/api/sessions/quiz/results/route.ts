// app/api/sessions/quiz/results/route.ts
//
// Fetch quiz submissions for a rep from the "Quiz Submissions" Airtable
// table. Used by the Sessions front-end on mount so the rendered status
// (passed/failed/score) is consistent across browsers and devices —
// localStorage alone isn't a source of truth.

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Quiz Submissions";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  AIRTABLE_TABLE_NAME
)}`;

export interface QuizSubmissionRecord {
  id: string;
  repSlug: string;
  repName: string;
  sessionId: string;
  sessionNumber: string;
  sessionTitle: string;
  score: number;
  passed: boolean;
  attemptNumber: number;
  submittedAt: string;
  answers: Record<string, number | string>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repSlug = searchParams.get("rep_slug");
  const sessionId = searchParams.get("session_id");

  try {
    // Treat blank `event_type` as quiz_attempt (backward-compat with rows
    // written before the field existed). Excludes asset_view rows.
    const filters: string[] = [
      `OR({event_type} = "quiz_attempt", {event_type} = "")`,
    ];
    if (repSlug) filters.push(`{rep_slug} = "${repSlug}"`);
    if (sessionId) filters.push(`{session_id} = "${sessionId}"`);

    const filterFormula = `filterByFormula=${encodeURIComponent(
      filters.length === 1 ? filters[0] : `AND(${filters.join(", ")})`
    )}`;
    const sortParams =
      "sort%5B0%5D%5Bfield%5D=submitted_at&sort%5B0%5D%5Bdirection%5D=asc";
    const qs = [filterFormula, sortParams].join("&");

    const response = await fetch(`${AIRTABLE_URL}?${qs}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();
    const submissions: QuizSubmissionRecord[] = (data.records || [])
      .filter(
        (r: any) => r.fields?.rep_slug && r.fields?.session_id
      )
      .map((r: any) => {
        let answers: Record<string, number | string> = {};
        if (typeof r.fields.answers_json === "string") {
          try {
            answers = JSON.parse(r.fields.answers_json);
          } catch {
            /* leave as {} */
          }
        }
        return {
          id: r.id,
          repSlug: r.fields.rep_slug,
          repName: r.fields.rep_name ?? "",
          sessionId: r.fields.session_id,
          sessionNumber: r.fields.session_number ?? "",
          sessionTitle: r.fields.session_title ?? "",
          score: typeof r.fields.score === "number" ? r.fields.score : 0,
          passed: r.fields.passed === true,
          attemptNumber:
            typeof r.fields.attempt_number === "number"
              ? r.fields.attempt_number
              : 1,
          submittedAt: r.fields.submitted_at ?? "",
          answers,
        };
      });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("[quiz/results] fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz submissions", submissions: [] },
      { status: 500 }
    );
  }
}
