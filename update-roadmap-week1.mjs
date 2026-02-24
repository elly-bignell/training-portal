import fs from "fs";

let f = fs.readFileSync("app/roadmap/page.tsx", "utf-8");

// ── Week 1: bookings 6 → 7, update takeaways ──
f = f.replace(
  `week: 1,
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
    ],`,
  `week: 1,
    dateRange: "Mon 23 Feb – Fri 27 Feb",
    startDate: "2026-02-23",
    phase: "ramp",
    label: "First Week Out",
    buddyWeek: true,
    daily: { revenue: 0, units: 0, meetings: 0, bookings: 7, calls: 40 },
    takeaways: [
      "Call for call with your buddy — supervised calls to hit 7 bookings/day as a team",
      "Focus: pipeline building — fill the calendar with quality meetings",
      "Meeting attendance (1/day) at manager's discretion if on track with bookings",
      "This week is purely about calls and bookings — build the habit",
    ],`
);

// ── Week 2: bookings 6 → 7, update takeaways ──
f = f.replace(
  `week: 2,
    dateRange: "Mon 2 Mar – Fri 6 Mar",
    startDate: "2026-03-02",
    phase: "ramp",
    label: "Building Pipeline",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 30 },
    takeaways: [
      "20% book rate — 30 calls for 6 bookings/day, 10 fewer than Week 1",
      "You should be picking up the pitch structure and objection handling",
      "Your pipeline is growing — the bookings you're making fill your buddy's calendar",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],`,
  `week: 2,
    dateRange: "Mon 2 Mar – Fri 6 Mar",
    startDate: "2026-03-02",
    phase: "ramp",
    label: "Building Pipeline",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 7, calls: 30 },
    takeaways: [
      "Call for call with your buddy — supervised calls to hit 7 bookings/day as a team",
      "You should be picking up the pitch structure and objection handling",
      "Your pipeline is growing — the bookings you're making fill your buddy's calendar",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],`
);

// ── Week 3: bookings 6 → 7, update takeaways ──
f = f.replace(
  `week: 3,
    dateRange: "Mon 9 Mar – Fri 13 Mar",
    startDate: "2026-03-09",
    phase: "ramp",
    label: "Consistency",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 30 },
    takeaways: [
      "20% book rate maintained — 30 calls, 6 bookings, 1 meeting observing",
      "Your booking quality should be improving — better prospects, fewer no-shows",
      "Learn from every meeting — what objections come up, how does your buddy handle them?",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],`,
  `week: 3,
    dateRange: "Mon 9 Mar – Fri 13 Mar",
    startDate: "2026-03-09",
    phase: "ramp",
    label: "Consistency",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 7, calls: 30 },
    takeaways: [
      "Call for call with your buddy — supervised calls to maintain 7 bookings/day as a team",
      "Your booking quality should be improving — better prospects, fewer no-shows",
      "Learn from every meeting — what objections come up, how does your buddy handle them?",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],`
);

// ── Week 4: bookings 6 → 7, update takeaways ──
f = f.replace(
  `week: 4,
    dateRange: "Mon 16 Mar – Fri 20 Mar",
    startDate: "2026-03-16",
    phase: "ramp",
    label: "Wrapping Up Phase 1",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 30 },
    takeaways: [
      "Last week at 30 calls / 6 bookings / 1 meeting — your 20% book rate is locked in",
      "Next week you step up to 2 meetings/day — your buddy will start handing you the reins",
      "Your booking rhythm is locked in — now it's about quality over quantity",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],`,
  `week: 4,
    dateRange: "Mon 16 Mar – Fri 20 Mar",
    startDate: "2026-03-16",
    phase: "ramp",
    label: "Wrapping Up Phase 1",
    buddyWeek: true,
    daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 7, calls: 30 },
    takeaways: [
      "Call for call with your buddy — supervised calls to maintain 7 bookings/day as a team",
      "Next week you step up to 2 meetings/day — your buddy will start handing you the reins",
      "Your booking rhythm is locked in — now it's about quality over quantity",
      "50% close rate → 2.5 deals/week → $1,250 (your target contribution: $625)",
    ],`
);

fs.writeFileSync("app/roadmap/page.tsx", f);

console.log("✅ Updated roadmap:");
console.log("  • Week 1: bookings 6→7, added call-for-call with buddy");
console.log("  • Week 2: bookings 6→7, added call-for-call with buddy");
console.log("  • Week 3: bookings 6→7, added call-for-call with buddy");
console.log("  • Week 4: bookings 6→7, added call-for-call with buddy");
console.log("\ngit add . && git commit -m \"Roadmap: weeks 1-4 bookings 6→7, call-for-call with buddy\" && git push");
