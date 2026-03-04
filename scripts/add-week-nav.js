// scripts/add-week-nav.js
// Run: node scripts/add-week-nav.js
// Adds prev/next week navigation arrows to all schedule week pages

const fs = require("fs");
const path = require("path");

const girls = [
  { slug: "connie", scheduleSlug: "connie" },
  { slug: "cindy", scheduleSlug: "cindy" },
  { slug: "krishna", scheduleSlug: "krishna" },
];

const TOTAL_WEEKS = 8;

for (const girl of girls) {
  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const filePath = path.join(
      __dirname,
      "..",
      "app",
      "schedule",
      girl.scheduleSlug,
      `week-${week}`,
      "page.tsx"
    );

    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (not found): ${filePath}`);
      continue;
    }

    let content = fs.readFileSync(filePath, "utf8");

    // Skip if already has week nav (i.e. week-2 files we already updated)
    if (content.includes("Week {prevWeek}") || content.includes("week-${prevWeek}") || content.includes(`week-${week - 1}`  + '`} className="flex items-center gap-1.5')) {
      console.log(`SKIP (already has nav): ${girl.slug}/week-${week}`);
      continue;
    }

    // Find and replace the static badge span with nav arrows
    // Pattern: <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded-full">
    //            Week X — Something
    //          </span>
    const badgeRegex = /(\s*)<span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded-full">\s*\n?\s*Week \d+ — ([^\n<]+)\s*\n?\s*<\/span>/;

    const match = content.match(badgeRegex);
    if (!match) {
      console.log(`SKIP (no badge found): ${girl.slug}/week-${week}`);
      continue;
    }

    const badgeLabel = match[2].trim();
    const indent = match[1] || "            ";

    const prevWeek = week > 1 ? week - 1 : null;
    const nextWeek = week < TOTAL_WEEKS ? week + 1 : null;

    const navBlock = `${indent}<div className="flex items-center gap-2">
${indent}  ${prevWeek ? `<Link href={\`/schedule/${girl.scheduleSlug}/week-${prevWeek}\`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition-colors">
${indent}    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
${indent}    Week ${prevWeek}
${indent}  </Link>` : `<span className="px-3 py-1.5 bg-slate-800 text-slate-600 text-xs font-semibold rounded-lg cursor-not-allowed">
${indent}    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
${indent}  </span>`}
${indent}  <span className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-full">
${indent}    Week ${week} — ${badgeLabel}
${indent}  </span>
${indent}  ${nextWeek ? `<Link href={\`/schedule/${girl.scheduleSlug}/week-${nextWeek}\`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition-colors">
${indent}    Week ${nextWeek}
${indent}    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
${indent}  </Link>` : `<span className="px-3 py-1.5 bg-slate-800 text-slate-600 text-xs font-semibold rounded-lg cursor-not-allowed">
${indent}    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
${indent}  </span>`}
${indent}</div>`;

    content = content.replace(badgeRegex, navBlock);

    // Also remove any validation calls lines
    content = content.replace(
      /\s*<div className="text-\[10px\] text-amber-600 font-medium mt-1">🔍 Buddy runs validation calls on previous day&apos;s bookings<\/div>/g,
      ""
    );

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`UPDATED: ${girl.slug}/week-${week}`);
  }
}

console.log("\nDone! Now run: git add -A && git commit -m 'Add week nav arrows to all schedule pages' && git push");
