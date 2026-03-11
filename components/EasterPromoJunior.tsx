// components/EasterPromoJunior.tsx

"use client";

import { useEasterPromo, useBuddyCloses } from "@/hooks/useEasterPromo";
import { reverseBuddyPairs, buddyNames } from "@/data/buddyPairs";

interface Props {
  traineeSlug: string;
  traineeName: string;
}

export default function EasterPromoJunior({ traineeSlug, traineeName }: Props) {
  const seniorSlug = reverseBuddyPairs[traineeSlug];
  const seniorName = seniorSlug ? buddyNames[seniorSlug] || seniorSlug : "Your buddy";
  const { totalCloses, expressCloses, standardCloses, isLoading: closesLoading, refresh } = useBuddyCloses(seniorSlug || "");
  const { today, totals, isLoading: bookingsLoading, isSaving, increment } = useEasterPromo(traineeSlug, traineeName);

  if (!seniorSlug) return null;

  const isLoading = closesLoading || bookingsLoading;

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

  const confirmedCommission = totalCloses * 100;
  const commissionOpportunity = totals.quodo_bookings * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-pink-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-[#E6017D] p-3 sm:p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🐣</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Easter Promotion</h2>
            <p className="text-pink-100 text-[10px] sm:text-xs">3 Mar – 1 Apr · +$100 per closed deal you booked</p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3">

        {/* ═══ Commission Opportunity (from total Quodo bookings) ═══ */}
        <div className="rounded-xl p-4 sm:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-center relative overflow-hidden">
          <div className="absolute top-3 right-3 text-3xl sm:text-4xl opacity-20">💰</div>
          <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
            Commission Opportunity
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-white mb-1">
            ${commissionOpportunity.toLocaleString()}
          </div>
          <div className="text-sm text-white/70">
            {totals.quodo_bookings} Quodo booking{totals.quodo_bookings !== 1 ? "s" : ""} during promo
          </div>
          <div className="mt-2 text-[10px] text-white/50">
            +$100 for each booking that converts to a deal (express or standard)
          </div>
        </div>

        {/* ═══ Confirmed Commission (from deals actually closed) ═══ */}
        <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-center relative overflow-hidden">
          <div className="absolute top-3 right-3 text-3xl sm:text-4xl opacity-20">✅</div>
          <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
            Confirmed Commission
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
            ${confirmedCommission.toLocaleString()}
          </div>
          <div className="text-sm text-white/70">
            {totalCloses} deal{totalCloses !== 1 ? "s" : ""} closed from your bookings
          </div>
          {(expressCloses > 0 || standardCloses > 0) && (
            <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-white/50">
              {expressCloses > 0 && <span>⚡ {expressCloses} express</span>}
              {standardCloses > 0 && <span>🏗️ {standardCloses} standard</span>}
            </div>
          )}
          <div className="mt-2 text-[10px] text-white/50">
            Updated by {seniorName} when they close deals you booked
          </div>
        </div>

        {/* ═══ Quodo Bookings Today (+1/-1) ═══ */}
        <div className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-pink-500 to-[#E6017D] relative overflow-hidden">
          <div className="absolute top-2 right-2 text-2xl sm:text-3xl opacity-20">📅</div>
          <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wide mb-0.5">
            Quodo Bookings Today
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">{today.quodo_bookings}</span>
            <span className="text-xs text-white/60">Campaign total: {totals.quodo_bookings}</span>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={() => increment("quodo_bookings", -1)}
              disabled={today.quodo_bookings <= 0 || isSaving}
              className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −1
            </button>
            <button
              onClick={() => increment("quodo_bookings", 1)}
              disabled={isSaving}
              className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white text-pink-700 text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              +1
            </button>
          </div>
          {isSaving && (
            <div className="mt-2 text-xs text-white/60 flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={refresh}
          className="w-full py-2 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-colors"
        >
          Refresh commission
        </button>
      </div>
    </div>
  );
}
