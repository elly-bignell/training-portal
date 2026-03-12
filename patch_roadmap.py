#!/usr/bin/env python3
"""Patch roadmap/page.tsx with correct weekly standards.

Meetings in daily = funnel output (bookings x attend rate), NOT observation slots.
Observation slots noted in takeaways text only.

W1-4:  6hrs, 60 connects, 6 bkgs -> 2.1 attended -> 1.15 deals -> $462
W5-6:  5hrs, 50 connects, 5 bkgs -> 1.75 attended -> 0.96 deals -> $385
W7-8+: 4hrs, 40 connects, 4 bkgs, 3 meetings, 1.5 deals, $600 (solo)
"""

filepath = "app/roadmap/page.tsx"

with open(filepath, "r") as f:
    content = f.read()

def replace_week(content, week_num, new_daily, new_takeaways):
    week_marker = f"    week: {week_num},"
    idx = content.find(week_marker)
    if idx == -1:
        print(f"  ⚠️  Week {week_num} not found")
        return content
    
    daily_start = content.find("    daily: {", idx)
    if daily_start == -1 or daily_start > idx + 500:
        return content
    daily_end = content.find("},", daily_start) + 2
    
    ta_start = content.find("    takeaways: [", daily_end)
    if ta_start == -1 or ta_start > daily_end + 50:
        return content
    ta_end = content.find("    ],", ta_start) + 6
    
    daily_str = f"    daily: {{ revenue: {new_daily['revenue']}, units: {new_daily['units']}, meetings: {new_daily['meetings']}, bookings: {new_daily['bookings']}, calls: {new_daily['calls']} }},"
    
    ta_lines = '    takeaways: [\n'
    for t in new_takeaways:
        ta_lines += f'      "{t}",\n'
    ta_lines += '    ],'
    
    replacement = daily_str + "\n" + ta_lines
    content = content[:daily_start] + replacement + content[ta_end:]
    print(f"  ✅ Week {week_num}")
    return content


# ═══ W1-4: 6hrs, 6 bookings, 2.1 meetings (funnel), 1.15 deals, $462 ═══
w14 = { "revenue": 462, "units": 1.15, "meetings": 2.1, "bookings": 6, "calls": 60 }

content = replace_week(content, 1, w14, [
    "6 hours on the phones — 108 dials, 60 connects, 6 bookings/day",
    "Focus: pipeline building — fill the calendar with quality meetings for your buddy",
    "6 bookings → 35% attend → 2.1 meetings → 55% close → 1.15 deals → $462/day",
    "You own: calls, connects, bookings. Your buddy owns: attending + closing",
    "Plus 1 meeting observation per day — learn the pitch, objections, close",
])

content = replace_week(content, 2, w14, [
    "6 hours calling — 108 dials, 60 connects, 6 bookings/day",
    "Same targets as Week 1 — lock in the rhythm and build consistency",
    "6 bookings → 2.1 attended → 1.15 deals → $462/day (buddy closes)",
    "You own: calls, connects, bookings. Buddy owns: attending + closing",
    "Plus 1 meeting observation per day — watch how your buddy handles objections",
])

content = replace_week(content, 3, w14, [
    "6 hours calling — same rhythm, locking in consistency",
    "Your booking quality should be improving — better prospects, fewer no-shows",
    "6 bookings → 2.1 attended → 1.15 deals → $462/day (buddy closes)",
    "You own: calls, connects, bookings. Buddy owns: attending + closing",
    "Plus 1 meeting observation per day — learn from every meeting",
])

content = replace_week(content, 4, w14, [
    "6 hours calling — last week at full calling capacity",
    "Next week you step up — your buddy will start handing you the reins",
    "6 bookings → 2.1 attended → 1.15 deals → $462/day (buddy closes)",
    "You own: calls, connects, bookings. Buddy owns: attending + closing",
    "Plus 1 meeting observation per day — ready to transition next week",
])


# ═══ W5-6: 5hrs, 5 bookings, 1.75 meetings (funnel), 0.96 deals, $385 ═══
w56 = { "revenue": 385, "units": 0.96, "meetings": 1.75, "bookings": 5, "calls": 50 }

content = replace_week(content, 5, w56, [
    "5 hours calling — 90 dials, 50 connects, 5 bookings/day",
    "5 bookings → 35% attend → 1.75 meetings → 55% close → 0.96 deals → $385/day",
    "1 fewer booking but you\\'re now in 2 meetings/day — start leading with buddy backup",
    "You own: calls, connects, bookings + starting to take the reins in meetings",
])

