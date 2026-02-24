// update-buddy-info.mjs
// Run: node update-buddy-info.mjs

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'fs';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

const buddyPairs = [
  { dir: 'connie', oldName: 'Connie Matthews', newTitle: 'Connie Matthews + Felipe Garcia' },
  { dir: 'cindy', oldName: 'Cindy Rose Rondez Manrique', newTitle: 'Cindy Manrique + Lucas Tirri' },
  { dir: 'krishna', oldName: 'Krishna Patel', newTitle: 'Krishna Patel + Dylan Munro' },
];

const validationNote = `<div className="text-[10px] text-amber-600 font-medium mt-1">🔍 Buddy runs validation calls on previous day&apos;s bookings</div>`;

let updated = 0;

for (const pair of buddyPairs) {
  const scheduleDir = join('app', 'schedule', pair.dir);
  
  // Get all week folders
  const entries = readdirSync(scheduleDir, { withFileTypes: true });
  const weekDirs = entries.filter(e => e.isDirectory() && e.name.startsWith('week-'));
  
  for (const weekDir of weekDirs) {
    const filePath = join(scheduleDir, weekDir.name, 'page.tsx');
    if (!existsSync(filePath)) continue;
    
    let content = readFileSync(filePath, 'utf-8');
    const weekNum = parseInt(weekDir.name.replace('week-', ''));
    
    // 1. Update the h1 title
    content = content.replace(
      `<h1 className="text-xl font-bold">${pair.oldName}</h1>`,
      `<h1 className="text-xl font-bold">${pair.newTitle}</h1>`
    );
    
    // 2. Add validation note to Call Block 1 for weeks 1-6
    if (weekNum >= 1 && weekNum <= 6) {
      // Find the Call Block 1 booking target line and add validation note after it
      // Pattern: Target: X bookings</div> inside Call Block 1
      // We need to be careful to only match Call Block 1, not Call Block 2
      
      // The Call Block 1 section has "📞 Call Block 1" followed by time, then target
      const cb1Pattern = /(📞 Call Block 1<\/div>\s*<div className="text-\[10px\] text-gray-500 mt-1">.*?<\/div>\s*<div className="text-\[10px\] text-sky-600 font-semibold mt-1">Target: \d[\d–]* bookings<\/div>)/;
      
      if (cb1Pattern.test(content) && !content.includes('Buddy runs validation calls')) {
        content = content.replace(cb1Pattern, `$1\n                        ${validationNote}`);
      }
    }
    
    writeFileSync(filePath, content);
    updated++;
    console.log(`✅ Updated: ${filePath} (week ${weekNum})`);
  }
  
  // Also update the schedule index page title
  const indexPath = join(scheduleDir, 'page.tsx');
  if (existsSync(indexPath)) {
    let indexContent = readFileSync(indexPath, 'utf-8');
    indexContent = indexContent.replace(
      `<h1 className="text-2xl font-bold">${pair.oldName}</h1>`,
      `<h1 className="text-2xl font-bold">${pair.newTitle}</h1>`
    );
    writeFileSync(indexPath, indexContent);
    console.log(`✅ Updated: ${indexPath} (index)`);
    updated++;
  }
}

console.log(`\n🎉 Updated ${updated} files`);
