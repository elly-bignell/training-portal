#!/usr/bin/env python3
"""Patch roadmap rendering:
1. Round daily display values (1.15→1, $462→$460, 2.1→2)
2. Add 'Led by Buddy' on Revenue, Units, Meetings for buddy weeks
3. Add 'You Attend X Per Day' under Meetings for buddy weeks
4. Avg Deal always $400
"""

filepath = "app/roadmap/page.tsx"

with open(filepath, "r") as f:
    content = f.read()

# ═══════════════════════════════════════
# 1. Replace the fmtWeekly/fmtDaily computation to round values
# ═══════════════════════════════════════

old_fmt = '''const fmtWeekly = m.format === "currency" ? formatCurrency(weeklyVal) : formatNumber(weeklyVal);
                          const fmtDaily = m.format === "currency" ? formatCurrency(dailyVal) : formatNumber(dailyVal);'''

new_fmt = '''// Round display values: units/meetings to nearest int, revenue to nearest $10
                          const roundedWeekly = m.format === "currency" ? Math.round(weeklyVal / 10) * 10 : Math.round(weeklyVal);
                          const roundedDaily = m.format === "currency" ? Math.round(dailyVal / 10) * 10 : Math.round(dailyVal);
                          const fmtWeekly = m.format === "currency" ? formatCurrency(roundedWeekly) : formatNumber(roundedWeekly);
                          const fmtDaily = m.format === "currency" ? formatCurrency(roundedDaily) : formatNumber(roundedDaily);
                          const isBuddyMetric = isBuddy && (m.key === "revenue" || m.key === "units" || m.key === "meetings");'''

content = content.replace(old_fmt, new_fmt)
print("  ✅ Rounded display values + isBuddyMetric flag")

# ═══════════════════════════════════════
# 2. Replace the metric label to show "Led by Buddy" for buddy metrics
# ═══════════════════════════════════════

old_label = '''<div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-1">
                                  {m.label}
                                </div>'''

new_label = '''<div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-0.5">
                                  {m.label}
                                </div>
                                {isBuddyMetric && (
                                  <div className="text-[8px] text-amber-600 font-bold uppercase tracking-wide mb-1">Led by Buddy</div>
                                )}'''

content = content.replace(old_label, new_label, 1)
# Only replace the FIRST occurrence (in the weekly cards, not the standard banner)
print("  ✅ Added 'Led by Buddy' label")

# ═══════════════════════════════════════
# 3. Add observation note under Meetings box
# Replace the existing revenue "50% put towards" block to also include meetings note
# ═══════════════════════════════════════

old_revenue_note = '''{isBuddy && m.key === "revenue" && weeklyVal > 0 && (
                                  <div className="mt-1 text-[10px] font-normal text-amber-600">
                                    50% put towards your<br />monthly target
                                  </div>
                                )}'''

new_notes = '''{isBuddy && m.key === "revenue" && weeklyVal > 0 && (
                                  <div className="mt-1 text-[10px] font-normal text-amber-600">
                                    50% put towards your<br />monthly target
                                  </div>
                                )}
                                {isBuddy && m.key === "meetings" && (
                                  <div className="mt-1 text-[9px] font-bold text-sky-600">
                                    {w.week <= 4 ? "You attend 1/day" : "You attend 2/day"}
                                  </div>
                                )}'''

content = content.replace(old_revenue_note, new_notes)
print("  ✅ Added observation note under Meetings")

# ═══════════════════════════════════════
# 4. Force Avg Deal to always show $400 (not computed from data)
# The revenuePerUnit is computed as daily.revenue / daily.units which gives
# $401.739... for W1-4. Override it.
# ═══════════════════════════════════════

old_rpu = "revenuePerUnit: daily.units > 0 ? daily.revenue / daily.units : 0,"
new_rpu = "revenuePerUnit: 400,"

content = content.replace(old_rpu, new_rpu)
print("  ✅ Avg Deal forced to $400")

# ═══════════════════════════════════════
# 5. Also round the standard banner daily values
#    The standard banner uses standardDaily directly, which already has clean numbers
#    But let's also round in the standard banner just in case
# ═══════════════════════════════════════

# The standard banner at ~line 500 uses:
#   {m.format === "currency" ? formatCurrency(standardDaily[m.key]) : formatNumber(standardDaily[m.key])}
# These should already be clean (600, 1.5, 3, 4, 40) so no change needed.

with open(filepath, "w") as f:
    f.write(content)

print("")
print("✅ Roadmap rendering patched!")
print("")
print("Changes:")
print("  - Daily values rounded: 1.15→1, $462→$460, 2.1→2, etc")
print("  - Revenue, Units, Meetings show 'Led by Buddy' label on W1-6")
print("  - Meetings box shows 'You attend 1/day' (W1-4) or 'You attend 2/day' (W5-6)")
print("  - Avg Deal always shows $400")
