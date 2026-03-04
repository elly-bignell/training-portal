// scripts/update-all-schedules.js
// Run from training-portal root: node scripts/update-all-schedules.js
//
// This script patches ALL week pages for Connie, Cindy, Krishna to:
// 1. Add usePersistedState import + hooks for dynamic targets from projections page
// 2. Replace hardcoded target numbers with computed values
// 3. Add prev/next week navigation arrows
// 4. Remove "Buddy runs validation calls" lines
// 5. Remove hardcoded "Efficiency Note" sidebar box

const fs = require("fs");
const path = require("path");

const TOTAL_WEEKS = 8;

const girls = [
  { slug: "connie", scheduleSlug: "connie" },
  { slug: "cindy", scheduleSlug: "cindy" },
  { slug: "krishna", scheduleSlug: "krishna" },
];

// ── Per-week config (adjust phone hours if needed) ──
// block1 + block2 = total phoneHours
const weekConfig = {
  1: { phoneHours: 6, block1: 3, block2: 3 },
  2: { phoneHours: 5.5, block1: 3, block2: 2.5 },
  3: { phoneHours: 5.5, block1: 3, block2: 2.5 },
  4: { phoneHours: 5.5, block1: 3, block2: 2.5 },
  5: { phoneHours: 4.5, block1: 2.5, block2: 2 },
  6: { phoneHours: 4.5, block1: 2.5, block2: 2 },
  7: { phoneHours: 5.5, block1: 3, block2: 2.5 },
  8: { phoneHours: 6, block1: 3, block2: 3 },
};

let updated = 0;
let skipped = 0;

