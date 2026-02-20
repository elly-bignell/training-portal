#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 update-actual-schedule.py

content = open('components/WeekScheduleCompare.tsx').read()

# Replace the entire ACTUAL_SCHEDULE copy line with the real data
old = '// Start with plan as a copy — Elly will provide changes\nconst ACTUAL_SCHEDULE: WeekData = JSON.parse(JSON.stringify(PLAN_SCHEDULE));'

new = '''const ACTUAL_SCHEDULE: WeekData = {
  "Mon 16 Feb": {
    arrivals: [
      "Cindy · Sydney → Adelaide · Departs 6:40am · Lands 8:15am",
      "Becks · Brisbane → Adelaide · Departs 6:35am · Lands 9:50am",
    ],
    blocks: {
      "8:30am": null,
      "9:00am": {
        label: "Welcome",
        time: "9:00am–12:30pm",
        duration: "3.5hrs",
        color: "welcome",
        subtitle: "Cindy, Krishna, Connie from 9:00am\\nBecks joins from 10:00am",
        details: ["Management Team Introduction", "Tech Setup", "This Week's Schedule", "Competencies", "Standards", "Scorecards"],
        rowSpan: 7,
      },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": {
        label: "Process & Technology",
        time: "1:30–5:00pm",
        duration: "3.5hrs",
        color: "process",
        details: ["Booking Admin", "Deal Admin", "Semrush", "Slack", "Discord", "Google Calendars", "Zoom", "Wappalyzer"],
        rowSpan: 7,
      },
    },
    departures: [],
    evening: [],
  },
  "Tue 17 Feb": {
    blocks: {
      "8:30am": { label: "Debrief", time: "8:30–9:00am", duration: "30min", color: "training", rowSpan: 1 },
      "9:00am": { label: "📞 Call for Call (C4C)", time: "9:00–11:00am", duration: "2hrs", color: "c4c", rowSpan: 4 },
      "11:00am": { label: "📞 Supervised Calls", time: "11:00am–12:30pm", duration: "1.5hrs", color: "supervised", rowSpan: 3 },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": { label: "Role Playing & Scenarios", time: "1:30–2:30pm", duration: "1hr", color: "roleplay", rowSpan: 2 },
      "2:30pm": { label: "Customer Service Team", time: "2:30–5:00pm", duration: "2.5hrs", color: "customer", subtitle: "Training w/ Trent", rowSpan: 5 },
    },
    departures: [],
    evening: [],
  },
  "Wed 18 Feb": {
    blocks: {
      "8:30am": { label: "Debrief", time: "8:30–9:00am", duration: "30min", color: "training", rowSpan: 1 },
      "9:00am": { label: "📞 Call for Call (C4C)", time: "9:00am–12:30pm", duration: "3.5hrs", color: "c4c", rowSpan: 7 },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": { label: "📞 Supervised Calls", time: "1:30–5:00pm", duration: "3.5hrs", color: "supervised", rowSpan: 7 },
    },
    departures: [],
    evening: [],
  },
  "Thu 19 Feb": {
    blocks: {
      "8:30am": { label: "Debrief", time: "8:30–9:00am", duration: "30min", color: "training", rowSpan: 1 },
      "9:00am": { label: "📞 Call for Call (C4C)", time: "9:00–11:00am", duration: "2hrs", color: "c4c", rowSpan: 4 },
      "11:00am": { label: "📞 Supervised Calls", time: "11:00am–12:30pm", duration: "1.5hrs", color: "supervised", rowSpan: 3 },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": { label: "📞 Supervised Calls", time: "1:30–5:00pm", duration: "3.5hrs", color: "supervised", rowSpan: 7 },
    },
    departures: [],
    evening: [],
  },
  "Fri 20 Feb": {
    blocks: {
      "8:30am": { label: "Debrief", time: "8:30–9:00am", duration: "30min", color: "training", rowSpan: 1 },
      "9:00am": { label: "📞 Supervised Calls", time: "9:00–10:00am", duration: "1hr", color: "supervised", rowSpan: 2 },
      "10:00am": { label: "🎯 Find Your Harpoon", time: "10:00–11:00am", duration: "1hr", color: "objection", subtitle: "Training w/ Corie", rowSpan: 2 },
      "11:00am": { label: "📞 Supervised Calls", time: "11:00am–12:30pm", duration: "1.5hrs", color: "supervised", rowSpan: 3 },
      "12:30pm": { label: "🍽️ Lunch", time: "12:30–1:30pm", color: "lunch", rowSpan: 2 },
      "1:30pm": { label: "📞 Supervised Calls", time: "1:30–5:00pm", duration: "3.5hrs", color: "supervised", rowSpan: 7 },
    },
    departures: [
      "Saturday 21 Feb",
      "Cindy · Adelaide → Sydney · Departs 12:35pm · Arrives 3:00pm",
      "Becks · Adelaide → Brisbane · Departs 10:55am · Arrives 12:55pm",
    ],
    evening: [],
  },
};'''

content = content.replace(old, new, 1)

# Remove the placeholder amber note on the actual tab
content = content.replace('''            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              💡 This schedule will be updated with the actual changes that were made during the week.
            </div>''', '', 1)

open('components/WeekScheduleCompare.tsx', 'w').write(content)
print("Done — actual schedule updated with real week changes")
