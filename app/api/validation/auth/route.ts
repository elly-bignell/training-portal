// app/api/validation/auth/route.ts
//
// Returns role based on password: "admin" | "senior" | "trainee" | null
// Validates against Airtable Portal Users table

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent("Portal Users")}`;

const SENIOR_SLUGS = ["lucas-tirri", "felipe-garcia", "dylan-munro"];

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) return NextResponse.json({ role: null });

    const response = await fetch(
      `${AIRTABLE_URL}?filterByFormula=({Active}=TRUE())`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        cache: "no-store",
      }
    );

    if (!response.ok) return NextResponse.json({ role: null }, { status: 500 });

    const data = await response.json();
    const user = data.records
      .map((r: any) => ({ slug: r.fields.Slug, password: r.fields.Password, role: r.fields.Role }))
      .find((u: any) => u.password === password);

    if (!user) return NextResponse.json({ role: null });

    if (user.role === "Admin") return NextResponse.json({ role: "admin" });

    const isSenior = SENIOR_SLUGS.includes(user.slug);
    return NextResponse.json({ role: isSenior ? "senior" : "trainee", slug: user.slug });
  } catch {
    return NextResponse.json({ role: null }, { status: 400 });
  }
}
