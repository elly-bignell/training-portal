// app/api/questions/[id]/route.ts
//
// PATCH /api/questions/<id>
//        body: { answer_text, answered_by }   → marks the question answered
//        body: { reopen: true }               → flips status back to unanswered
//        body: { question }                   → edit the question text (admin)
//
// DELETE /api/questions/<id>
//        → admin-only cleanup. No soft-delete; the row is removed from Airtable.

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Questions";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { answer_text, answered_by, reopen, question } = body as {
      answer_text?: string;
      answered_by?: string;
      reopen?: boolean;
      question?: string;
    };

    // Build the patch fields based on what's present in the body.
    const fields: Record<string, unknown> = {};

    if (reopen === true) {
      fields.status = "unanswered";
      fields.answer_text = "";
      fields.answered_by = "";
      fields.answered_at = null;
    } else if (typeof answer_text === "string") {
      const trimmed = answer_text.trim();
      if (trimmed.length === 0) {
        return NextResponse.json(
          { error: "answer_text cannot be empty" },
          { status: 400 }
        );
      }
      if (trimmed.length > 10000) {
        return NextResponse.json(
          { error: "Answer is too long (max 10000 characters)" },
          { status: 400 }
        );
      }
      fields.answer_text = trimmed;
      fields.answered_by = (answered_by || "Trainer").trim() || "Trainer";
      fields.answered_at = new Date().toISOString();
      fields.status = "answered";
    }

    if (typeof question === "string" && question.trim().length > 0) {
      if (question.length > 5000) {
        return NextResponse.json(
          { error: "Question is too long (max 5000 characters)" },
          { status: 400 }
        );
      }
      fields.question = question.trim();
    }

    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const res = await fetch(`${AIRTABLE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Airtable PATCH error:", errData);
      return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Questions PATCH error:", err);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${AIRTABLE_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Airtable DELETE error:", errData);
      return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Questions DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
