import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = "appuSHXFTvvlEEY2r";
const AIRTABLE_TABLE_ID = "tbljoYOAUAYJMZL2h";
const RESEND_API_KEY = process.env.RESEND_API_KEY!;

const NOTIFY_EMAILS = ["hr@marketingsweet.com.au"];

const QUESTION_LABELS: Record<string, string> = {
  name: "Applicant Full Name",
  workExperience: "Work Experience Outside University",
  longevity: "Longest Time in a Role",
  expectedStay: "Expected Length of Stay",
  salaryExpectation: "Salary Expectations",
  salaryReview: "Salary Review Expectations",
  careerAspirations: "Career Aspirations",
  careerPriorities: "Career Priorities (Ranked)",
  motivation: "Motivation for Applying",
  workEnvironment: "Preferred Work Environment",
  workApproach: "Approach to Work",
  research: "Research Before Applying",
  successVision: "Success After 12 Months",
  preparedToLearn: "Prepared to Learn More",
};

function formatAnswer(key: string, value: string | string[]): string {
  if (Array.isArray(value)) {
    if (key === "careerPriorities") {
      return value.map((item, i) => `${i + 1}. ${item}`).join("\n        ");
    }
    return value.join(", ");
  }
  return value || "—";
}

function buildEmailHtml(body: Record<string, string | string[]>): string {
  const rows = Object.entries(QUESTION_LABELS)
    .map(([key, label]) => {
      const value = body[key];
      const formatted = formatAnswer(key, value as string | string[]);
      const isMultiLine = key === "careerPriorities" || key === "successVision";
      return `
        <tr>
          <td style="padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: 600; font-size: 13px; color: #374151; width: 35%; vertical-align: top;">
            ${label}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #111827; vertical-align: top; ${isMultiLine ? "white-space: pre-line;" : ""}">
            ${isMultiLine && key === "careerPriorities"
              ? (value as string[]).map((item, i) => `${i + 1}. ${item}`).join("<br>")
              : formatted}
          </td>
        </tr>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Applicant Questionnaire Submission</title></head>
    <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, sans-serif;">
      <div style="max-width: 700px; margin: 32px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: #1d4ed8; padding: 24px 32px;">
          <h1 style="margin: 0; color: white; font-size: 20px;">New Applicant Questionnaire Submission</h1>
          <p style="margin: 6px 0 0; color: #bfdbfe; font-size: 14px;">
            Submitted by <strong>${body.name}</strong> on ${new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at ${new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div style="background: #eff6ff; padding: 12px 32px; border-bottom: 1px solid #dbeafe;">
          <p style="margin: 0; font-size: 12px; color: #1d4ed8;">📄 This email is print-ready — use your browser's print function to save as PDF for the interview.</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0;">${rows}</table>
        <div style="padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">Marketing Sweet · Applicant Questionnaire System</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const finalBody = { ...body };
    if (
      Array.isArray(finalBody.workExperience) &&
      finalBody.workExperience.includes("Other") &&
      finalBody.otherText
    ) {
      finalBody.workExperience = finalBody.workExperience.map((v: string) =>
        v === "Other" ? `Other: ${finalBody.otherText}` : v
      );
    }

    const fields: Record<string, string> = {
      "Applicant Full Name": finalBody.name || "",
      "Submission Timestamp": new Date().toISOString(),
      "Work Experience": Array.isArray(finalBody.workExperience)
        ? finalBody.workExperience.join(", ")
        : finalBody.workExperience || "",
      "Longest Time in Role": finalBody.longevity || "",
      "Expected Length of Stay": finalBody.expectedStay || "",
      "Salary Expectation": finalBody.salaryExpectation || "",
      "Salary Review Expectation": finalBody.salaryReview || "",
      "Career Aspirations": finalBody.careerAspirations || "",
      "Career Priorities (Ranked)": Array.isArray(finalBody.careerPriorities)
        ? finalBody.careerPriorities.map((item: string, i: number) => `${i + 1}. ${item}`).join(", ")
        : finalBody.careerPriorities || "",
      "Motivation for Applying": Array.isArray(finalBody.motivation)
        ? finalBody.motivation.join(", ")
        : finalBody.motivation || "",
      "Preferred Work Environment": finalBody.workEnvironment || "",
      "Approach to Work": finalBody.workApproach || "",
      "Research Before Applying": finalBody.research || "",
      "Success After 12 Months": finalBody.successVision || "",
      "Prepared to Learn More": finalBody.preparedToLearn || "",
    };

    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!airtableRes.ok) {
      const err = await airtableRes.json();
      // Return the actual Airtable error for debugging
      return NextResponse.json({ error: "Airtable submission failed", detail: err }, { status: 500 });
    }

    // Send email via Resend
    const emailHtml = buildEmailHtml(finalBody);
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Applicant Questionnaire <onboarding@resend.dev>",
        to: NOTIFY_EMAILS,
        subject: `New Applicant Questionnaire Submitted – ${finalBody.name}`,
        html: emailHtml,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json({ error: "Internal server error", detail: String(err) }, { status: 500 });
  }
}
