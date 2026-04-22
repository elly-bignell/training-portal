// app/api/auth/validate/route.ts

import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = "Portal Users";

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

// Get current Adelaide time as "YYYY-MM-DD HH:mm"
function getAdelaideNow(): string {
  return new Date()
    .toLocaleString("en-CA", {
      timeZone: "Australia/Adelaide",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "");
}

interface PortalUser {
  slug: string;
  password: string;
  role: string;
  active: boolean;
  validFrom?: string;
  validUntil?: string;
}

function isWithinWindow(user: PortalUser): boolean {
  const now = getAdelaideNow();
  if (user.validFrom && now < user.validFrom) return false;
  if (user.validUntil && now > user.validUntil) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, traineeSlug, requireMaster } = body as {
      password: string;
      traineeSlug?: string;
      requireMaster?: boolean;
    };

    if (!password) {
      return NextResponse.json({ valid: false, error: "No password provided" }, { status: 400 });
    }

    // Fetch all active users from Airtable
    const response = await fetch(
      `${AIRTABLE_URL}?filterByFormula=({Active}=TRUE())`,
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

    const users: PortalUser[] = data.records.map((record: any) => ({
      slug: record.fields.Slug || "",
      password: record.fields.Password || "",
      role: record.fields.Role || "",
      active: record.fields.Active === true,
      validFrom: record.fields["Valid From"] || undefined,
      validUntil: record.fields["Valid Until"] || undefined,
    }));

    // Find matching user by password
    const matchingUser = users.find((u) => u.password === password);

    if (!matchingUser) {
      return NextResponse.json({ valid: false });
    }

    // Check time window if applicable
    if (!isWithinWindow(matchingUser)) {
      const now = getAdelaideNow();
      if (matchingUser.validFrom && now < matchingUser.validFrom) {
        return NextResponse.json({
          valid: false,
          expiry: `Access opens at ${matchingUser.validFrom.split(" ")[1]} on ${matchingUser.validFrom.split(" ")[0]} (Adelaide time)`,
        });
      }
      if (matchingUser.validUntil && now > matchingUser.validUntil) {
        return NextResponse.json({
          valid: false,
          expiry: `Access expired at ${matchingUser.validUntil.split(" ")[1]} on ${matchingUser.validUntil.split(" ")[0]} (Adelaide time)`,
        });
      }
    }

    const isAdmin = matchingUser.role === "Admin";

    // Admin-only pages (requireMaster)
    if (requireMaster) {
      if (isAdmin) {
        return NextResponse.json({ valid: true, role: matchingUser.role, slug: matchingUser.slug });
      }
      return NextResponse.json({ valid: false });
    }

    // Trainee-specific page
    if (traineeSlug) {
      // Admin can access any page
      if (isAdmin) {
        return NextResponse.json({ valid: true, role: matchingUser.role, slug: matchingUser.slug });
      }
      // Trainee can only access their own page
      if (matchingUser.slug === traineeSlug) {
        return NextResponse.json({ valid: true, role: matchingUser.role, slug: matchingUser.slug });
      }
      return NextResponse.json({ valid: false });
    }

    // Generic page (no slug required) — any active user can access
    return NextResponse.json({ valid: true, role: matchingUser.role, slug: matchingUser.slug });

  } catch (error) {
    console.error("Auth validate error:", error);
    return NextResponse.json({ valid: false, error: "Auth check failed" }, { status: 500 });
  }
}
