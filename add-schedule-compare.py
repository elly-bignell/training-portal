#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 add-schedule-compare.py

content = open('app/notes/page.tsx').read()

# Add import for the schedule compare component
content = content.replace(
    'import PasswordGate from "@/components/PasswordGate";',
    'import PasswordGate from "@/components/PasswordGate";\nimport WeekScheduleCompare from "@/components/WeekScheduleCompare";'
)

# Remove plan/actual state variables
for var in ['const [planInput, setPlanInput] = useState("");', 'const [actualInput, setActualInput] = useState("");']:
    content = content.replace(var + '\n', '')

# Remove plan/actual from addNote inputMap
content = content.replace(
    'const inputMap: Record<string, string> = { well: wellInput, "not-well": notWellInput, plan: planInput, actual: actualInput };',
    'const inputMap: Record<string, string> = { well: wellInput, "not-well": notWellInput };'
)

# Remove plan/actual setters in addNote
content = content.replace('      if (type === "plan") setPlanInput("");\n', '')
content = content.replace('      if (type === "actual") setActualInput("");\n', '')

# Remove unused note filters
content = content.replace('  const planNotes = notes.filter((n) => n.type === "plan");\n', '')
content = content.replace('  const actualNotes = notes.filter((n) => n.type === "actual");\n', '')

# Replace the entire Weekly Plan vs Actual section with the component
old_section_start = '            {/* ═══ Weekly Plan vs Actual ═══ */}'
old_section_end = '''          </>
        )}
      </div>
    </div>
  );'''

# Find the plan section and everything up to the closing
start_idx = content.find(old_section_start)
end_idx = content.find('          </>',  start_idx)

if start_idx > 0 and end_idx > 0:
    old_block = content[start_idx:end_idx]
    new_block = '''            {/* ═══ Weekly Plan vs Actual ═══ */}
            <div className="border-t-2 border-slate-200 pt-8">
              <WeekScheduleCompare />
            </div>'''
    content = content[:start_idx] + new_block + content[end_idx:]

open('app/notes/page.tsx', 'w').write(content)
print("Done — replaced plan/actual text boxes with schedule compare component")