for (const girl of girls) {
  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const filePath = path.join(
      __dirname, "..", "app", "schedule",
      girl.scheduleSlug, `week-${week}`, "page.tsx"
    );

    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (not found): ${girl.slug}/week-${week}`);
      skipped++;
      continue;
    }

    let content = fs.readFileSync(filePath, "utf8");

    // Skip files that already have usePersistedState (week-2 already done)
    if (content.includes("usePersistedState")) {
      console.log(`SKIP (already dynamic): ${girl.slug}/week-${week}`);
      skipped++;
      continue;
    }

    const cfg = weekConfig[week];

    // ═══════════════════════════════════════════════════
    // 1. ADD IMPORT
    // ═══════════════════════════════════════════════════
    if (!content.includes("usePersistedState")) {
      content = content.replace(
        'import PasswordGate from "@/components/PasswordGate";',
        'import PasswordGate from "@/components/PasswordGate";\nimport { usePersistedState } from "@/hooks/usePersistedState";'
      );
    }

    // ═══════════════════════════════════════════════════
    // 2. ADD HOOKS + COMPUTED VARS
    // ═══════════════════════════════════════════════════
    // Insert after the days array declaration
    const hooksBlock = `
  const WEEK_PHONE_HOURS = ${cfg.phoneHours};
  const BLOCK1_HOURS = ${cfg.block1};
  const BLOCK2_HOURS = ${cfg.block2};

  const [callsPerHour] = usePersistedState("proj-callsPerHour", 18);
  const [connectsPerHour] = usePersistedState("proj-connectsPerHour", 10);
  const [bookingsPerHour] = usePersistedState("proj-bookingsPerHour", 1);
  const [attendanceRate] = usePersistedState("proj-attendanceRate", 0.35);
  const [closeRate] = usePersistedState("proj-closeRate", 0.55);
  const [dealValue] = usePersistedState("proj-dealValue", 400);

  const dailyCalls = Math.round(WEEK_PHONE_HOURS * callsPerHour);
  const dailyConnects = Math.round(WEEK_PHONE_HOURS * connectsPerHour);
  const dailyBookings = Math.round(WEEK_PHONE_HOURS * bookingsPerHour * 10) / 10;
  const dailyAttended = Math.round(dailyBookings * attendanceRate * 10) / 10;
  const dailyDeals = Math.round(dailyAttended * closeRate * 100) / 100;
  const dailyRevenue = Math.round(dailyDeals * dealValue);
  const block1Bookings = Math.round(BLOCK1_HOURS * bookingsPerHour * 10) / 10;
  const block2Bookings = Math.round(BLOCK2_HOURS * bookingsPerHour * 10) / 10;
  const fmt = (v) => (v % 1 !== 0 ? v.toFixed(1) : v.toString());
`;

    // Find the days array and insert after it
    const daysArrayEnd = content.indexOf("];", content.indexOf("const days"));
    if (daysArrayEnd > -1) {
      const insertPos = daysArrayEnd + 2;
      content = content.slice(0, insertPos) + "\n" + hooksBlock + content.slice(insertPos);
    }

    // ═══════════════════════════════════════════════════
    // 3. REPLACE BANNER TARGET NUMBERS
    // ═══════════════════════════════════════════════════
    // Pattern: <div className="text-2xl font-bold">NUMBER</div> followed by label
    const bannerReplacements = [
      { label: "Calls", expr: "{dailyCalls}" },
      { label: "Connects", expr: "{dailyConnects}" },
      { label: "Bookings", expr: "{fmt(dailyBookings)}" },
      { label: "Attended", expr: "{fmt(dailyAttended)}" },
      { label: "Deals", expr: "{fmt(dailyDeals)}" },
      { label: "Revenue", expr: "{`$${dailyRevenue.toLocaleString()}`}" },
    ];

    for (const { label, expr } of bannerReplacements) {
      // Match: font-bold">ANYTHING</div> ... then the label
      const regex = new RegExp(
        `(<div className="text-2xl font-bold">)[^<]+(</div>\\s*<div className="text-\\[10px\\] text-slate-400 uppercase">${label}</div>)`
      );
      content = content.replace(regex, `$1${expr}$2`);
    }

    // Replace banner subtitle
    content = content.replace(
      /<p className="text-xs text-slate-400 mt-3">Revenue based on \$\d+ per deal · 50\/50 buddy split applies<\/p>/,
      `<p className="text-xs text-slate-400 mt-3">Based on {WEEK_PHONE_HOURS}hrs calling · {callsPerHour} calls/hr · {bookingsPerHour} bkgs/hr · {Math.round(attendanceRate * 100)}% attend · {Math.round(closeRate * 100)}% close · \${dealValue}/deal · 50/50 buddy split</p>`
    );

    // ═══════════════════════════════════════════════════
    // 4. REPLACE CALL BLOCK TARGETS IN TABLE
    // ═══════════════════════════════════════════════════
    // Block 1: "Target: 3 bookings" or "Target: X bookings"
    // We need to replace only the FIRST occurrence (block 1) and SECOND (block 2)
    let blockCount = 0;
    content = content.replace(
      /Target: [\d–.]+ bookings/g,
      (match) => {
        blockCount++;
        if (blockCount % 2 === 1) {
          // Block 1 (appears first, and repeats for each day)
          return "Target: {fmt(block1Bookings)} bookings";
        } else {
          // Block 2
          return "Target: {fmt(block2Bookings)} bookings";
        }
      }
    );
    // Reset: since we use rowSpan, each target text only appears once per block
    // But the map creates 5 copies. The rowSpan means only the first day renders.
    // Actually looking at the code, the days.map creates 5 td's with rowSpan,
    // so "Target: X bookings" appears 5 times for block 1 and 5 for block 2.
    // The regex above handles this: odd occurrences = block1, even = block2.

    // ═══════════════════════════════════════════════════
    // 5. REPLACE SIDEBAR DAILY BREAKDOWN TARGETS
    // ═══════════════════════════════════════════════════
    // Block 1 sidebar: "3 bookings" in the right column
    content = content.replace(
      /(<td className="py-2 text-right text-sky-700 font-semibold">)\d+ bookings(<\/td>)/,
      "$1{fmt(block1Bookings)} bookings$2"
    );
    // Block 2 sidebar: "2–3 bookings"
    content = content.replace(
      /(<td className="py-2 text-right text-sky-700 font-semibold">)[\d–]+ bookings(<\/td>)/,
      "$1{fmt(block2Bookings)} bookings$2"
    );
    // Daily total: "6–7 bookings" or "6 bookings"
    content = content.replace(
      /(<td className="py-2 text-right text-gray-900 font-bold">)[\d–.]+ bookings(<\/td>)/,
      "$1{fmt(dailyBookings)} bookings$2"
    );
    // Daily total hours
    content = content.replace(
      /(\d+\.?\d*)hrs calls/g,
      "{WEEK_PHONE_HOURS}hrs calls"
    );

    // ═══════════════════════════════════════════════════
    // 6. REPLACE RULES OF THUMB
    // ═══════════════════════════════════════════════════
    // "18 calls per hour" → "{callsPerHour} calls per hour"
    content = content.replace(/18 calls per hour/, "{callsPerHour} calls per hour");
    // "= 10 connects" → "= {connectsPerHour} connects"
    content = content.replace(
      /= 10 connects(<\/span>)/,
      "= {connectsPerHour} connects$1"
    );
    // "10 connects" (left side)
    content = content.replace(
      /(font-medium">)10 connects(<\/span>)/,
      "$1{connectsPerHour} connects$2"
    );
    // "= 2 bookings (20%)" → dynamic
    content = content.replace(
      /= \d+ bookings \(\d+%\)/,
      `= {bookingsPerHour} bookings ({connectsPerHour > 0 ? Math.round((bookingsPerHour / connectsPerHour) * 100) : 0}%)`
    );
    // "2 bookings" left side
    content = content.replace(
      /(font-medium">\d+ bookings<\/span>)/,
      `{/* bookings */}` // skip this one, too ambiguous
    );
    // Actually let me be more targeted:
    // The rules of thumb section has a specific structure. Let me replace the whole section.
    // Better approach: replace specific lines

    // "= 1 attended (50%)"
    content = content.replace(
      /= \d+\.?\d* attended \(\d+%\)/,
      "= 1 attended ({Math.round(attendanceRate * 100)}%)"
    );
    // "= 1.5 deals (50%)" or "= 1 deal (50%)"
    content = content.replace(
      /= \d+\.?\d* deals? \(\d+%\)/,
      "= 1 deal ({Math.round(closeRate * 100)}%)"
    );
    // "= $400 revenue"
    content = content.replace(
      /= \$\d+ revenue/,
      "= ${dealValue} revenue"
    );
    // Left side "1.5 deals" or "1 deal"
    content = content.replace(
      /(font-medium">)\d+\.?\d* deals?(<\/span>)/,
      "$11 deal$2"
    );
    // Left side "1 deal" → "1 deal" (already correct)

    // ═══════════════════════════════════════════════════
    // 7. REMOVE VALIDATION CALLS
    // ═══════════════════════════════════════════════════
    content = content.replace(
      /\s*<div className="text-\[10px\] text-amber-600 font-medium mt-1">.*?validation calls.*?<\/div>/g,
      ""
    );

    // ═══════════════════════════════════════════════════
    // 8. REMOVE EFFICIENCY NOTE BOX
    // ═══════════════════════════════════════════════════
    content = content.replace(
      /\s*\{\/\* Efficiency Note \*\/\}\s*<div className="bg-amber-50 rounded-xl border border-amber-200 p-4">[\s\S]*?<\/div>\s*<\/div>/,
      ""
    );

    // ═══════════════════════════════════════════════════
    // 9. ADD NAV ARROWS (if not already present)
    // ═══════════════════════════════════════════════════
    if (!content.includes("flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600")) {
      const badgeRegex = /(\s*)<span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded-full">\s*\n?\s*Week \d+ — ([^\n<]+)\s*\n?\s*<\/span>/;

      const match = content.match(badgeRegex);
      if (match) {
        const badgeLabel = match[2].trim();
        const indent = "            ";
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
      }
    }

    // ═══════════════════════════════════════════════════
    // 10. FIX: undo any accidental {WEEK_PHONE_HOURS}hrs in the table time labels
    // ═══════════════════════════════════════════════════
    // The "Xhrs" in table cells like "9:30am–12:30pm · 3hrs" should stay as-is
    // Only the sidebar daily total should be dynamic
    // Re-fix table cell hours that got caught by the global replace
    content = content.replace(
      /· \{WEEK_PHONE_HOURS\}hrs/g,
      (match) => match // actually, let me just not replace those
    );
    // Undo: the regex in step 5 was too broad. Let me be more specific.
    // The table cells have patterns like "· 3hrs" which should stay hardcoded.
    // The daily total row has "5.5hrs calls + 1 meeting" which should be dynamic.
    // Since I replaced ALL "Xhrs calls" globally, I need to undo the table ones.
    // Actually the table cells say "· 3hrs" not "3hrs calls", so they won't match.
    // The only "hrs calls" is in the sidebar daily total. So it's fine.

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`UPDATED: ${girl.slug}/week-${week}`);
    updated++;
  }
}

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
console.log("\nPhone hours per week:");
for (const [w, cfg] of Object.entries(weekConfig)) {
  console.log(`  Week ${w}: ${cfg.phoneHours}hrs (Block1: ${cfg.block1}hrs, Block2: ${cfg.block2}hrs)`);
}
console.log("\n⚠️  Weeks 5-8 phone hours are estimated — check them against your actual schedules!");
console.log("\nNow run:");
console.log('  git add -A && git commit -m "Dynamic targets + nav arrows on all schedule pages" && git push');
