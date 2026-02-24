// update-roadmap-and-admin.mjs
// Run: node update-roadmap-and-admin.mjs
// Updates the roadmap Week 1 to calls+bookings only, and adds schedule links to admin

import { readFileSync, writeFileSync } from 'fs';

// ─── 1. UPDATE ROADMAP — Week 1 data ─────────────────────────────────────────

console.log('📝 Updating roadmap...');

let roadmap = readFileSync('app/roadmap/page.tsx', 'utf-8');

// Replace Week 1 data block
const oldWeek1 = `  {
    week: 1,
    dateRange: "Mon 23 Feb – Fri 27 Feb",
    startDate: "2026-02-23",
    phase: "ramp",
    label: "First Week Out",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 40 },
    takeaways: [
      "15% book rate — 40 calls to generate 6 bookings/day",
      "6 bookings/day — you're booking meetings for your buddy",
      "1 meeting/day observing — watch how your buddy runs the call and closes",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],
  },`;

const newWeek1 = `  {
    week: 1,
    dateRange: "Mon 23 Feb – Fri 27 Feb",
    startDate: "2026-02-23",
    phase: "ramp",
    label: "First Week Out",
    buddyWeek: true,
    daily: { revenue: 0, units: 0, meetings: 0, bookings: 6, calls: 40 },
    takeaways: [
      "15% book rate — 40 calls to generate 6 bookings/day",
      "Focus: pipeline building — fill the calendar with quality meetings",
      "Meeting attendance (1/day) at manager's discretion if on track with bookings",
      "This week is purely about calls and bookings — build the habit",
    ],
  },`;

if (roadmap.includes(oldWeek1)) {
  roadmap = roadmap.replace(oldWeek1, newWeek1);
  writeFileSync('app/roadmap/page.tsx', roadmap);
  console.log('✅ Roadmap Week 1 updated — calls + bookings only, meetings at discretion');
} else {
  console.log('⚠️  Could not find Week 1 data block in roadmap — may need manual update');
  console.log('   Expected to find the old week 1 daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 40 }');
}


// ─── 2. UPDATE ADMIN — Add schedule links ────────────────────────────────────

console.log('\n📝 Updating admin page...');

let admin = readFileSync('app/admin/page.tsx', 'utf-8');

// Find the Roadmap Link section and add schedule section before it
const roadmapLinkBlock = `        {/* Roadmap Link */}
        <Link
          href="/roadmap"`;

const schedulesSection = `        {/* Schedules Quick Access */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📅</span> Weekly Schedules
          </h3>
          <div className="space-y-4">
            {[
              { name: "Connie Matthews", dir: "connie" },
              { name: "Cindy Rose Rondez Manrique", dir: "cindy" },
              { name: "Krishna Patel", dir: "krishna" },
            ].map((t) => (
              <div key={t.dir}>
                <div className="text-sm font-medium text-gray-700 mb-2">{t.name}</div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <Link
                      key={w}
                      href={\`/schedule/\${t.dir}/week-\${w}\`}
                      className={\`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:shadow-sm \${
                        w <= 4
                          ? "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100"
                          : w <= 6
                          ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                          : w === 7
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
                      }\`}
                    >
                      Wk {w}
                    </Link>
                  ))}
                  <Link
                    href={\`/schedule/\${t.dir}\`}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 transition-all hover:shadow-sm"
                  >
                    All →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Link */}
        <Link
          href="/roadmap"`;

if (admin.includes(roadmapLinkBlock)) {
  admin = admin.replace(roadmapLinkBlock, schedulesSection);
  writeFileSync('app/admin/page.tsx', admin);
  console.log('✅ Admin page updated — schedule links added for all trainees');
} else {
  console.log('⚠️  Could not find Roadmap Link section in admin — may need manual update');
}

console.log('\n🎉 Done! Run `npm run dev` or push to Vercel to see changes.');
