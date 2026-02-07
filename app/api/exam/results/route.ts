// app/api/exam/results/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "ExamSubmissions";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const traineeSlug = searchParams.get("trainee_slug");
  const examId = searchParams.get("exam_id");

  try {
    let filterFormula = "";
    const filters: string[] = [];

    if (traineeSlug) {
      filters.push(`{trainee_slug} = "${traineeSlug}"`);
    }
    if (examId) {
      filters.push(`{exam_id} = "${examId}"`);
    }

    if (filters.length > 0) {
      filterFormula = `?filterByFormula=${encodeURIComponent(
        filters.length === 1 ? filters[0] : `AND(${filters.join(", ")})`
      )}`;
    }

    const sortParams = "sort%5B0%5D%5Bfield%5D=submitted_at&sort%5B0%5D%5Bdirection%5D=desc";
    const separator = filterFormula ? "&" : "?";
    
    const response = await fetch(
      `${AIRTABLE_URL}${filterFormula}${separator}${sortParams}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();

    const submissions = data.records.map((record: any) => ({
      id: record.id,
      examId: record.fields.exam_id,
      traineeSlug: record.fields.trainee_slug,
      traineeName: record.fields.trainee_name,
      score: record.fields.score || 0,
      totalPoints: record.fields.total_points || 0,
      percentage: record.fields.percentage || 0,
      passed: record.fields.passed || false,
      submittedAt: record.fields.submitted_at,
      answers: record.fields.answers ? JSON.parse(record.fields.answers) : {},
    }));

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
