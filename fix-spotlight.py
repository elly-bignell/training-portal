#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 fix-spotlight.py

content = open('components/PerformanceSummary.tsx').read()

old = '''            <div className="grid grid-cols-3 gap-4">
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
            </div>'''

new = '''            <div className="grid grid-cols-3 gap-4">
              {targets.map((t) => {
                const callsNeeded = Math.ceil(t.bookings / bestRate);
                return (
                  <div key={t.bookings} className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <div className="text-2xl font-bold text-white">{t.bookings} bookings</div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-slate-500">=</span>
                      <span className="text-lg font-bold text-slate-300">{callsNeeded} calls</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">at {bestPct}% conversion</div>
                  </div>
                );
              })}
            </div>'''

content = content.replace(old, new, 1)

open('components/PerformanceSummary.tsx', 'w').write(content)
print("Done — bookings now the hero in spotlight cards")
