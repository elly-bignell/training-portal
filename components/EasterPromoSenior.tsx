// components/EasterPromoSenior.tsx

"use client";

import { useEasterPromo } from "@/hooks/useEasterPromo";
import { getBuddyName } from "@/data/buddyPairs";

interface Props {
  traineeSlug: string;
  traineeName: string;
}

export default function EasterPromoSenior({ traineeSlug, traineeName }: Props) {
  const { today, totals, isLoading, isSaving, increment } = useEasterPromo(traineeSlug, traineeName);
  const buddyName = getBuddyName(traineeSlug);

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

  const totalCloses = totals.promo_closes_own + totals.promo_closes_buddy;
  const todayCloses = today.promo_closes_own + today.promo_closes_buddy;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-pink-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-[#E6017D] p-3 sm:p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🐣</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Easter Promotion</h2>
              <p className="text-pink-100 text-[10px] sm:text-xs">3 Mar – 1 Apr</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold">{totalCloses}</div>
            <div className="text-[10px] sm:text-xs text-pink-100">total closes</div>
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
        {/* Today's Pitches */}
        <div className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-amber-500 to-amber-600 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-2xl sm:text-3xl opacity-20">🎯</div>
          <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wide mb-0.5">
            Pitches Today
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">{today.pitches}</span>
            <span className="text-xs text-white/60">Promo total: {totals.pitches}</span>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={() => increment("pitches", -1)}
              disabled={today.pitches <= 0 || isSaving}
              className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −1
            </button>
            <button
              onClick={() => increment("pitches", 1)}
              disabled={isSaving}
              className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white text-amber-700 text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              +1
            </button>
          </div>
        </div>

        {/* Closes - split by booking source */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* My Booking → Closed */}
          <div className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-2xl sm:text-3xl opacity-20">💰</div>
            <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wide mb-0.5">
              Closed — My Booking
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">{today.promo_closes_own}</span>
              <span className="text-[10px] sm:text-xs text-white/60">Total: {totals.promo_closes_own}</span>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => increment("promo_closes_own", -1)}
                disabled={today.promo_closes_own <= 0 || isSaving}
                className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −1
              </button>
              <button
                onClick={() => increment("promo_closes_own", 1)}
                disabled={isSaving}
                className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white text-emerald-700 text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                +1
              </button>
            </div>
          </div>

          {/* Buddy's Booking → Closed */}
          <div className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-2xl sm:text-3xl opacity-20">🤝</div>
            <div className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wide mb-0.5">
              Closed — {buddyName}&apos;s Booking
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">{today.promo_closes_buddy}</span>
              <span className="text-[10px] sm:text-xs text-white/60">Total: {totals.promo_closes_buddy}</span>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => increment("promo_closes_buddy", -1)}
                disabled={today.promo_closes_buddy <= 0 || isSaving}
                className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −1
              </button>
              <button
                onClick={() => increment("promo_closes_buddy", 1)}
                disabled={isSaving}
                className="flex-1 py-1.5 sm:py-2 rounded-lg bg-white text-purple-700 text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                +1
              </button>
            </div>
          </div>
        </div>

        {/* Summary footer */}
        <div className="bg-gray-50 rounded-lg px-3 py-2 flex flex-wrap gap-3 text-[10px] sm:text-xs text-gray-500">
          <span>🎯 Pitches: {totals.pitches}</span>
          <span>💰 Total Closes: {totalCloses}</span>
          <span>📊 Conversion: {totals.pitches > 0 ? Math.round((totalCloses / totals.pitches) * 100) : 0}%</span>
          <span>🤝 {buddyName}&apos;s bookings closed: {totals.promo_closes_buddy}</span>
        </div>
      </div>
    </div>
  );
}
