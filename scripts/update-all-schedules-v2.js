// scripts/update-all-schedules-v2.js
// Run from training-portal root: node scripts/update-all-schedules-v2.js
//
// Adds dynamic targets from projections page to ALL week pages.
// Also removes "Buddy runs validation calls" lines and "Efficiency Note" box.

const fs = require("fs");
const path = require("path");

const TOTAL_WEEKS = 8;

const girls = [
  { slug: "connie", scheduleSlug: "connie" },
  { slug: "cindy", scheduleSlug: "cindy" },
  { slug: "krishna", scheduleSlug: "krishna" },
];

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

    if (content.includes("usePersistedState")) {
      console.log(`SKIP (already dynamic): ${girl.slug}/week-${week}`);
      skipped++;
      continue;
    }

    const cfg = weekConfig[week];

    // ═══════════════════════════════════════════════════
    // 1. ADD IMPORT
    // ═══════════════════════════════════════════════════
    content = content.replace(
      'import PasswordGate from "@/components/PasswordGate";',
      'import PasswordGate from "@/components/PasswordGate";\nimport { usePersistedState } from "@/hooks/usePersistedState";'
    );

    // ═══════════════════════════════════════════════════
    // 2. ADD HOOKS + COMPUTED VARS after days array
    // ═══════════════════════════════════════════════════
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
  const fmt = (v: number) => (v % 1 !== 0 ? v.toFixed(1) : v.toString());
