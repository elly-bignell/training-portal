import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = "appuSHXFTvvlEEY2r";
const AIRTABLE_TABLE_ID = "tbljoYOAUAYJMZL2h";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const fields: Record<string, string> = {
      "Applicant Full Name": body.name || "",
      "Submission Timestamp": new Date().toISOString(),
      "Work Experience": Array.isArray(body.workExperience)
        ? body.workExperience.join(", ")
        : body.workExperience || "",
      "Longest Time in Role": body.longevity || "",
      "Expected Length of Stay": body.expectedStay || "",
      "Salary Expectation": body.salaryExpectation || "",
      "Salary Review Expectation": body.salaryReview || "",
      "Career Aspirations": body.careerAspirations || "",
      "Career Priorities (Ranked)": Array.isArray(body.careerPriorities)
        ? body.careerPriorities.map((item: string, i: number) => `${i + 1}. ${item}`).join(", ")
        : body.careerPriorities || "",
      "Motivation for Applying": Array.isArray(body.motivation)
        ? body.motivation.join(", ")
        : body.motivation || "",
      "Preferred Work Environment": body.workEnvironment || "",
      "Approach to Work": body.workApproach || "",
      "Research Before Applying": body.research || "",
      "Success After 12 Months": body.successVision || "",
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
      console.error("Airtable error:", err);
      return NextResponse.json({ error: "Airtable submission failed" }, { status: 500 });
    }

    const airtableData = await airtableRes.json();
    const recordId = airtableData.id;

    return NextResponse.json({ success: true, recordId });
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
