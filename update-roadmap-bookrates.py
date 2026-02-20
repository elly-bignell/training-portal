#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 update-roadmap-bookrates.py

content = open('app/roadmap/page.tsx').read()

# 1. Update standardDaily calls from 40 to 20
content = content.replace(
    'const standardDaily = { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 };',
    'const standardDaily = { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 20 };'
)

# 2. Update getPercentToStandard - the baseline calls reference
# Currently uses 60 as starting calls, should update to reflect new range
content = content.replace(
    'const callPct = Math.min(100, Math.max(0, ((60 - daily.calls) / (60 - standardDaily.calls)) * 100));',
    'const callPct = Math.min(100, Math.max(0, ((47 - daily.calls) / (47 - standardDaily.calls)) * 100));'
)

# 3. Week 1: bookings 7, calls 70 → calls 47 (15% book rate)
content = content.replace(
    '''    week: 1,
    dateRange: "Mon 23 Feb \u2013 Fri 27 Feb",
    startDate: "2026-02-23",
    phase: "ramp",
    label: "First Week Out",
    daily: { revenue: 0, units: 0, meetings: 1, bookings: 7, calls: 70 },
    takeaways: [
      "60\u201380 calls/day depending on cut-through \u2014 volume is everything this week",
      "Minimum 7 bookings/day \u2014 you're booking out your buddy's calendar",
      "1 meeting/day observing your buddy \u2014 watch how they run the call",
      "No revenue expected \u2014 this is about building pipeline and learning the process",
    ],''',
    '''    week: 1,
    dateRange: "Mon 23 Feb \u2013 Fri 27 Feb",
    startDate: "2026-02-23",
    phase: "ramp",
    label: "First Week Out",
    daily: { revenue: 0, units: 0, meetings: 1, bookings: 7, calls: 47 },
    takeaways: [
      "Target: 15% book rate \u2014 47 calls to generate 7 bookings/day",
      "Minimum 7 bookings/day \u2014 you're booking out your buddy's calendar",
      "1 meeting/day observing your buddy \u2014 watch how they run the call",
      "No revenue expected \u2014 this is about building pipeline and learning the process",
    ],'''
)

# 4. Week 2: bookings 7, calls 70 → calls 35 (20% book rate)
content = content.replace(
    '''    week: 2,
    dateRange: "Mon 2 Mar \u2013 Fri 6 Mar",
    startDate: "2026-03-02",
    phase: "ramp",
    label: "Building Pipeline",
    daily: { revenue: 0, units: 0, meetings: 1, bookings: 7, calls: 70 },
    takeaways: [
      "Same rhythm as Week 1 \u2014 60\u201380 calls, 7 bookings/day minimum",
      "1 meeting/day observing \u2014 you should be picking up the structure and pitch",
      "Your pipeline is growing \u2014 the meetings you're booking now pay off in Week 3+",
      "Buddy is still leading meetings \u2014 focus on learning, not closing",
    ],''',
    '''    week: 2,
    dateRange: "Mon 2 Mar \u2013 Fri 6 Mar",
    startDate: "2026-03-02",
    phase: "ramp",
    label: "Building Pipeline",
    daily: { revenue: 0, units: 0, meetings: 1, bookings: 7, calls: 35 },
    takeaways: [
      "Target: 20% book rate \u2014 35 calls to hit 7 bookings/day",
      "12 fewer calls than Week 1 for the same bookings \u2014 your pitch is improving",
      "1 meeting/day observing \u2014 picking up the structure and close",
      "Buddy is still leading meetings \u2014 focus on learning, not closing",
    ],'''
)

# 5. Week 3: bookings 6, calls 60 → calls 30 (20% book rate)
content = content.replace(
    '''    week: 3,
    dateRange: "Mon 9 Mar \u2013 Fri 13 Mar",
    startDate: "2026-03-09",
    phase: "ramp",
    label: "Stepping Up",
    daily: { revenue: 100, units: 0.2, meetings: 2, bookings: 6, calls: 60 },
    takeaways: [
      "50\u201370 calls/day \u2014 meetings are taking more of your time now",
      "6 bookings/day minimum \u2014 efficiency improving as your pitch sharpens",
      "2 meetings/day \u2014 you start leading parts of the call with buddy support",
      "First deals expected \u2014 buddy is there to back you up on the close",
    ],''',
    '''    week: 3,
    dateRange: "Mon 9 Mar \u2013 Fri 13 Mar",
    startDate: "2026-03-09",
    phase: "ramp",
    label: "Stepping Up",
    daily: { revenue: 100, units: 0.2, meetings: 2, bookings: 6, calls: 30 },
    takeaways: [
      "Target: 20% book rate \u2014 30 calls to hit 6 bookings/day",
      "Half the calls of Week 1, still strong bookings \u2014 efficiency is compounding",
      "2 meetings/day \u2014 you start leading parts of the call with buddy support",
      "First deals expected \u2014 buddy is there to back you up on the close",
    ],'''
)

