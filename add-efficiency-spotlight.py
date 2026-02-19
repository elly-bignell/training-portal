#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 add-efficiency-spotlight.py

content = open('components/PerformanceSummary.tsx').read()

# Find the spot between the two tables — after the Calls & Bookings footer div, before the MUR table
old = '''      {/* ── Meetings, Units & Revenue Table ── */}'''

spotlight = '''      {/* ── Efficiency Spotlight ── */}
      {(() => {
        // Find the best conversion rate across all individuals
        const allMemberData = teams.flatMap((t) => t.members).map((s) => dataMap.get(s)).filter(Boolean) as TraineeWeekData[];
        let bestRate = 0;
        let bestName = "";
        allMemberData.forEach((td) => {
          if (td.totals.calls > 0) {
            const rate = td.totals.bookings / td.totals.calls;
            if (rate > bestRate) {
              bestRate = rate;
              bestName = td.name.split(" ")[0];
            }
          }
        });
        const bestPct = Math.round(bestRate * 100);
        if (bestPct === 0) return null;

        const targets = [
          { bookings: 6, label: "6 bookings", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: "🔥" },
          { bookings: 5, label: "5 bookings", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: "⚡" },
          { bookings: 4, label: "4 bookings", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: "📞" },
        ];

        return (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">📐 Efficiency Spotlight</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Best call-to-booking rate this week: <span className="text-white font-bold text-sm">{bestPct}%</span> <span className="text-slate-400">({bestName})</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">At this rate, to hit daily targets you need:</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {targets.map((t) => {
                const callsNeeded = Math.ceil(t.bookings / bestRate);
                return (
                  <div key={t.bookings} className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">{t.icon}</div>
                    <div className="text-2xl font-bold text-white">{callsNeeded} calls</div>
                    <div className="text-xs text-slate-300 mt-1">→ {t.bookings} bookings</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">at {bestPct}% conversion</div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 mt-3 text-center">
              As your conversion improves, fewer calls = same bookings. That&apos;s the goal.
            </p>
          </div>
        );
      })()}

      {/* ── Meetings, Units & Revenue Table ── */}'''

content = content.replace(old, spotlight, 1)

open('components/PerformanceSummary.tsx', 'w').write(content)
print("Done — added Efficiency Spotlight between the two tables")
