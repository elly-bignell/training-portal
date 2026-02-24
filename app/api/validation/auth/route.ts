// app/api/validation/auth/route.ts
//
// Returns role based on password: "admin" | "senior" | "trainee" | null
// Uses existing data/passwords.ts — no extra env vars needed

import { NextRequest, NextResponse } from "next/server";
import { isValidPassword, hasMasterAccess } from "@/data/passwords";
import { trainees } from "@/data/trainees";

// Senior team members who get full validation access (all 6 tabs)
const SENIOR_SLUGS = ["lucas-tirri", "felipe-garcia", "dylan-munro"];

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ role: null });
    }

    // Check master password first
    if (hasMasterAccess(password)) {
      return NextResponse.json({ role: "admin" });
    }

    // Check each trainee password
    for (const trainee of trainees) {
      if (isValidPassword(password, trainee.slug)) {
        const isSenior = SENIOR_SLUGS.includes(trainee.slug);
        return NextResponse.json({ role: isSenior ? "senior" : "trainee", slug: trainee.slug });
      }
    }

    return NextResponse.json({ role: null });
  } catch {
    return NextResponse.json({ role: null }, { status: 400 });
  }
}