// scripts/add-senior-schedule-link.js
// Run from training-portal root: node scripts/add-senior-schedule-link.js

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "app", "page.tsx");
let content = fs.readFileSync(filePath, "utf8");

// Find the Senior Team section and add a Schedule link row
// Current: grid with "Training Dashboard" and "Activity Scorecard"
// We want to add "Schedule" link for lucas, felipe, dylan (not thomas)

const oldBlock = `                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Training Dashboard</span>
                    <Link href={\`/trainees/\${trainee.slug}\`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Activity Scorecard</span>
                    <Link href={\`/scorecard/\${trainee.slug}\`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>`;

const newBlock = `                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Training Dashboard</span>
                    <Link href={\`/trainees/\${trainee.slug}\`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Activity Scorecard</span>
                    <Link href={\`/scorecard/\${trainee.slug}\`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  {["lucas-tirri", "felipe-garcia", "dylan-munro"].includes(trainee.slug) && (
                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded sm:col-span-2">
                    <span className="text-gray-600">📅 Daily Schedule</span>
                    <Link href="/schedule/senior-team" className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, content, "utf8");
  console.log("SUCCESS: Added Schedule link for Lucas, Felipe, Dylan in Senior Team Quick Access");
} else {
  console.log("ERROR: Could not find the expected Senior Team block. The page may have changed.");
  console.log("Looking for partial match...");
  
  // Try a more flexible approach - just add after the Activity Scorecard line
  const scorecard = `                    <Link href={\`/scorecard/\${trainee.slug}\`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>`;

  const scorecardNew = `                    <Link href={\`/scorecard/\${trainee.slug}\`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  {["lucas-tirri", "felipe-garcia", "dylan-munro"].includes(trainee.slug) && (
                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded sm:col-span-2">
                    <span className="text-gray-600">📅 Daily Schedule</span>
                    <Link href="/schedule/senior-team" className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>`;

  if (content.includes(scorecard)) {
    content = content.replace(scorecard, scorecardNew);
    fs.writeFileSync(filePath, content, "utf8");
    console.log("SUCCESS (fallback): Added Schedule link for Lucas, Felipe, Dylan");
  } else {
    console.log("FAILED: Could not match either pattern. Please add manually.");
  }
}
