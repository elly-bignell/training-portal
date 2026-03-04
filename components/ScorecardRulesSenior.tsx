// components/ScorecardRulesSenior.tsx

"use client";

import React from "react";
import { getBuddyName } from "@/data/buddyPairs";

export default function ScorecardRulesSenior({ slug }: { slug: string }) {
  const buddyName = getBuddyName(slug);

  return (
    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        📋 Scorecard Rules — Sales Team
      </h3>
      <div className="space-y-2.5 text-[13px] text-slate-600 leading-relaxed">
        <div className="flex gap-2">
          <span className="text-slate-400 font-bold shrink-0">1.</span>
          <p>
            If you <strong>attend</strong> a meeting that {buddyName} booked, <strong>{buddyName}</strong> gets the +1 on their Meetings tile — yours stays at 0 for that meeting.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 font-bold shrink-0">2.</span>
          <p>
            If you <strong>close</strong> a deal from {buddyName}&apos;s booking, mark <strong>0.5</strong> on your Sales Units tile and enter <strong>50%</strong> of the deal value in your Sales Revenue tile. {buddyName} will do the same on their side.
          </p>
        </div>
      </div>
    </div>
  );
}