`;

    const daysArrayEnd = content.indexOf("];", content.indexOf("const days"));
    if (daysArrayEnd > -1) {
      const insertPos = daysArrayEnd + 2;
      content = content.slice(0, insertPos) + "\n" + hooksBlock + content.slice(insertPos);
    }

    // ═══════════════════════════════════════════════════
    // 3. REPLACE BANNER TARGET NUMBERS (the 6 stats boxes)
    // ═══════════════════════════════════════════════════
    // Each banner stat: <div className="text-2xl font-bold">VALUE</div> then label
    const bannerReplacements = [
      { label: "Calls", expr: "{dailyCalls}" },
      { label: "Connects", expr: "{dailyConnects}" },
      { label: "Bookings", expr: "{fmt(dailyBookings)}" },
      { label: "Attended", expr: "{fmt(dailyAttended)}" },
      { label: "Deals", expr: "{fmt(dailyDeals)}" },
      { label: "Revenue", expr: '{`$${dailyRevenue.toLocaleString()}`}' },
    ];

    for (const { label, expr } of bannerReplacements) {
      const regex = new RegExp(
        `(<div className="text-2xl font-bold">)[^<]+(</div>\\s*<div className="text-\\[10px\\] text-slate-400 uppercase">${label}</div>)`
      );
      content = content.replace(regex, `$1${expr}$2`);
    }

    // ═══════════════════════════════════════════════════
    // 4. REPLACE BANNER SUBTITLE
    // ═══════════════════════════════════════════════════
    content = content.replace(
      /<p className="text-xs text-slate-400 mt-3">Revenue based on \$\d+ per deal · 50\/50 buddy split applies<\/p>/,
      '<p className="text-xs text-slate-400 mt-3">Based on {WEEK_PHONE_HOURS}hrs calling · {callsPerHour} calls/hr · {bookingsPerHour} bkgs/hr · {Math.round(attendanceRate * 100)}% attend · {Math.round(closeRate * 100)}% close · ${dealValue}/deal · 50/50 buddy split</p>'
    );

    // ═══════════════════════════════════════════════════
    // 5. REPLACE CALL BLOCK TARGETS IN TABLE
    //    "Target: 3 bookings" → "Target: {fmt(block1Bookings)} bookings"
    //    "Target: 2–3 bookings" → "Target: {fmt(block2Bookings)} bookings"
    // ═══════════════════════════════════════════════════
    // Block 1 always appears first in the file (9:30–12:30)
    // Block 2 appears second (1:30–4:00)
    let blockHit = 0;
    content = content.replace(
      /Target: [\d–.]+ bookings/g,
      () => {
        blockHit++;
        // First match = block 1, second = block 2
        if (blockHit === 1) {
          return "Target: {fmt(block1Bookings)} bookings";
        } else {
          return "Target: {fmt(block2Bookings)} bookings";
        }
      }
    );

    // ═══════════════════════════════════════════════════
    // 6. REPLACE SIDEBAR DAILY BREAKDOWN TARGETS
    // ═══════════════════════════════════════════════════
    // Block 1 sidebar row: "3 bookings" in the right column
    let sidebarHit = 0;
    content = content.replace(
      /(<td className="py-2 text-right text-sky-700 font-semibold">)[\d–.]+ bookings(<\/td>)/g,
      (match, p1, p2) => {
        sidebarHit++;
        if (sidebarHit === 1) {
          return `${p1}{fmt(block1Bookings)} bookings${p2}`;
        } else {
          return `${p1}{fmt(block2Bookings)} bookings${p2}`;
        }
      }
    );

    // Daily total bookings in sidebar: "6–7 bookings" or "6 bookings"
    content = content.replace(
      /(<td className="py-2 text-right text-gray-900 font-bold">)[\d–.]+ bookings(<\/td>)/,
      '$1{fmt(dailyBookings)} bookings$2'
    );

    // Daily total hours in sidebar: "5.5hrs calls + 1 meeting"
    content = content.replace(
      /(\d+\.?\d*)hrs calls/,
      '{WEEK_PHONE_HOURS}hrs calls'
    );

    // ═══════════════════════════════════════════════════
    // 7. REPLACE RULES OF THUMB — targeted, safe replacements
    // ═══════════════════════════════════════════════════
    // "18 calls per hour" → dynamic
    content = content.replace(
      /(<span className="text-indigo-700 font-medium">)18 calls per hour(<\/span>)/,
      '$1{callsPerHour} calls per hour$2'
    );
    // "= 10 connects" → dynamic
    content = content.replace(
      /(<span className="text-indigo-900 font-bold">)= 10 connects(<\/span>)/,
      '$1= {connectsPerHour} connects$2'
    );
    // "10 connects" left side
    content = content.replace(
      /(<span className="text-gray-700 font-medium">)10 connects(<\/span>)/,
      '$1{connectsPerHour} connects$2'
    );
    // "= 2 bookings (20%)" → dynamic
    content = content.replace(
      /(<span className="text-gray-900 font-bold">)= \d+ bookings \(\d+%\)(<\/span>)/,
      '$1= {bookingsPerHour} bookings ({connectsPerHour > 0 ? Math.round((bookingsPerHour / connectsPerHour) * 100) : 0}%)$2'
    );
    // "2 bookings" left side in Rules of Thumb
    content = content.replace(
      /(<span className="text-gray-700 font-medium">\d+) bookings(<\/span>)/,
      '$1 bookings$2'
    );
    // Actually let's make the left side dynamic too:
    content = content.replace(
      /(<span className="text-gray-700 font-medium">)\d+ bookings(<\/span>)/,
      '$1{bookingsPerHour} bookings$2'
    );
    // "= 1 attended (50%)" → dynamic
    content = content.replace(
      /(<span className="text-gray-900 font-bold">)= \d+\.?\d* attended \(\d+%\)(<\/span>)/,
      '$1= 1 attended ({Math.round(attendanceRate * 100)}%)$2'
    );
    // "2 attended" left side
    content = content.replace(
      /(<span className="text-gray-700 font-medium">)\d+ attended(<\/span>)/,
      '$1{bookingsPerHour} attended$2'
    );
    // "= 1.5 deals (50%)" → dynamic
    content = content.replace(
      /(<span className="text-gray-900 font-bold">)= \d+\.?\d* deals? \(\d+%\)(<\/span>)/,
      '$1= 1 deal ({Math.round(closeRate * 100)}%)$2'
    );
    // "1.5 deals" left side
    content = content.replace(
      /(<span className="text-emerald-700 font-medium">)\d+\.?\d* deals?(<\/span>)/,
      '$11 deal$2'
    );
    // "= $400 revenue" → dynamic
    content = content.replace(
      /(<span className="text-emerald-900 font-bold">)= \$\d+ revenue(<\/span>)/,
      '$1= ${"{"}dealValue{"}"} revenue$2'
    );

    // ═══════════════════════════════════════════════════
    // 8. REMOVE VALIDATION CALLS
    // ═══════════════════════════════════════════════════
    content = content.replace(
      /\s*<div className="text-\[10px\] text-amber-600 font-medium mt-1">.*?validation calls.*?<\/div>/gi,
      ""
    );

    // ═══════════════════════════════════════════════════
    // 9. REMOVE EFFICIENCY NOTE BOX (if present)
    // ═══════════════════════════════════════════════════
    // Match the whole Efficiency Note block
    content = content.replace(
      /\s*\{\/\* Efficiency Note \*\/\}\s*<div className="bg-amber-50 rounded-xl border border-amber-200 p-4">[\s\S]*?<\/div>\s*<\/div>/,
      ""
    );
    // Also try without the JSX comment
    content = content.replace(
      /\s*<div className="bg-amber-50 rounded-xl border border-amber-200 p-4">\s*<div className="flex items-start gap-2">[\s\S]*?<\/div>\s*<\/div>/,
      ""
    );

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
console.log("\nNow run:");
console.log('  git add -A && git commit -m "Dynamic targets on all schedule pages" && git push');
