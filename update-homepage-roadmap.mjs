import fs from "fs";

// ─── 1. HOME PAGE: Reorder buttons, add Booking Validation, remove Schedule & Exam Results ───
const homePath = "app/page.tsx";
let home = fs.readFileSync(homePath, "utf8");

// Replace the entire button section
home = home.replace(
  `        {/* Admin Links */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Admin Dashboard
          </Link>
          <Link
            href="/admin/performance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6017D] text-white rounded-lg hover:bg-[#c4016a] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance Tracker
          </Link>
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Exam Results
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Training Week Notes
          </Link>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule
          </Link>
          <Link
            href="/call-flowchart"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            Call Flowchart
          </Link>
          <Link href="/timezones" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">\u{1F550} Time Zones</Link>
        </div>`,
  `        {/* Navigation */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Link
            href="/admin/performance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6017D] text-white rounded-lg hover:bg-[#c4016a] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance Tracker
          </Link>
          <Link
            href="/validation"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Booking Validation
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Admin Dashboard
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Training Week Schedule & Notes
          </Link>
          <Link
            href="/call-flowchart"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            Call Flowchart
          </Link>
          <Link href="/timezones" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">\u{1F550} Time Zones</Link>
        </div>`
);

fs.writeFileSync(homePath, home, "utf8");
console.log("\u2705 app/page.tsx \u2014 Updated navigation buttons:");
console.log("   1. Performance Tracker");
console.log("   2. Booking Validation (NEW)");
console.log("   3. Admin Dashboard");
console.log("   4. Training Week Schedule & Notes (renamed)");
console.log("   5. Call Flowchart");
console.log("   6. Time Zones");
console.log("   \u274C Removed: Exam Results, Schedule");

// ─── 2. ROADMAP: Remove "discretion", make more casual ───
const roadmapPath = "app/roadmap/page.tsx";
let roadmap = fs.readFileSync(roadmapPath, "utf8");

// Week 1 takeaway — the only "discretion" mention
roadmap = roadmap.replace(
  `"Meeting attendance (1/day) at manager's discretion if on track with bookings"`,
  `"Your manager might get you into a meeting if your bookings are looking good"`
);

fs.writeFileSync(roadmapPath, roadmap, "utf8");

// Verify
const homeCheck = fs.readFileSync(homePath, "utf8");
const roadmapCheck = fs.readFileSync(roadmapPath, "utf8");
const hasDiscretion = roadmapCheck.toLowerCase().includes("discretion");

console.log("\n\u2705 app/roadmap/page.tsx \u2014 Removed discretion, made more casual");
console.log(`   ${!hasDiscretion ? "\u2705" : "\u274C"} No "discretion" in roadmap`);
console.log(`   ${homeCheck.includes("Booking Validation") ? "\u2705" : "\u274C"} Booking Validation button present`);
console.log(`   ${homeCheck.includes("Training Week Schedule & Notes") ? "\u2705" : "\u274C"} Renamed to Training Week Schedule & Notes`);
console.log(`   ${!homeCheck.includes(">Schedule<") ? "\u2705" : "\u274C"} Schedule button removed`);
console.log(`   ${!homeCheck.includes("Exam Results") ? "\u2705" : "\u274C"} Exam Results button removed`);

// ─── 3. GIT ───
import { execSync } from "child_process";
try {
  execSync("git add app/page.tsx app/roadmap/page.tsx", { stdio: "inherit" });
  execSync('git commit -m "Homepage: reorder nav, add Booking Validation, rename Notes, remove Schedule/Exams. Roadmap: remove discretion"', { stdio: "inherit" });
  execSync("git push", { stdio: "inherit" });
  console.log("\n\u2705 Pushed to git");
} catch (e) {
  console.log("\n\u26A0\uFE0F  Git push failed \u2014 run manually: git push");
}