content = replace_week(content, 6, w56, [
    "Same as Week 5 — 5 hours calling, 90 dials, 50 connects, 5 bookings/day",
    "5 bookings → 1.75 attended → 0.96 deals → $385/day",
    "Last week with buddy support — prove you\\'re ready to go solo",
    "Don\\'t cut your buddy prematurely — only go solo with 100% confidence",
])


# ═══ W7: Solo — 4hrs, 4 bookings, 3 meetings, 1.5 deals, $600 ═══
w7 = { "revenue": 600, "units": 1.5, "meetings": 3, "bookings": 4, "calls": 40 }

content = replace_week(content, 7, w7, [
    "Flying solo — 4 hours calling, 72 dials, 40 connects, 4 bookings, 3 meetings/day",
    "100% of each deal counts towards your target — you own the entire process",
    "Your follow-up pipeline from buddy weeks feeds your calendar with warm leads",
    "4 bookings + warm pipeline → 3 meetings → 1.5 deals/day → $600/day, $3,000/week",
])


# ═══ W8: The Standard ═══
w8 = { "revenue": 600, "units": 1.5, "meetings": 3, "bookings": 4, "calls": 40 }

content = replace_week(content, 8, w8, [
    "The Standard — 4 hours calling, 72 dials, 40 connects, 4 bookings, 3 meetings/day",
    "Fully proficient closed-circuit selling — you own the entire process end to end",
    "Your warm lead pipeline reduces cold call dependency — follow-ups convert easier",
    "1.5 deals/day, $600 revenue. The Standard is your floor, not your ceiling",
])


# ═══ W9-16: Maintain = same daily as W8 ═══
maintain = { "revenue": 600, "units": 1.5, "meetings": 3, "bookings": 4, "calls": 40 }

maintain_ta = {
    9: [
        "Same standard — 4hrs calling, 4 bookings, 3 meetings, 1.5 deals/day",
        "Your follow-up pipeline is your goldmine — warm leads are your easiest wins",
        "Increasing booking efficiency means fewer cold dials for the same output",
    ],
    10: [
        "Same standard — booking efficiency should be climbing each week",
        "Pitch strength is your biggest lever — stronger pitch = more bookings from fewer calls",
        "Every percentage point improvement in close rate is more revenue on the same activity",
    ],
    11: [
        "Same standard — time on phones may reduce as booking efficiency increases",
        "Pre-meeting prep separates good from great — research every prospect",
        "Warm lead follow-ups should be generating bookings with minimal effort",
    ],
    12: [
        "Same standard — your call:booking ratio should be noticeably better than Week 8",
        "Higher efficiency = opportunity to close MORE deals if you choose to push",
        "Track prospects that didn\\'t close but showed interest — they\\'re your next meetings",
    ],
    13: [
        "Same standard — consistency is king. Same effort, same output, every week",
        "As efficiency improves, you can reduce time on phones or increase deal volume",
        "Close rate should be trending upward as you refine your pitch",
    ],
    14: [
        "Same standard — 3 months of solo selling under your belt",
        "Warm leads + repeat referrals start forming a meaningful part of your pipeline",
        "Higher booking quality means better close rates with the same meeting volume",
    ],
    15: [
        "Same standard — pipeline should be self-sustaining with warm leads and referrals",
        "More bookings per hour means more meetings, more closes, more revenue",
        "Efficiency gains compound — small improvements each week add up to big results",
    ],
    16: [
        "Same standard — 4 months of consistency. Your pipeline is a machine",
        "Warm lead efficiency means better call:booking ratios with less effort",
        "The Standard is your floor — increased efficiency is your opportunity to exceed it",
    ],
}

for w in range(9, 17):
    content = replace_week(content, w, maintain, maintain_ta.get(w, maintain_ta[16]))


# ═══ Update standardDaily ═══
content = content.replace(
    "const standardDaily = { revenue: 600, units: 1.5, meetings: 3, bookings: 4, calls: 20 };",
    "const standardDaily = { revenue: 600, units: 1.5, meetings: 3, bookings: 4, calls: 40 };"
)
print("  ✅ standardDaily (calls 20→40)")

with open(filepath, "w") as f:
    f.write(content)

print("\n✅ Roadmap patched!")
print("\nW1-4:  6hrs, 60 connects, 6 bkgs, 2.1 meetings (funnel), 1.15 deals, $462")
print("       + 1 observation/day noted in takeaways")
print("W5-6:  5hrs, 50 connects, 5 bkgs, 1.75 meetings (funnel), 0.96 deals, $385")
print("       + 2 meetings/day (taking reins) noted in takeaways")
print("W7-8+: 4hrs, 40 connects, 4 bkgs, 3 meetings, 1.5 deals, $600 (solo)")
