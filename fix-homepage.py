#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 fix-homepage.py
#
# This script:
# 1. Updates Schedule links for Connie, Krishna, Cindy to point to /schedule/X/week-1
# 2. Adds Senior Team Quick Access section (Lucas, Felipe, Dylan)

content = open('app/page.tsx').read()

# ─── 1. Update schedule links to point directly to week-1 ───

# Connie schedule link
content = content.replace(
    'href={`/schedule/${scheduleSlug[trainee.slug]}`}',
    'href={`/schedule/${scheduleSlug[trainee.slug]}/week-1`}'
)

# ─── 2. Add Senior Team Quick Access ───
# Look for the end of the trainee cards section + before Select Your Dashboard
# We need to find the right insertion point

# Try to find the existing Senior Team Members section and replace it
if 'Senior Team Members' in content:
    # Find and replace the entire Senior section
    import re
    # Match from "Senior Team Members" heading through to the closing </div> of that section
    old_senior = '''          {/* Senior Team Members */}'''
    # Find the start
    start_idx = content.find(old_senior)
    if start_idx > 0:
        # Find the matching closing </div></div> pattern after the map
        # Look for the next "          </div>" after the .map section ends
        search_from = start_idx
        # Find "})})" which closes the map, then find the next "</div>" after it
        map_close = content.find(')}\n          </div>', search_from)
        if map_close > 0:
            end_idx = map_close + len(')}\n          </div>')
            old_block = content[start_idx:end_idx]
            new_block = '''          {/* Senior Team Quick Access */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 mt-6">Senior Team Quick Access</h3>
          <div className="space-y-4">
            {trainees.filter((t) => ["lucas-tirri", "felipe-garcia", "dylan-munro"].includes(t.slug)).map((trainee) => {
              return (
              <div key={trainee.slug} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm">
                    {trainee.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-semibold text-gray-800">{trainee.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Training Dashboard</span>
                    <Link href={`/trainees/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Activity Scorecard</span>
                    <Link href={`/scorecard/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>'''
            content = content[:start_idx] + new_block + content[end_idx:]
            print("✅ Replaced Senior Team Members with Senior Team Quick Access")
        else:
            print("⚠️  Could not find map close for Senior section")
    else:
        print("⚠️  Could not find Senior Team Members section start")
elif 'Senior Team Quick Access' in content:
    print("ℹ️  Senior Team Quick Access already exists")
else:
    # Need to add it - find the end of the trainee cards
    # Look for the closing of the trainees filter map
    marker = '''            })}
          </div>
        </div>'''
    
    # Find the LAST occurrence before "Performance vs Standards" or "Select Your Dashboard"
    idx = content.find(marker)
    if idx > 0:
        new_content = '''            })}
          </div>

          {/* Senior Team Quick Access */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 mt-6">Senior Team Quick Access</h3>
          <div className="space-y-4">
            {trainees.filter((t) => ["lucas-tirri", "felipe-garcia", "dylan-munro"].includes(t.slug)).map((trainee) => {
              return (
              <div key={trainee.slug} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm">
                    {trainee.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-semibold text-gray-800">{trainee.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Training Dashboard</span>
                    <Link href={`/trainees/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Activity Scorecard</span>
                    <Link href={`/scorecard/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>'''
        content = content.replace(marker, new_content, 1)
        print("✅ Added Senior Team Quick Access section")
    else:
        print("⚠️  Could not find insertion point for Senior section")

open('app/page.tsx', 'w').write(content)
print("✅ Schedule links updated to /week-1")
print("Done — homepage updated")
