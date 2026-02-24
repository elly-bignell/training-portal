import fs from "fs";

const files = [
  "app/schedule/connie/week-1/page.tsx",
  "app/schedule/cindy/week-1/page.tsx",
  "app/schedule/krishna/week-1/page.tsx",
];

let changed = 0;

for (const file of files) {
  let f = fs.readFileSync(file, "utf-8");

  // ── 1. Update heading: add intro line under the heading ──
  f = f.replace(
    /<h2 className="text-sm font-bold uppercase tracking-wide">Week 1 Daily Targets<\/h2>/g,
    `<h2 className="text-sm font-bold uppercase tracking-wide">Week 1 — Team Daily Targets</h2>\n          <p className="text-xs text-slate-300 mt-1">As a team, your daily targets are to hit at least:</p>`
  );

  // ── 2. Update bookings target: 6 → 7 ──
  f = f.replace(
    /(<div className="text-2xl font-bold">)6(<\/div>\s*<div className="text-\[10px\] text-slate-400 uppercase">Bookings<\/div>)/g,
    "$17$2"
  );

  // ── 3. Update revenue: $525 → $600 ──
  f = f.replace(
    /(<div className="text-2xl font-bold">\$)525(<\/div>\s*<div className="text-\[10px\] text-slate-400 uppercase">Revenue<\/div>)/g,
    "$1600$2"
  );

  // ── 4. Update revenue subtitle ──
  f = f.replace(
    /Revenue based on \$350 per deal · 50\/50 buddy split applies in Week 1/g,
    "Revenue based on $400 avg deal value · 50\\/50 buddy split applies in Week 1"
  );

  // ── 5. Update Key Reminders conversion line ──
  f = f.replace(
    /18 calls per hour = 10 connects = 1\.5 bookings \(15% booking rate\)/g,
    "18 calls per hour = 10 connects ≈ 1.75 bookings (18% booking rate)"
  );

  // ── 6. Update Rules of Thumb ──
  // Connects → bookings ratio
  f = f.replace(
    /(<span className="text-gray-700 font-medium">)10 connects(<\/span>\s*<span className="text-gray-900 font-bold">= )1\.5 bookings \(15%\)(<\/span>)/g,
    "$110 connects$2≈ 1.75 bookings (18%)$3"
  );

  // Bookings → attended ratio
  f = f.replace(
    /(<span className="text-gray-700 font-medium">)2 bookings(<\/span>\s*<span className="text-gray-900 font-bold">= )1 attended \(50%\)(<\/span>)/g,
    "$17 bookings$2≈ 3 attended (43%)$3"
  );

  // Deal value $350 → $400
  f = f.replace(
    /(<span className="text-emerald-700 font-medium">)1 deal(<\/span>\s*<span className="text-emerald-900 font-bold">= )\$350 revenue(<\/span>)/g,
    "$11 deal$2$400 revenue$3"
  );

  fs.writeFileSync(file, f);
  changed++;
  console.log(`✅ Updated: ${file}`);
}

console.log(`\n🎉 Done! ${changed} files updated.`);
console.log(`\nChanges:`);
console.log(`  • Heading → "Week 1 — Team Daily Targets" + intro line`);
console.log(`  • Bookings: 6 → 7`);
console.log(`  • Revenue: $525 → $600`);
console.log(`  • Deal value: $350 → $400`);
console.log(`  • Booking rate: 15% → 18%`);
console.log(`  • Attended ratio: 2 bookings = 1 attended → 7 bookings ≈ 3 attended (43%)`);
console.log(`\ngit add . && git commit -m "Update Week 1 targets: 7 bookings, $600 rev, $400 deal value" && git push`);
