// app/api/exam/submit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { module1Exam, module1TotalPoints } from "@/data/exams/module-1";
import { ExamSubmission } from "@/types/exam";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "ExamSubmissions";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = process.env.EXAM_NOTIFICATION_EMAIL || "elly@marketingsweet.com.au";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

// Get exam by ID
function getExam(examId: string) {
  if (examId === "exam-module-1") {
    return { exam: module1Exam, totalPoints: module1TotalPoints };
  }
  return null;
}

// Calculate score
function calculateScore(
  examId: string,
  answers: Record<string, number>
): { score: number; totalPoints: number; percentage: number; passed: boolean } {
  const examData = getExam(examId);
  if (!examData) {
    return { score: 0, totalPoints: 0, percentage: 0, passed: false };
  }

  const { exam, totalPoints } = examData;
  let score = 0;

  for (const question of exam.questions) {
    const selectedAnswer = answers[question.id];
    if (selectedAnswer === question.correctAnswer) {
      score += question.points;
    }
  }

  const percentage = Math.round((score / totalPoints) * 100);
  const passed = percentage >= exam.passingScore;

  return { score, totalPoints, percentage, passed };
}

// Send email notification
async function sendEmailNotification(submission: ExamSubmission, examTitle: string) {
  if (!RESEND_API_KEY) {
    console.log("No RESEND_API_KEY configured, skipping email notification");
    console.log("Submission:", JSON.stringify(submission, null, 2));
    return;
  }

  try {
    const statusEmoji = submission.passed ? "✅" : "❌";
    const statusText = submission.passed ? "PASSED" : "NEEDS REVIEW";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Training Portal <onboarding@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: `${statusEmoji} Exam Submission: ${submission.traineeName} - ${examTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b;">Exam Submission Received</h2>
            
            <div style="background: ${submission.passed ? '#ecfdf5' : '#fef2f2'}; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: ${submission.passed ? '#059669' : '#dc2626'};">
                ${statusEmoji} ${statusText}
              </h3>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1e293b;">
                Score: ${submission.score}/${submission.totalPoints} (${submission.percentage}%)
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Trainee</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${submission.traineeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Exam</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${examTitle}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Submitted</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${new Date(submission.submittedAt).toLocaleString('en-AU', { timeZone: 'Australia/Adelaide' })}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Passing Score</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">70%</td>
              </tr>
            </table>

            <p style="color: #6b7280; font-size: 14px;">
              View full results in the <a href="https://training-portal-mauve.vercel.app/admin/exams" style="color: #E6017D;">Admin Dashboard</a>
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send email:", await response.text());
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
}

// Save to Airtable
async function saveToAirtable(submission: ExamSubmission) {
  try {
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
              exam_id: submission.examId,
              trainee_slug: submission.traineeSlug,
              trainee_name: submission.traineeName,
              answers: JSON.stringify(submission.answers),
              score: submission.score,
              total_points: submission.totalPoints,
              percentage: submission.percentage,
              passed: submission.passed,
              submitted_at: submission.submittedAt,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Airtable error:", error);
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();
    return data.records[0].id;
  } catch (error) {
    console.error("Error saving to Airtable:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { examId, traineeSlug, traineeName, answers } = body;

    if (!examId || !traineeSlug || !traineeName || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const examData = getExam(examId);
    if (!examData) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Calculate score
    const { score, totalPoints, percentage, passed } = calculateScore(examId, answers);

    // Create submission object
    const submission: ExamSubmission = {
      examId,
      traineeSlug,
      traineeName,
      answers,
      score,
      totalPoints,
      percentage,
      passed,
      submittedAt: new Date().toISOString(),
    };

    // Save to Airtable
    const recordId = await saveToAirtable(submission);
    submission.id = recordId;

    // Send email notification
    await sendEmailNotification(submission, examData.exam.title);

    return NextResponse.json({
      success: true,
      submission: {
        id: recordId,
        score,
        totalPoints,
        percentage,
        passed,
      },
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}
