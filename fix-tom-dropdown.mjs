// fix-tom-dropdown.mjs
// Run: node fix-tom-dropdown.mjs
// 1. Adds "Tom Rennie" to BUDDY_PAIRS in lib/validation.ts
// 2. Adds "Select your name" placeholder to staff dropdown in app/validation/page.tsx

import { readFileSync, writeFileSync } from 'fs';

// ─── 1. Add Tom Rennie to BUDDY_PAIRS in lib/validation.ts ─────────────────

const valFile = 'lib/validation.ts';
let valContent = readFileSync(valFile, 'utf-8');

// Add Tom Rennie after Krishna Patel in BUDDY_PAIRS
// Tom is solo Team 4 — assign Dylan Munro as buddy (adjust if needed)
valContent = valContent.replace(
  `"Krishna Patel": "Dylan Munro",`,
  `"Krishna Patel": "Dylan Munro",\n  "Tom Rennie": "Lucas Tirri",`
);

writeFileSync(valFile, valContent);
console.log('✅ lib/validation.ts — Added Tom Rennie to BUDDY_PAIRS');


// ─── 2. Fix staff dropdown in app/validation/page.tsx ──────────────────────

const pageFile = 'app/validation/page.tsx';
let pageContent = readFileSync(pageFile, 'utf-8');

// Change default staff_member from STAFF_MEMBERS[0] to empty string
pageContent = pageContent.replace(
  `staff_member: STAFF_MEMBERS[0],`,
  `staff_member: "",`
);

// Also fix the reset after successful form submission (there are two occurrences)
// The second one is in the form reset after successful creation
pageContent = pageContent.replace(
  `staff_member: form.staff_member,`,
  `staff_member: "",`
);

// Add "Select your name" placeholder option to the Staff Member select
// Current: {STAFF_MEMBERS.map((s) => (<option key={s} value={s}>{s}</option>))}
// Change to add a disabled placeholder first
pageContent = pageContent.replace(
  `{STAFF_MEMBERS.map((s) => (\n                  <option key={s} value={s}>{s}</option>\n                ))}`,
  `<option value="" disabled>Select your name</option>\n                {STAFF_MEMBERS.map((s) => (\n                  <option key={s} value={s}>{s}</option>\n                ))}`
);

// Update the buddy display to handle empty staff_member
pageContent = pageContent.replace(
  `<p className="text-[10px] text-gray-400 mt-1">Buddy: {getBuddy(form.staff_member)}</p>`,
  `<p className="text-[10px] text-gray-400 mt-1">{form.staff_member ? \`Buddy: \${getBuddy(form.staff_member)}\` : "Select a staff member to see buddy"}</p>`
);

writeFileSync(pageFile, pageContent);
console.log('✅ app/validation/page.tsx — Added placeholder & Tom Rennie now in dropdown');

// ─── Verify ────────────────────────────────────────────────────────────────

const finalVal = readFileSync(valFile, 'utf-8');
const finalPage = readFileSync(pageFile, 'utf-8');

const hasTom = finalVal.includes('"Tom Rennie"');
const hasPlaceholder = finalPage.includes('Select your name');
const noDefault = !finalPage.includes('staff_member: STAFF_MEMBERS[0]');

console.log(hasTom ? '✅ Tom Rennie in BUDDY_PAIRS' : '⚠️  Tom Rennie NOT found');
console.log(hasPlaceholder ? '✅ "Select your name" placeholder added' : '⚠️  Placeholder NOT found');
console.log(noDefault ? '✅ Default changed from STAFF_MEMBERS[0] to ""' : '⚠️  Still using STAFF_MEMBERS[0]');

console.log('');
console.log('Done! Dropdown will now show:');
console.log('  - "Select your name" (disabled placeholder)');
console.log('  - Connie Matthews');
console.log('  - Cindy Manrique');
console.log('  - Krishna Patel');
console.log('  - Tom Rennie');
console.log('');
console.log('Tom\'s buddy is set to Lucas Tirri — change in lib/validation.ts if needed.');
console.log('');
// ─── 3. Git push ───────────────────────────────────────────────────────────

import { execSync } from 'child_process';
try {
  execSync('git add . && git commit -m "Add Tom Rennie to dropdown, placeholder Select your name" && git push', { stdio: 'inherit' });
  console.log('✅ Pushed to git');
} catch (err) {
  console.error('⚠️  Git push failed:', err.message);
}
