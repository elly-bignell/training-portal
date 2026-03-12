#!/usr/bin/env python3
"""Patch roadmap/page.tsx with correct weekly standards.

W1-4:  6hrs, 108 dials, 60 connects, 6 bookings, 1 meeting (observe buddy)
W5-6:  5hrs, 90 dials, 50 connects, 5 bookings, 2 meetings (taking reins)
W7:    4hrs, 72 dials, 40 connects, 4 bookings, 3 meetings (flying solo)
W8-16: Same as W7/8 - The Standard. Increasing efficiencies.
"""

import re

filepath = "app/roadmap/page.tsx"

with open(filepath, "r") as f:
    lines = f.readlines()

content = "".join(lines)

# ═══════════════════════════════════════
# Helper: replace a week's daily + takeaways
# ═══════════════════════════════════════

def replace_week(content, week_num, new_daily, new_takeaways):
    """Find the week block and replace daily + takeaways."""
    # Pattern: find `week: N,` then find the `daily:` line and `takeaways:` block
    # We look for the daily line after the specific week number
    
    # Find the week marker
    week_marker = f"    week: {week_num},"
    idx = content.find(week_marker)
    if idx == -1:
        print(f"  ⚠️  Week {week_num} not found, skipping")
        return content
    
    # Find daily: { ... } after this week marker
    daily_start = content.find("    daily: {", idx)
    if daily_start == -1 or daily_start > idx + 500:
        print(f"  ⚠️  daily: not found for week {week_num}")
        return content
    daily_end = content.find("},", daily_start) + 2
    
    # Find takeaways: [ ... ] after daily
    ta_start = content.find("    takeaways: [", daily_end)
    if ta_start == -1 or ta_start > daily_end + 50:
        print(f"  ⚠️  takeaways: not found for week {week_num}")
        return content
    ta_end = content.find("    ],", ta_start) + 6
    
    # Build replacement
    daily_str = f"    daily: {{ revenue: {new_daily['revenue']}, units: {new_daily['units']}, meetings: {new_daily['meetings']}, bookings: {new_daily['bookings']}, calls: {new_daily['calls']} }},"
    
    ta_lines = '    takeaways: [\n'
    for t in new_takeaways:
        escaped = t.replace("'", "\\'")
        ta_lines += f'      "{escaped}",\n'
    ta_lines += '    ],'
    
    replacement = daily_str + "\n" + ta_lines
    
    content = content[:daily_start] + replacement + content[ta_end:]
    print(f"  ✅ Week {week_num} updated")
    return content


# ═══════════════════════════════════════
# WEEK DEFINITIONS
# ═══════════════════════════════════════

# W1-4: 6hrs calling, 1 meeting observe
w1_4_daily = { "revenue": 462, "units": 1.15, "meetings": 1, "bookings": 6, "calls": 60 }

w1_takeaways = [
    "6 hours on the phones — 108 dials, 60 connected calls, 6 bookings/day (1 booking per hour)",
    "Focus: pipeline building — fill the calendar with quality meetings for your buddy",
    "1 meeting/day — observe your buddy closing. Learn the pitch, objections, close",
    "You own: calls, connects, bookings. Your buddy owns: attending meetings + closing deals",
]

w2_takeaways = [
    "6 hours calling + 1 meeting — 108 dials, 60 connects, 6 bookings/day",
    "Same targets as Week 1 — lock in the rhythm and build consistency",
    "Your pipeline is growing — the bookings you make fill your buddy\\'s calendar",
    "You own: calls, connects, bookings. Buddy closes: 35% attend x 55% close = ~1.15 deals/day",
]

w3_takeaways = [
    "6 hours calling + 1 meeting — same rhythm, locking in consistency",
    "Your booking quality should be improving — better prospects, fewer no-shows",
    "Learn from every meeting — what objections come up, how does your buddy handle them?",
    "You own: calls, connects, bookings. Buddy closes: ~5.75 deals/week, $2,310 revenue",
]

w4_takeaways = [
    "6 hours calling + 1 meeting — last week at full calling capacity",
    "Next week you step up to 2 meetings/day — your buddy will start handing you the reins",
    "Your booking rhythm is locked in — now it\\'s about quality over quantity",
    "You own: calls, connects, bookings. Buddy closes: ~5.75 deals/week, $2,310 revenue",
]

# W5-6: 5hrs calling, 2 meetings taking reins
w5_6_daily = { "revenue": 385, "units": 0.96, "meetings": 2, "bookings": 5, "calls": 50 }

w5_takeaways = [
    "5 hours calling + 2 meetings — 90 dials, 50 connects, 5 bookings/day",
    "2 meetings/day — you start leading the call with buddy backup",
    "1 fewer booking but 1 more meeting — you\\'re transitioning from pipeline to closing",
    "You own: calls, connects, bookings. Start taking the reins in meetings",
]

w6_takeaways = [
    "Same as Week 5 — 5 hours calling, 90 dials, 50 connects, 5 bookings, 2 meetings/day",
    "This is your last week with buddy support — prove you\\'re ready to go solo",
    "Don\\'t cut your buddy prematurely — only go solo with 100% confidence",
    "You own: calls, connects, bookings + starting to close with buddy backup",
]

