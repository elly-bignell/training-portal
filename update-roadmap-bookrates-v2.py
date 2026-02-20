#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 update-roadmap-bookrates-v2.py

content = open('app/roadmap/page.tsx').read()
changes = 0

# ── Week 1: 60 calls → 40 (15% book rate: 6 bookings / 0.15 = 40) ──
old = 'daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 60 },\n    takeaways: [\n      "60 calls/day — volume is everything this week",'
new = 'daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 40 },\n    takeaways: [\n      "15% book rate — 40 calls to generate 6 bookings/day",'
if old in content:
    content = content.replace(old, new, 1)
    changes += 1
    print("✓ Week 1: 60 → 40 calls")
else:
    print("✗ Week 1: pattern not found")

# ── Week 2: 60 calls → 30 (20% book rate: 6 bookings / 0.20 = 30) ──
old = 'daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 60 },\n    takeaways: [\n      "Same rhythm as Week 1 — 60 calls, 6 bookings, 1 meeting observing",'
new = 'daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 30 },\n    takeaways: [\n      "20% book rate — 30 calls for 6 bookings/day, 10 fewer than Week 1",'
if old in content:
    content = content.replace(old, new, 1)
    changes += 1
    print("✓ Week 2: 60 → 30 calls")
else:
    print("✗ Week 2: pattern not found")

# ── Week 3: 60 calls → 30 ──
old = 'daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 60 },\n    takeaways: [\n      "Same targets — 60 calls, 6 bookings, 1 meeting observing",'
new = 'daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 30 },\n    takeaways: [\n      "20% book rate maintained — 30 calls, 6 bookings, 1 meeting observing",'
if old in content:
    content = content.replace(old, new, 1)
    changes += 1
    print("✓ Week 3: 60 → 30 calls")
else:
    print("✗ Week 3: pattern not found")

# ── Week 4: 60 calls → 30 ──
old = 'daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 60 },\n    takeaways: [\n      "Last week at 60 calls / 6 bookings / 1 meeting — you\'ve built the foundation",'
new = 'daily: { revenue: 250, units: 0.5, meetings: 1, bookings: 6, calls: 30 },\n    takeaways: [\n      "Last week at 30 calls / 6 bookings / 1 meeting — your 20% book rate is locked in",'
if old in content:
    content = content.replace(old, new, 1)
    changes += 1
    print("✓ Week 4: 60 → 30 calls")
else:
    print("✗ Week 4: pattern not found")

# ── Week 5: 50 calls → 25 (20% book rate: 5 bookings / 0.20 = 25) ──
old = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 50 },\n    takeaways: [\n      "50 calls/day, 5 bookings — meetings are taking more of your time now",'
new = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 25 },\n    takeaways: [\n      "20% book rate — 25 calls for 5 bookings, meetings are taking more of your time",'
if old in content:
    content = content.replace(old, new, 1)
    changes += 1
    print("✓ Week 5: 50 → 25 calls")
else:
    print("✗ Week 5: pattern not found")

# ── Week 6: 50 calls → 25 ──
old = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 50 },\n    takeaways: [\n      "Same as Week 5 — 50 calls, 5 bookings, 2 meetings/day",'
new = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 25 },\n    takeaways: [\n      "Same as Week 5 — 25 calls, 5 bookings, 2 meetings/day",'
if old in content:
    content = content.replace(old, new, 1)
    changes += 1
    print("✓ Week 6: 50 → 25 calls")
else:
    print("✗ Week 6: pattern not found")

# ── Week 7: 50 calls → 25 ──
old = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 50 },\n    takeaways: [\n      "First week running meetings solo — 100% of each deal counts towards your target",'
new = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 5, calls: 25 },\n    takeaways: [\n      "First week running meetings solo — 100% of each deal counts towards your target",'
if old in content:
    content = content.replace(old, new, 1)
    changes += 1
    print("✓ Week 7: 50 → 25 calls")
else:
    print("✗ Week 7: pattern not found")

# ── Week 8 (The Standard): 40 calls → 20 ──
old = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 },\n    takeaways: [\n      "Fully proficient closed-circuit selling — you own the entire process",\n      "40 calls, 4 bookings, 2 meetings — maximum efficiency, minimum waste",'
new = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 20 },\n    takeaways: [\n      "Fully proficient closed-circuit selling — you own the entire process",\n      "20 calls, 4 bookings, 2 meetings — 20% book rate at peak efficiency",'
if old in content:
    content = content.replace(old, new, 1)
    changes += 1
    print("✓ Week 8 (Standard): 40 → 20 calls")
else:
    print("✗ Week 8: pattern not found")

# ── Weeks 9-16 (Maintain): all 40 calls → 20 ──
# These all share the same daily line, do a global replace for remaining instances
old_maintain = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 40 }'
new_maintain = 'daily: { revenue: 500, units: 1, meetings: 2, bookings: 4, calls: 20 }'
maintain_count = content.count(old_maintain)
if maintain_count > 0:
    content = content.replace(old_maintain, new_maintain)
    changes += maintain_count
    print(f"✓ Weeks 9-16: {maintain_count} remaining instances of 40 → 20 calls")
else:
    print("✗ Weeks 9-16: no remaining 40-call instances found")

# ── Rules of Thumb: add 0-meetings row ──
old_rot = '''<tr className="bg-slate-50">
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">1</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">6</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">60</td>
                </tr>'''
new_rot = '''<tr className="bg-indigo-50">
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">0</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">7</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">70</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">1</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">6</td>
                  <td className="py-2.5 px-4 text-center font-bold text-indigo-900 border-b border-slate-200">60</td>
                </tr>'''
if old_rot in content:
    content = content.replace(old_rot, new_rot, 1)
    changes += 1
    print("✓ Rules of Thumb: added 0-meetings row")
else:
    print("✗ Rules of Thumb: pattern not found")

# ── Rules of Thumb subtitle: add book rate note ──
old_sub = '1 hour = 1 meeting <strong>OR</strong> minimum 1 booking.'
new_sub = '1 hour = 1 meeting <strong>OR</strong> minimum 1 booking. Week 1: aim for 15% book rate. Week 2 onwards: aim for 20%.'
if old_sub in content:
    content = content.replace(old_sub, new_sub, 1)
    changes += 1
    print("✓ Rules of Thumb: added book rate note")
else:
    print("✗ Rules of Thumb subtitle: pattern not found")

# ── Key Observations: update calls/efficiency card ──
old_obs = '300 calls/week down to 200 by The Standard.\n                Call-to-booking rate doubles from 5% to 10%'
new_obs = 'Book rate improves from 15% in Week 1 to 20% from Week 2 onwards.\n                40 calls/day drops to just 20 at The Standard'
if old_obs in content:
    content = content.replace(old_obs, new_obs, 1)
    changes += 1
    print("✓ Key Observations: updated efficiency card")
else:
    # Try alternate text that may exist
    print("ℹ Key Observations: original pattern not found (may already be updated or different)")

open('app/roadmap/page.tsx', 'w').write(content)
print(f"\nDone — {changes} changes applied")
