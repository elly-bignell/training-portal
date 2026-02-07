// data/passwords.ts

// Master password for full site access (admin, all trainee pages)
export const MASTER_PASSWORD = "0202";

// Individual trainee passwords (only access their own dashboard)
export const TRAINEE_PASSWORDS: Record<string, string> = {
  "cindy-rose-rondez-manrique": "CManrique0226!",
  "krishna-patel": "KPatel0226!",
};

// Check if password is valid for a given page
export function isValidPassword(password: string, traineeSlug?: string): boolean {
  // Master password works everywhere
  if (password === MASTER_PASSWORD) {
    return true;
  }
  
  // If checking for a specific trainee page, check their individual password
  if (traineeSlug && TRAINEE_PASSWORDS[traineeSlug] === password) {
    return true;
  }
  
  return false;
}

// Check if password has master access
export function hasMasterAccess(password: string): boolean {
  return password === MASTER_PASSWORD;
}