# W7: Solo
w7_daily = { "revenue": 600, "units": 1.5, "meetings": 3, "bookings": 4, "calls": 40 }

w7_takeaways = [
    "Flying solo — 4 hours calling, 72 dials, 40 connects, 4 bookings, 3 meetings/day",
    "100% of each deal counts towards your target — you own the entire process",
    "Your follow-up pipeline from buddy weeks feeds your calendar with warm leads",
    "1.5 deals/day x $400 = $600/day, $3,000/week — this is The Standard",
]

# W8: The Standard
w8_daily = { "revenue": 600, "units": 1.5, "meetings": 3, "bookings": 4, "calls": 40 }

w8_takeaways = [
    "The Standard — 4 hours calling, 72 dials, 40 connects, 4 bookings, 3 meetings/day",
    "Fully proficient closed-circuit selling — you own the entire process end to end",
    "Your warm lead pipeline reduces cold call dependency — follow-ups convert easier",
    "The Standard is your floor, not your ceiling — keep pushing",
]

# W9-16: Maintain — same daily as W8, varying takeaways about efficiency
maintain_daily = { "revenue": 600, "units": 1.5, "meetings": 3, "bookings": 4, "calls": 40 }

maintain_takeaways = {
    9: [
        "Same standard — 4hrs calling, 4 bookings, 3 meetings, 1.5 deals/day",
        "Your follow-up pipeline is your goldmine — warm leads are your easiest wins",
        "Increasing booking efficiency means fewer cold dials for the same output",
    ],
    10: [
        "Same standard — your booking efficiency should be climbing each week",
        "Pitch strength is your biggest lever — a stronger pitch = more bookings from fewer calls",
        "Every percentage point improvement in close rate is more revenue on the same activity",
    ],
    11: [
        "Same standard — time on phones may reduce as booking efficiency increases",
        "Pre-meeting prep separates good from great — research every prospect before you sit down",
        "Warm lead follow-ups should be generating bookings with minimal effort",
    ],
    12: [
        "Same standard — your call:booking ratio should be noticeably better than Week 8",
        "Higher efficiency = opportunity to close MORE deals if you choose to push",
        "Track which prospects didn\\'t close but showed interest — they\\'re your next meetings",
    ],
    13: [
        "Same standard — consistency is king. Same effort, same output, every week",
        "As efficiency improves, you can either reduce time on phones or increase deal volume",
        "Your close rate should be trending upward as you refine your pitch and objection handling",
    ],
    14: [
        "Same standard — 3 months of solo selling under your belt",
        "Warm leads + repeat referrals start to form a meaningful part of your pipeline",
        "Higher booking quality means better close rates with the same meeting volume",
    ],
    15: [
        "Same standard — your pipeline should be self-sustaining with warm leads and referrals",
        "Opportunity: more bookings per hour means more meetings, more closes, more revenue",
        "Efficiency gains compound — small improvements each week add up to big results",
    ],
    16: [
        "Same standard — 4 months of consistency. Your pipeline is a machine",
        "Warm lead efficiency means better call:booking ratios with less effort",
        "The Standard is your floor — increased efficiency is your opportunity to exceed it",
    ],
}


# ═══════════════════════════════════════
# APPLY PATCHES
# ═══════════════════════════════════════

print("Patching roadmap...")
print("")

# W1-4
content = replace_week(content, 1, w1_4_daily, w1_takeaways)
content = replace_week(content, 2, w1_4_daily, w2_takeaways)
content = replace_week(content, 3, w1_4_daily, w3_takeaways)
content = replace_week(content, 4, w1_4_daily, w4_takeaways)

# W5-6
content = replace_week(content, 5, w5_6_daily, w5_takeaways)
content = replace_week(content, 6, w5_6_daily, w6_takeaways)

# W7
content = replace_week(content, 7, w7_daily, w7_takeaways)

# W8
content = replace_week(content, 8, w8_daily, w8_takeaways)

# W9-16
for w in range(9, 17):
    ta = maintain_takeaways.get(w, maintain_takeaways[16])
    content = replace_week(content, w, maintain_daily, ta)

# Update standardDaily
content = content.replace(
    "const standardDaily = { revenue: 600, units: 1.5, meetings: 3, bookings: 4, calls: 20 };",
    "const standardDaily = { revenue: 600, units: 1.5, meetings: 3, bookings: 4, calls: 40 };"
)
print("")
print("  ✅ standardDaily updated (calls: 20 → 40)")

with open(filepath, "w") as f:
    f.write(content)

print("")
print("═══════════════════════════════════════")
print("✅ Roadmap patched successfully!")
print("═══════════════════════════════════════")
print("")
print("Summary:")
print("  W1-4:  6hrs, 60 connects, 6 bookings, 1 meeting (observe buddy)")
print("  W5-6:  5hrs, 50 connects, 5 bookings, 2 meetings (taking reins)")
print("  W7:    4hrs, 40 connects, 4 bookings, 3 meetings (flying solo)")
print("  W8-16: Same as W8 — The Standard. Efficiency increasing.")
print("  standardDaily calls: 20 → 40")
print("  All takeaways updated with ownership clarity")
