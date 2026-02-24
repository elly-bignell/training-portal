// app/validation/page.tsx

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";

const FLOWCHART = `flowchart TD
    A["📞 Staff Member Makes a Booking"] --> B["📋 Booking Created\n<b>Status: Pending Validation</b>"]
    B --> C["⏰ Next Business Day"]
    C --> D["🤝 Buddy Calls the Booking\nto Validate Quality"]
    D --> E{"Booking\nQuality?"}

    E -->|"✅ Good"| F["Validated\n<b>Status: Validated</b>"]
    E -->|"❌ Poor"| G["Rejected\n<b>Status: Rejected</b>\nBuddy writes rejection note"]

    F --> H["📝 Buddy Provides Feedback\nto Staff Member"]
    G --> H

    F --> I["📅 Added to Observation Queue"]
    I --> J{"Next Available\nDay Free?"}
    J -->|"Yes"| K["✅ Scheduled for Observation\n<b>1 per day max</b>"]
    J -->|"No"| L["Rolls to Next\nAvailable Weekday"]
    L --> J

    K --> M["👀 Staff Member Observes\nBuddy Runs the Meeting"]

    G --> N["📊 Logged in Daily\nLodgement Dashboard"]
    F --> N

    N --> O["📈 Performance Report\nGenerated Weekly"]
    O --> P["Validation Rate =\nValidated ÷ Total Bookings"]

    style A fill:#E6017D,stroke:#E6017D,color:#fff
    style B fill:#fef3c7,stroke:#f59e0b,color:#92400e
    style F fill:#d1fae5,stroke:#10b981,color:#065f46
    style G fill:#fee2e2,stroke:#ef4444,color:#991b1b
    style K fill:#dbeafe,stroke:#3b82f6,color:#1e40af
    style M fill:#84D4BD,stroke:#84D4BD,color:#064e3b
    style P fill:#fce7f3,stroke:#E6017D,color:#9d174d
`;

function ValidationFlowchart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMermaid = async () => {
      // @ts-ignore
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "14px",
          primaryColor: "#f1f5f9",
          primaryBorderColor: "#cbd5e1",
          primaryTextColor: "#1e293b",
          lineColor: "#94a3b8",
          secondaryColor: "#f8fafc",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 15,
          nodeSpacing: 40,
          rankSpacing: 50,
        },
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        const { svg } = await mermaid.render("validation-flowchart", FLOWCHART);
        containerRef.current.innerHTML = svg;

        // Make SVG responsive
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
        }
      }
    };

    loadMermaid();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Admin Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Booking Validation Process</h1>
          <p className="text-lg font-semibold mt-2" style={{ color: "#E6017D" }}>End-to-End Workflow</p>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Every booking made by a staff member goes through a buddy validation step the following day.
            Validated bookings are scheduled for observation at a rate of 1 per day.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 overflow-x-auto">
          <div ref={containerRef} className="flex justify-center min-h-[400px] items-center">
            <div className="text-slate-400 text-sm">Loading flowchart...</div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#E6017D" }}></div>
              <span className="text-xs text-slate-600">Booking Created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-100 border border-amber-400"></div>
              <span className="text-xs text-slate-600">Pending Validation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400"></div>
              <span className="text-xs text-slate-600">Validated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-400"></div>
              <span className="text-xs text-slate-600">Rejected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-400"></div>
              <span className="text-xs text-slate-600">Observation Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#84D4BD" }}></div>
              <span className="text-xs text-slate-600">Meeting Observation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-pink-100 border border-pink-400"></div>
              <span className="text-xs text-slate-600">Performance Report</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ValidationPage() {
  return (
    <PasswordGate requireMaster>
      <ValidationFlowchart />
    </PasswordGate>
  );
}