# 6. Week 4: bookings 6, calls 60 → calls 30 (20% book rate)
content = content.replace(
    '''    week: 4,
    dateRange: "Mon 16 Mar \u2013 Fri 20 Mar",
    startDate: "2026-03-16",
    phase: "ramp",
    label: "Cut-Loose Ready",
    daily: { revenue: 200, units: 0.4, meetings: 2, bookings: 6, calls: 60 },
    takeaways: [
      "Same as Week 3 \u2014 50\u201370 calls, 6 bookings, 2 meetings/day",
      "By end of this week, aim to be running meetings independently",
      "Don't cut your buddy prematurely \u2014 only go solo with 100% confidence",
      "Revenue building \u2014 close rate improving with every meeting you lead",
    ],''',
    '''    week: 4,
    dateRange: "Mon 16 Mar \u2013 Fri 20 Mar",
    startDate: "2026-03-16",
    phase: "ramp",
    label: "Cut-Loose Ready",
    daily: { revenue: 200, units: 0.4, meetings: 2, bookings: 6, calls: 30 },
    takeaways: [
      "20% book rate maintained \u2014 30 calls, 6 bookings, 2 meetings/day",
      "By end of this week, aim to be running meetings independently",
      "Don\u2019t cut your buddy prematurely \u2014 only go solo with 100% confidence",
      "Revenue building \u2014 close rate improving with every meeting you lead",
    ],'''
)

# 7. Week 5: bookings 4, calls 40 → calls 20 (20% book rate)
content = content.replace(
    '''    week: 5,
    dateRange: "Mon 23 Mar \u2013 Fri 27 Mar",
    startDate: "2026-03-23",
    phase: "ramp",
    label: "Nearly There",
    daily: { revenue: 400, units: 0.8, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "20 fewer calls/day, same bookings \u2014 call-to-book rate hits 10%, double Week 1",
      "Close rate at 40% \u2014 nearly at The Standard",
      "You're doing less activity for more output \u2014 that's the goal",
    ],''',
    '''    week: 5,
    dateRange: "Mon 23 Mar \u2013 Fri 27 Mar",
    startDate: "2026-03-23",
    phase: "ramp",
    label: "Nearly There",
    daily: { revenue: 400, units: 0.8, meetings: 2, bookings: 4, calls: 20 },
    takeaways: [
      "20% book rate \u2014 20 calls for 4 bookings/day, less than half of Week 1",
      "Close rate at 40% \u2014 nearly at The Standard",
      "You\u2019re doing less activity for more output \u2014 that\u2019s the goal",
    ],'''
)

# 8. Week 6 (Standard): calls 40 → 20
content = content.replace(
    '''    week: 6,
    dateRange: "Mon 30 Mar \u2013 Fri 3 Apr",
    startDate: "2026-03-30",
    phase: "standard",
    label: "\ud83c\udfaf The Standard",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },
    takeaways: [
      "1 deal per day \u2014 this is the benchmark you maintain from here",
      "10% call-to-book, 50% show rate, 50% close rate \u2014 every metric is optimised",
      "33% fewer calls than Week 1, but 5x the revenue \u2014 efficiency wins",
    ],''',
    '''    week: 6,
    dateRange: "Mon 30 Mar \u2013 Fri 3 Apr",
    startDate: "2026-03-30",
    phase: "standard",
    label: "\ud83c\udfaf The Standard",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 20 },
    takeaways: [
      "1 deal per day \u2014 this is the benchmark you maintain from here",
      "20% book rate, 50% show rate, 50% close rate \u2014 every metric is optimised",
      "Less than half the calls of Week 1, but generating $500/day \u2014 efficiency wins",
    ],'''
)

# 9. Week 7: calls 40 → 20
content = content.replace(
    '''    week: 7,
    dateRange: "Mon 6 Apr \u2013 Fri 10 Apr",
    startDate: "2026-04-06",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },''',
    '''    week: 7,
    dateRange: "Mon 6 Apr \u2013 Fri 10 Apr",
    startDate: "2026-04-06",
    phase: "maintain",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 20 },'''
)

# 10. Week 8: calls 40 → 20
content = content.replace(
    '''    week: 8,
    dateRange: "Mon 13 Apr \u2013 Fri 17 Apr",
    startDate: "2026-04-13",
    phase: "maintain",
    label: "Fully Operational",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },''',
    '''    week: 8,
    dateRange: "Mon 13 Apr \u2013 Fri 17 Apr",
    startDate: "2026-04-13",
    phase: "maintain",
    label: "Fully Operational",
    daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 20 },'''
)

# 11. Add 0-meetings row to Rules of Thumb table
# Find the existing table rows and prepend the new row
content = content.replace(
    '1 hour = 1 meeting <strong>OR</strong> minimum 1 booking.',
    '1 hour = 1 meeting <strong>OR</strong> minimum 1 booking. By Week 1 aim for 15% book rate, Week 2 onwards aim for 20%.'
)

# Find the first data row (1 meeting) and add 0 meetings before it
content = content.replace(
    '''                <tr className="bg-slate-50">
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">1</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">6</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">60</td>
                </tr>''',
    '''                <tr className="bg-indigo-50">
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">0</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">7</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">70</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">1</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">6</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">60</td>
                </tr>'''
)

# 12. Update Key Observations
content = content.replace(
    '''300 calls/week down to 200 by The Standard.
                Call-to-booking rate doubles from 5% to 10% \u2014 fewer calls, better results.''',
    '''Book rate improves from 15% in Week 1 to 20% from Week 2 onwards.
                47 calls/day drops to just 20 at The Standard \u2014 fewer calls, better results.'''
)

open('app/roadmap/page.tsx', 'w').write(content)
print("Done — Rules of Thumb row added, calls adjusted for 15%/20% book rates, standard updated to 20 calls/day")
