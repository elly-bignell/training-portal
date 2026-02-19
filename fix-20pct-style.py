#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 fix-20pct-style.py

content = open('components/PerformanceSummary.tsx').read()

old = '''            <div className="border-t border-white/10 mt-5 pt-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-3">Comparison at 20% conversion</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { bookings: 6, icon: "🔥" },
                  { bookings: 5, icon: "⚡" },
                  { bookings: 4, icon: "📞" },
                ].map((t) => {
                  const callsNeeded = Math.ceil(t.bookings / 0.2);
                  return (
                    <div key={t.bookings} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-slate-300">{t.bookings} bookings</div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-slate-600">=</span>
                        <span className="text-sm font-bold text-slate-400">{callsNeeded} calls</span>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">at 20% conversion</div>
                    </div>
                  );
                })}
              </div>
            </div>'''

new = '''            <div className="border-t border-white/10 mt-5 pt-4">
              <p className="text-[10px] text-slate-300 uppercase tracking-wide mb-3">At 20% cut through from call:booking</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { bookings: 6, icon: "🔥" },
                  { bookings: 5, icon: "⚡" },
                  { bookings: 4, icon: "📞" },
                ].map((t) => {
                  const callsNeeded = Math.ceil(t.bookings / 0.2);
                  return (
                    <div key={t.bookings} className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">{t.bookings} bookings</div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-slate-400">=</span>
                        <span className="text-sm font-bold text-slate-200">{callsNeeded} calls</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">at 20% conversion</div>
                    </div>
                  );
                })}
              </div>
            </div>'''

content = content.replace(old, new, 1)
open('components/PerformanceSummary.tsx', 'w').write(content)
print("Done — 20% row lighter + updated label")
