#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 fix-break-text.py

import os

files = [
    'app/schedule/connie/week-1/page.tsx',
    'app/schedule/krishna/week-1/page.tsx',
    'app/schedule/cindy/week-1/page.tsx',
]

for f in files:
    if not os.path.exists(f):
        print(f"⚠️  Skipping {f} — not found")
        continue
    content = open(f).read()
    
    # Fix the sidebar Daily Breakdown break row
    if 'cindy' in f:
        old_break = '''<td className="py-2 text-gray-400 font-medium">Break</td>
                    <td className="py-2 text-center text-gray-400">12:30–1:30</td>
                    <td className="py-2 text-right text-gray-400">—</td>'''
        new_break = '''<td className="py-2 text-gray-400 font-medium">Break</td>
                    <td className="py-2 text-center text-gray-400">Flexible</td>
                    <td className="py-2 text-right text-gray-400 text-[10px]">Take at your discretion</td>'''
    else:
        old_break = '''<td className="py-2 text-gray-400 font-medium">Break</td>
                    <td className="py-2 text-center text-gray-400">12:00–1:00</td>
                    <td className="py-2 text-right text-gray-400">—</td>'''
        new_break = '''<td className="py-2 text-gray-400 font-medium">Break</td>
                    <td className="py-2 text-center text-gray-400">Flexible</td>
                    <td className="py-2 text-right text-gray-400 text-[10px]">Take at your discretion</td>'''
    
    if old_break in content:
        content = content.replace(old_break, new_break, 1)
        open(f, 'w').write(content)
        print(f"✅ Updated {f}")
    else:
        print(f"⚠️  Could not find break row in {f}")

print("Done")
