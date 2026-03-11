// data/passwords.ts

// Master password for full site access (admin, all trainee pages)
export const MASTER_PASSWORD = "0202";

// Timed password: only valid within a specific Adelaide time window
// Use for applicant modules that should auto-expire after a weekend window
// Example: { password: "SJones0326!", validFrom: "2026-03-14 17:00", validUntil: "2026-03-16 17:00" }
export interface TimedPassword {
  password: string;
  validFrom?: string; // "YYYY-MM-DD HH:mm" Adelaide time (omit = always open)
  validUntil?: string; // "YYYY-MM-DD HH:mm" Adelaide time (omit = never expires)
}

// Get current Adelaide time as "YYYY-MM-DD HH:mm"
function getAdelaideNow(): string {
  return new Date().toLocaleString("en-CA", {
    timeZone: "Australia/Adelaide",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

// Check if a timed password is currently within its valid window
function isWithinWindow(tp: TimedPassword): boolean {
  const now = getAdelaideNow();
  if (tp.validFrom && now < tp.validFrom) return false;
  if (tp.validUntil && now > tp.validUntil) return false;
  return true;
}

// Individual trainee passwords (only access their own dashboard)
// Use a plain string for always-valid, or TimedPassword for time-limited access
export const TRAINEE_PASSWORDS: Record<string, (string | TimedPassword)[]> = {
  "trainee-test": ["0202"],
  "dylan-munro": ["DMunro0202!"],
  "thomas-rennie": ["TRennie0202!"],
  "lucas-tirri": ["LTirri0202!"],
  "felipe-garcia": ["FGarcia0202!"],
  "connie-matthews": ["CMatthews0226!", "Connie"],
  "cindy-rose-rondez-manrique": ["CManrique0226!"],
  "krishna-patel": ["KPatel0226!"],
  "jeremy-valiente": [{ password: "JValiente0326!", validFrom: "2026-03-06 15:00", validUntil: "2026-03-09 18:00" }],
  "scott-ainslie": [{ password: "SAinslie0326!", validFrom: "2026-03-11 13:00", validUntil: "2026-03-12 14:00" }],
  "dasha-axenova": [{ password: "DAxenova0326!", validFrom: "2026-03-06 15:00", validUntil: "2026-03-08 18:00" }],
};

// Check if a single password entry matches (handles both string and TimedPassword)
function matchesPassword(entry: string | TimedPassword, password: string): boolean {
  if (typeof entry === "string") {
    return entry === password;
  }
  // TimedPassword: check password match AND time window
  return entry.password === password && isWithinWindow(entry);
}

// Get expiry message if password matched but is outside time window
export function getPasswordExpiry(password: string, traineeSlug?: string): string | null {
  if (password === MASTER_PASSWORD) return null;
  if (!traineeSlug || !TRAINEE_PASSWORDS[traineeSlug]) return null;

  for (const entry of TRAINEE_PASSWORDS[traineeSlug]) {
    if (typeof entry !== "string" && entry.password === password) {
      const now = getAdelaideNow();
      if (entry.validFrom && now < entry.validFrom) {
        return "Access opens at " + entry.validFrom.split(" ")[1] + " on " + entry.validFrom.split(" ")[0] + " (Adelaide time)";
      }
      if (entry.validUntil && now > entry.validUntil) {
        return "Access expired at " + entry.validUntil.split(" ")[1] + " on " + entry.validUntil.split(" ")[0] + " (Adelaide time)";
      }
    }
  }
  return null;
}

// Check if password is valid for a given page
export function isValidPassword(password: string, traineeSlug?: string): boolean {
  // Master password works everywhere
  if (password === MASTER_PASSWORD) {
    return true;
  }

  // If checking for a specific trainee page, check their individual password(s)
  if (traineeSlug && TRAINEE_PASSWORDS[traineeSlug]) {
    return TRAINEE_PASSWORDS[traineeSlug].some((entry) => matchesPassword(entry, password));
  }

  // If no traineeSlug provided (e.g. roadmap page), accept ANY valid trainee password
  if (!traineeSlug) {
    return Object.values(TRAINEE_PASSWORDS).some((passwords) =>
      passwords.some((entry) => matchesPassword(entry, password))
    );
  }

  return false;
}

// Check if password has master access
export function hasMasterAccess(password: string): boolean {
  return password === MASTER_PASSWORD;
}
