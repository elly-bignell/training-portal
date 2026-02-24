import fs from "fs";
import { execSync } from "child_process";

// ═══════════════════════════════════════════════════════════════
// 1. FLOWCHART: Remove everything after "Added to Observation Queue"
// ═══════════════════════════════════════════════════════════════

let flowchart = fs.readFileSync("app/call-flowchart/page.tsx", "utf-8");

// No changes needed to call-flowchart — that's the CALL flowchart, not validation.
// The flowchart to trim is in app/validation/page.tsx (the mermaid FLOWCHART_DEF)

let val = fs.readFileSync("app/validation/page.tsx", "utf-8");

// Remove the scheduling/observation nodes from the mermaid flowchart
// Keep: F --> I["📅 Added to Observation Queue"]
// Remove: I --> J through K --> M, and styles for K and M

val = val.replace(
  `    F --> I["📅 Added to Observation Queue"]
    I --> J{"Next Available\\nDay Free?"}
    J -->|"Yes"| K["✅ Scheduled for Observation\\n<b>1 per day max</b>"]
    J -->|"No"| L["Rolls to Next\\nAvailable Weekday"]
    L --> J

    K --> M["👀 Staff Member Observes\\nBuddy Runs the Meeting"]`,
  `    F --> I["📅 Added to Observation Queue"]`
);

// Remove style lines for K and M
val = val.replace(`    style K fill:#dbeafe,stroke:#3b82f6,color:#1e40af\n`, "");
val = val.replace(`    style M fill:#84D4BD,stroke:#84D4BD,color:#064e3b`, "");

// Also remove legend entries for Observation Scheduled and Meeting Observation
val = val.replace(
  `          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-400"></div>
            <span className="text-xs text-slate-600">Observation Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#84D4BD" }}></div>
            <span className="text-xs text-slate-600">Meeting Observation</span>
          </div>`,
  ""
);

console.log("✅ Flowchart trimmed — stops at 'Added to Observation Queue'");

// ═══════════════════════════════════════════════════════════════
// 2. VALIDATION: Replace datetime-local with date + time select
// ═══════════════════════════════════════════════════════════════

// Replace the meeting_datetime field in the form state
val = val.replace(
  `    meeting_datetime: "",`,
  `    meeting_date: "",
    meeting_time: "",`
);

// Replace the reset after successful submit
val = val.replace(
  `          meeting_datetime: "",
        });`,
  `          meeting_date: "",
          meeting_time: "",
        });`
);

// Replace the submit body to combine date + time
val = val.replace(
  `        body: JSON.stringify({
          ...form,
          buddy: getBuddy(form.staff_member),
        }),`,
  `        body: JSON.stringify({
          ...form,
          meeting_datetime: form.meeting_date && form.meeting_time ? \`\${form.meeting_date}T\${form.meeting_time}\` : "",
          buddy: getBuddy(form.staff_member),
        }),`
);

// Replace the datetime-local input section with date + time select
val = val.replace(
  `          <div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date/Time <span className="font-normal text-gray-400">(Adelaide time)</span></label>
              <input
                type="datetime-local"
                value={form.meeting_datetime}
                onChange={(e) => setForm({ ...form, meeting_datetime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
          </div>`,
  `          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date <span className="font-normal text-gray-400">(Adelaide time)</span></label>
              <input
                type="date"
                value={form.meeting_date}
                onChange={(e) => setForm({ ...form, meeting_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Time</label>
              <select
                value={form.meeting_time}
                onChange={(e) => setForm({ ...form, meeting_time: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Select time</option>
                <option value="08:30">8:30 AM</option>
                <option value="09:00">9:00 AM</option>
                <option value="09:30">9:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="13:30">1:30 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="14:30">2:30 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="15:30">3:30 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="16:30">4:30 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="17:30">5:30 PM</option>
              </select>
            </div>
          </div>`
);

fs.writeFileSync("app/validation/page.tsx", val);

console.log("✅ Meeting time picker — date + 30-min dropdown (8:30 AM – 5:30 PM)");

// ═══════════════════════════════════════════════════════════════
// VERIFY
// ═══════════════════════════════════════════════════════════════

const final = fs.readFileSync("app/validation/page.tsx", "utf-8");

const checks = [
  [!final.includes("Next Available"), "Flowchart: scheduling nodes removed"],
  [!final.includes("Staff Member Observes"), "Flowchart: observation node removed"],
  [final.includes('Added to Observation Queue"]'), "Flowchart: stops at Observation Queue"],
  [!final.includes("datetime-local"), "Time picker: datetime-local removed"],
  [final.includes("8:30 AM"), "Time picker: 8:30 AM present"],
  [final.includes("5:30 PM"), "Time picker: 5:30 PM present"],
  [final.includes("Select time"), "Time picker: placeholder present"],
  [final.includes("meeting_date") && final.includes("meeting_time"), "Form: separate date/time fields"],
];

let allGood = true;
checks.forEach(([ok, label]) => {
  console.log(`  ${ok ? "✅" : "❌"} ${label}`);
  if (!ok) allGood = false;
});

if (!allGood) {
  console.log("\n⚠️  Some checks failed — review the output above");
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// GIT
// ═══════════════════════════════════════════════════════════════

try {
  execSync('git add . && git commit -m "Flowchart: trim after Observation Queue. Time picker: 30-min dropdown 8:30-5:30" && git push', { stdio: "inherit" });
  console.log("\n✅ Pushed to git");
} catch (e) {
  console.log("\n⚠️  Git push failed — run manually:");
  console.log('git add . && git commit -m "Flowchart: trim after Observation Queue. Time picker: 30-min dropdown 8:30-5:30" && git push');
}
