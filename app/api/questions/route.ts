// app/api/questions/route.ts
//
// Question Box — shared team Q&A list. Anyone in the portal can post a
// question; admins answer them. Answered questions stay visible forever
// in the "Answered" tab as reference material.
//
// GET  /api/questions?status=unanswered|answered
//        → omit `status` to return everything (newest first)
// POST /api/questions
//        body: { booker_slug, booker_name, question }

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Questions";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

export interface QuestionRecord {
  id: string;
  booker_slug: string;
  booker_name: string;
  question: string;
  posted_at: string;
  status: "unanswered" | "answered";
  answer_text?: string;
  answered_by?: string;
  answered_at?: string;
}

function recordToQuestion(r: { id: string; fields: Record<string, unknown> }): QuestionRecord {
  const f = r.fields;
  return {
    id: r.id,
    booker_slug: (f.booker_slug as string) || "",
    booker_name: (f.booker_name as string) || "",
    question: (f.question as string) || "",
    posted_at: (f.posted_at as string) || "",
    status: ((f.status as string) === "answered" ? "answered" : "unanswered"),
    answer_text: (f.answer_text as string) || undefined,
    answered_by: (f.answered_by as string) || undefined,
    answered_at: (f.answered_at as string) || undefined,
  };
}

// ---------------------------------------------------------------------------
// GET — list questions (newest first)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    // Pull up to 100 per page; paginate if needed.
    const all: QuestionRecord[] = [];
    let offset: string | undefined = undefined;
    const filterParam = status
      ? `&filterByFormula=${encodeURIComponent(`{status} = "${status}"`)}`
      : "";

    do {
      const url: string =
        `${AIRTABLE_URL}?sort%5B0%5D%5Bfield%5D=posted_at&sort%5B0%5D%5Bdirection%5D=desc&pageSize=100${filterParam}` +
        (offset ? `&offset=${encodeURIComponent(offset)}` : "");
      const res: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
      const data: { records?: Array<{ id: string; fields: Record<string, unknown> }>; offset?: string } =
        await res.json();
      for (const r of data.records || []) {
        all.push(recordToQuestion(r));
      }
      offset = data.offset;
    } while (offset);

    return NextResponse.json({ questions: all });
  } catch (err) {
    console.error("Questions GET error:", err);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new question
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booker_slug, booker_name, question } = body as {
      booker_slug: string;
      booker_name: string;
      question: string;
    };

    if (!booker_slug || !booker_name || !question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "booker_slug, booker_name and question are required" },
        { status: 400 }
      );
    }

    // Guard against absurdly long questions — Airtable long-text has a
    // ~100k cap but there's no reason a single question should be larger
    // than a few paragraphs.
    if (question.length > 5000) {
      return NextResponse.json(
        { error: "Question is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    const fields = {
      booker_slug,
      booker_name,
      question: question.trim(),
      posted_at: new Date().toISOString(),
      status: "unanswered",
    };

    const res = await fetch(AIRTABLE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Airtable create error:", errData);
      return NextResponse.json({ error: "Failed to save question" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, question: recordToQuestion(data) });
  } catch (err) {
    console.error("Questions POST error:", err);
    return NextResponse.json({ error: "Failed to save question" }, { status: 500 });
  }
}
