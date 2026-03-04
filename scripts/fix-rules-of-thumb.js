// scripts/fix-rules-of-thumb.js
// Run from training-portal root: node scripts/fix-rules-of-thumb.js
//
// REPAIR SCRIPT: Replaces the entire broken Rules of Thumb section
// with a correct dynamic version. Also fixes fmt() type annotation
// and removes Efficiency Note boxes.

const fs = require("fs");
const path = require("path");

const people = ["connie", "cindy", "krishna"];
const TOTAL_WEEKS = 8;

// The correct dynamic Rules of Thumb block
const GOOD_RULES = `{/* Rules of Thumb */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">📐</span>
                Rules of Thumb
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-indigo-50 rounded">
                  <span className="text-indigo-700 font-medium">{callsPerHour} calls per hour</span>
                  <span className="text-indigo-900 font-bold">= {connectsPerHour} connects</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">{connectsPerHour} connects</span>
                  <span className="text-gray-900 font-bold">= {bookingsPerHour} bookings ({connectsPerHour > 0 ? Math.round((bookingsPerHour / connectsPerHour) * 100) : 0}%)</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">{bookingsPerHour} bookings</span>
                  <span className="text-gray-900 font-bold">= 1 attended ({Math.round(attendanceRate * 100)}%)</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">{bookingsPerHour} attended</span>
                  <span className="text-gray-900 font-bold">= 1 deal ({Math.round(closeRate * 100)}%)</span>
                </div>
                <div className="flex justify-between p-2 bg-emerald-50 rounded">
                  <span className="text-emerald-700 font-medium">1 deal</span>
                  <span className="text-emerald-900 font-bold">= \${dealValue} revenue</span>
                </div>
              </div>
            </div>

            `;

let fixed = 0;
let skipped = 0;

for (const person of people) {
  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const filePath = path.join(
      __dirname, "..", "app", "schedule",
      person, `week-${week}`, "page.tsx"
    );

    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (not found): ${person}/week-${week}`);
      skipped++;
      continue;
    }

    let content = fs.readFileSync(filePath, "utf8");
    let changed = false;

    // ═══════════════════════════════════════════════════
    // FIX 1: Replace entire Rules of Thumb section
    // Strategy: cut from "{/* Rules of Thumb" to "{/* Quick Links"
    // ═══════════════════════════════════════════════════
    const rotMarker = content.indexOf("{/* Rules of Thumb");
    const qlMarker = content.indexOf("{/* Quick Links");

    if (rotMarker !== -1 && qlMarker !== -1 && qlMarker > rotMarker) {
      // Find the start of the line containing {/* Rules of Thumb
      let lineStart = content.lastIndexOf("\n", rotMarker);
      if (lineStart === -1) lineStart = 0;
      else lineStart += 1;

      content = content.slice(0, lineStart) + "            " + GOOD_RULES + content.slice(qlMarker);
      changed = true;
    } else {
      // Fallback: look for heading without JSX comment marker
      const headingIdx = content.indexOf("Rules of Thumb</");
      const qlIdx = content.indexOf("{/* Quick Links");

      if (headingIdx !== -1 && qlIdx !== -1) {
        // Search backward from heading to find the outer div
        let searchPos = headingIdx;
        let outerStart = -1;
        while (searchPos > 0) {
          const idx = content.lastIndexOf('<div className="bg-white rounded-xl', searchPos);
          if (idx !== -1) {
            outerStart = idx;
            break;
          }
          searchPos -= 200;
        }

        if (outerStart !== -1) {
          let lineStart = content.lastIndexOf("\n", outerStart);
          if (lineStart === -1) lineStart = 0;
          else lineStart += 1;

          content = content.slice(0, lineStart) + "            " + GOOD_RULES + content.slice(qlIdx);
          changed = true;
        }
      }
    }

    // ═══════════════════════════════════════════════════
    // FIX 2: Fix fmt() — (v) should be (v: number)
    // ═══════════════════════════════════════════════════
    if (content.includes("const fmt = (v) =>")) {
      content = content.replace("const fmt = (v) =>", "const fmt = (v: number) =>");
      changed = true;
    }

    // ═══════════════════════════════════════════════════
    // FIX 3: Remove Efficiency Note box
    // ═══════════════════════════════════════════════════
    const effWithComment = /\n?\s*\{\/\* Efficiency Note \*\/\}\s*\n?\s*<div className="bg-amber-50 rounded-xl border border-amber-200 p-4">[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/;
    if (effWithComment.test(content)) {
      content = content.replace(effWithComment, "");
      changed = true;
    }
    const effWithoutComment = /\n?\s*<div className="bg-amber-50 rounded-xl border border-amber-200 p-4">\s*<div className="flex items-start gap-2">[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/;
    if (effWithoutComment.test(content)) {
      content = content.replace(effWithoutComment, "");
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`FIXED: ${person}/week-${week}`);
      fixed++;
    } else {
      console.log(`SKIP (looks ok): ${person}/week-${week}`);
      skipped++;
    }
  }
}

console.log(`\nDone! Fixed: ${fixed}, Skipped: ${skipped}`);
console.log("\nNow run:");
console.log('  git add -A && git commit -m "Fix broken Rules of Thumb JSX + fmt type annotation" && git push');
