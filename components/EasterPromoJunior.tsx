// components/EasterPromoJunior.tsx

"use client";

import { useEasterPromo } from "@/hooks/useEasterPromo";
import { getTraineeBySlug } from "@/data/trainees";

interface Props {
  traineeSlug: string;
  traineeName: string;
}

export default function EasterPromoJunior({ traineeSlug, traineeName }: Props) {
  const { today, totals, isLoading, isSaving, increment } = useEasterPromo(traineeSlug, traineeName);

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

  const commission = Math.max(totals.quodo_bookings, today.quodo_bookings) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-pink-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-[#E6017D] p-3 sm:p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🐣</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Easter Promotion</h2>
            <p className="text-pink-100 text-[10px] sm:text-xs">3 Mar – 1 Apr • +$100 per Quodo deal closed from your bookings</p>
          </div>
        </div>
        {isSaving && (
          <div className="mt-2 text-xs text-pink-200 flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-pink-300 border-t-white rounded-full animate-spin" />
            Saving...
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {/* Quodo Bookings Counter */}
        <div className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-2xl sm:text-3xl opacity-20">📅</div>
          <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wide mb-0.5">
            Quodo Bookings Today
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">{today.quodo_bookings}</span>
            <span className="text-xs text-white/60">Promo total: {totals.quodo_bookings}</span>
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
              className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white text-purple-700 text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              +1
            </button>
          </div>
        </div>

        {/* Commission Counter */}
        <div className="rounded-xl p-4 sm:p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-center relative overflow-hidden">
          <div className="absolute top-3 right-3 text-3xl sm:text-4xl opacity-20">💰</div>
          <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
            Easter Promotion Commission Opportunity
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-white mb-1">
            ${commission.toLocaleString()}
          </div>
          <div className="text-sm text-white/70">
            {totals.quodo_bookings} Quodo booking{totals.quodo_bookings !== 1 ? "s" : ""} that close = ${commission} extra
          </div>
        </div>
      </div>
    </div>
  );
}
