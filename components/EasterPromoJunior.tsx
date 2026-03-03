// components/EasterPromoJunior.tsx

"use client";

import { useBuddyCloses } from "@/hooks/useEasterPromo";
import { reverseBuddyPairs, buddyNames } from "@/data/buddyPairs";

interface Props {
  traineeSlug: string;
}

export default function EasterPromoJunior({ traineeSlug }: Props) {
  const seniorSlug = reverseBuddyPairs[traineeSlug];
  const seniorName = seniorSlug ? buddyNames[seniorSlug] || seniorSlug : "Your buddy";
  const { totalCloses, isLoading, refresh } = useBuddyCloses(seniorSlug || "");

  if (!seniorSlug) return null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
          Loading Easter Promotion...
        </div>
      </div>
    );
  }

  const commission = totalCloses * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-pink-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-[#E6017D] p-3 sm:p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🐣</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Easter Promotion</h2>
            <p className="text-pink-100 text-[10px] sm:text-xs">3 Mar – 1 Apr • +$100 per closed deal you booked</p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {/* Commission counter */}
        <div className="rounded-xl p-4 sm:p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-center relative overflow-hidden">
          <div className="absolute top-3 right-3 text-3xl sm:text-4xl opacity-20">💰</div>
          <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
            Easter Promotion Commission Opportunity
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-white mb-1">
            ${commission.toLocaleString()}
          </div>
          <div className="text-sm text-white/70">
            {totalCloses} deal{totalCloses !== 1 ? "s" : ""} closed from your bookings
          </div>
          <div className="mt-3 text-[10px] sm:text-xs text-white/50">
            Updated by {seniorName} when they close deals you booked
          </div>
        </div>

        {/* Refresh */}
        <button
          onClick={refresh}
          className="mt-3 w-full py-2 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
