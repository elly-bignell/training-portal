#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 persist-spotlight.py

content = open('components/PerformanceSummary.tsx').read()

# Replace the spotlight's rate calculation logic to use localStorage persistence
old = '''        // Find the best conversion rate across all individuals
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
        if (bestPct === 0) return null;'''

new = '''        // Find the best conversion rate across all individuals
        const allMemberData = teams.flatMap((t) => t.members).map((s) => dataMap.get(s)).filter(Boolean) as TraineeWeekData[];
        let liveBestRate = 0;
        let liveBestName = "";
        allMemberData.forEach((td) => {
          if (td.totals.calls > 0) {
            const rate = td.totals.bookings / td.totals.calls;
            if (rate > liveBestRate) {
              liveBestRate = rate;
              liveBestName = td.name.split(" ")[0];
            }
          }
        });

        // Persist the highest rate seen — survives week resets
        let bestRate = liveBestRate;
        let bestName = liveBestName;
        try {
          const stored = JSON.parse(localStorage.getItem("spotlight_best") || "{}");
          if (stored.rate && stored.rate > liveBestRate) {
            // Stored rate is higher (e.g. new week, data reset) — keep it
            bestRate = stored.rate;
            bestName = stored.name || "—";
          }
          // Save if current is higher or equal (keeps it fresh)
          if (liveBestRate >= (stored.rate || 0)) {
            localStorage.setItem("spotlight_best", JSON.stringify({ rate: liveBestRate, name: liveBestName }));
          }
        } catch {
          // localStorage unavailable — just use live data
        }

        const bestPct = Math.round(bestRate * 100);
        if (bestPct === 0) return null;'''

content = content.replace(old, new, 1)

open('components/PerformanceSummary.tsx', 'w').write(content)
print("Done — spotlight now persists best rate across week resets")
