// components/EasterPromoAdmin.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";

const TOTAL_SPOTS = 10;

const pairConfig = [
  { label: "Lucas & Cindy", color: "indigo", senior: "lucas-tirri", seniorName: "Lucas", junior: "cindy-rose-rondez-manrique", juniorName: "Cindy" },
  { label: "Felipe & Connie", color: "pink", senior: "felipe-garcia", seniorName: "Felipe", junior: "connie-matthews", juniorName: "Connie" },
  { label: "Dylan & Krishna", color: "amber", senior: "dylan-munro", seniorName: "Dylan", junior: "krishna-patel", juniorName: "Krishna" },
];

const allSlugs = pairConfig.flatMap((p) => [p.senior, p.junior]);

const pairColors: Record<string, { header: string }> = {
  indigo: { header: "bg-indigo-600" },
  pink: { header: "bg-pink-600" },
  amber: { header: "bg-amber-500" },
};

interface PersonTotals {
  pitches: number;
  express_closes_own: number;
  express_closes_buddy: number;
  standard_closes_own: number;
  standard_closes_buddy: number;
  quodo_bookings: number;
}

export default function EasterPromoAdmin() {
  const [totalsMap, setTotalsMap] = useState<Record<string, PersonTotals>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      const results: Record<string, PersonTotals> = {};

      await Promise.all(
        allSlugs.map(async (slug) => {
          try {
            const res = await fetch("/api/easter-promo?trainee_slug=" + slug + "&all=true");
            const data = await res.json();
            results[slug] = {
              pitches: data.totals?.pitches || 0,
              express_closes_own: data.totals?.express_closes_own || 0,
              express_closes_buddy: data.totals?.express_closes_buddy || 0,
              standard_closes_own: data.totals?.standard_closes_own || 0,
              standard_closes_buddy: data.totals?.standard_closes_buddy || 0,
              quodo_bookings: data.totals?.quodo_bookings || 0,
            };
          } catch {
            results[slug] = { pitches: 0, express_closes_own: 0, express_closes_buddy: 0, standard_closes_own: 0, standard_closes_buddy: 0, quodo_bookings: 0 };
          }
        })
      );

      setTotalsMap(results);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    // Only EXPRESS closes use spots
    const totalExpressSpots = pairConfig.reduce((sum, p) => {
      const t = totalsMap[p.senior];
      return sum + (t ? t.express_closes_own + t.express_closes_buddy : 0);
    }, 0);

    const totalStandardCloses = pairConfig.reduce((sum, p) => {
      const t = totalsMap[p.senior];
      return sum + (t ? t.standard_closes_own + t.standard_closes_buddy : 0);
    }, 0);

    const totalAllCloses = totalExpressSpots + totalStandardCloses;

    // Lead gen leaderboard — ALL buddy closes (express + standard) earn $100
    const leaderboard = pairConfig
      .map((p) => {
        const senior = totalsMap[p.senior];
        const buddyCloses = senior ? senior.express_closes_buddy + senior.standard_closes_buddy : 0;
        const quodoBookings = totalsMap[p.junior]?.quodo_bookings || 0;
        return {
          slug: p.junior,
          name: p.juniorName,
          buddyCloses,
          quodoBookings,
          commission: buddyCloses * 100,
        };
      })
      .sort((a, b) => b.commission - a.commission);

    const pairs = pairConfig.map((p) => {
      const senior = totalsMap[p.senior] || { pitches: 0, express_closes_own: 0, express_closes_buddy: 0, standard_closes_own: 0, standard_closes_buddy: 0, quodo_bookings: 0 };
      const junior = totalsMap[p.junior] || { pitches: 0, express_closes_own: 0, express_closes_buddy: 0, standard_closes_own: 0, standard_closes_buddy: 0, quodo_bookings: 0 };

      const expressTotal = senior.express_closes_own + senior.express_closes_buddy;
      const standardTotal = senior.standard_closes_own + senior.standard_closes_buddy;
      const allCloses = expressTotal + standardTotal;
      const buddyCloses = senior.express_closes_buddy + senior.standard_closes_buddy;
      const convRate = senior.pitches > 0 ? Math.round((allCloses / senior.pitches) * 100) : 0;

      return {
        ...p,
        pitches: senior.pitches,
        expressOwn: senior.express_closes_own,
        expressBuddy: senior.express_closes_buddy,
        expressTotal,
        standardOwn: senior.standard_closes_own,
        standardBuddy: senior.standard_closes_buddy,
        standardTotal,
        allCloses,
        buddyCloses,
        convRate,
        juniorBookings: junior.quodo_bookings,
        juniorCommission: buddyCloses * 100,
      };
    });

    return { totalExpressSpots, totalStandardCloses, totalAllCloses, leaderboard, pairs };
  }, [totalsMap]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
          Loading Easter Promotion data...
        </div>
      </div>
    );
  }

  const spotsRemaining = Math.max(0, TOTAL_SPOTS - stats.totalExpressSpots);
  const totalTeamPitches = stats.pairs.reduce((s, p) => s + p.pitches, 0);
  const totalLeadGenCommission = stats.leaderboard.reduce((s, l) => s + l.commission, 0);

  return (
    <div className="space-y-6">

      {/* Promo Info Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-[#E6017D] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐣</span>
            <div>
              <h2 className="text-xl font-bold">Easter Egg-spress Promotion</h2>
              <p className="text-pink-100 text-sm">3rd March – 1st April 2026 · $100 lead gen commission per closed deal (express + standard)</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.totalAllCloses}</div>
            <div className="text-pink-100 text-xs">total deals closed</div>
          </div>
        </div>
      </div>

      {/* ═══ Express Spots (out of 10) ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">⚡ Express Build Spots (7 Day · $700 fee waived)</h3>
          <span className={
            "text-xs font-bold px-3 py-1 rounded-full " +
            (spotsRemaining === 0 ? "bg-red-100 text-red-700" : spotsRemaining <= 3 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")
          }>
            {spotsRemaining === 0 ? "SOLD OUT" : spotsRemaining + " remaining"}
          </span>
        </div>

        {/* Visual spot counter */}
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_SPOTS }, (_, i) => {
            const isFilled = i < stats.totalExpressSpots;
            return (
              <div
                key={i}
                className={
                  "flex-1 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all " +
                  (isFilled
                    ? "bg-gradient-to-br from-pink-500 to-[#E6017D] text-white shadow-sm"
                    : "bg-gray-100 text-gray-300 border-2 border-dashed border-gray-200")
                }
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-pink-500 to-[#E6017D]"></span>
            Express spot used
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-100 border-2 border-dashed border-gray-200"></span>
            Available
          </span>
          <span className="ml-auto font-semibold text-gray-500">
            Only 7-day express builds use these spots. Standard builds do not.
          </span>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{totalTeamPitches}</div>
          <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">Total Pitches</div>
        </div>
        <div className="bg-white rounded-xl border-2 border-pink-200 p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">{stats.totalExpressSpots}</div>
          <div className="text-[10px] text-pink-500 uppercase font-semibold tracking-wide">⚡ Express Closed</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-sky-600">{stats.totalStandardCloses}</div>
          <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">🏗️ Standard Closed</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.totalAllCloses}</div>
          <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">All Deals Closed</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">${totalLeadGenCommission.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">Lead Gen Commission</div>
        </div>
      </div>

      {/* Lead Gen Commission Leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-3">
          <h3 className="text-base font-bold flex items-center gap-2">🏆 Lead Gen Commission Leaderboard</h3>
          <p className="text-purple-200 text-[11px]">+$100 per deal closed from their booking (express + standard)</p>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.leaderboard.map((entry, idx) => {
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
            const maxCommission = stats.leaderboard[0].commission;
            const barWidth = maxCommission > 0
              ? Math.max(5, (entry.commission / maxCommission) * 100)
              : 5;

            return (
              <div key={entry.slug} className="px-5 py-4 flex items-center gap-4">
                <span className="text-2xl">{medal}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-800">{entry.name}</span>
                    <span className="text-sm font-bold text-emerald-600">${entry.commission.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: barWidth + "%" }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {entry.buddyCloses} deal{entry.buddyCloses !== 1 ? "s" : ""} closed from their bookings
                    {entry.quodoBookings > 0 && <span> · {entry.quodoBookings} Quodo booking{entry.quodoBookings !== 1 ? "s" : ""}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Team Breakdown */}
      {stats.pairs.map((pair) => {
        const tc = pairColors[pair.color] || pairColors.indigo;

        return (
          <div key={pair.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={tc.header + " text-white px-5 py-3"}>
              <h3 className="text-base font-bold">{pair.label}</h3>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Senior stats */}
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                    {pair.seniorName} — Sales
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600">🎯 Pitches</span>
                      <span className="text-sm font-bold text-gray-800">{pair.pitches}</span>
                    </div>

                    {/* Express section */}
                    <div className="bg-pink-50 rounded-lg px-3 py-2 space-y-1">
                      <div className="text-[10px] font-bold text-pink-600 uppercase">⚡ Express (uses spots)</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Own booking</span>
                        <span className="text-sm font-bold text-emerald-700">{pair.expressOwn}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{pair.juniorName}&apos;s booking</span>
                        <span className="text-sm font-bold text-purple-700">{pair.expressBuddy}</span>
                      </div>
                    </div>

                    {/* Standard section */}
                    <div className="bg-sky-50 rounded-lg px-3 py-2 space-y-1">
                      <div className="text-[10px] font-bold text-sky-600 uppercase">🏗️ Standard (no spot)</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Own booking</span>
                        <span className="text-sm font-bold text-sky-700">{pair.standardOwn}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{pair.juniorName}&apos;s booking</span>
                        <span className="text-sm font-bold text-teal-700">{pair.standardBuddy}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600">📊 Conversion rate</span>
                      <span className="text-sm font-bold text-gray-800">{pair.convRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Junior stats */}
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                    {pair.juniorName} — Lead Gen
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600">📅 Quodo Bookings</span>
                      <span className="text-sm font-bold text-purple-700">{pair.juniorBookings}</span>
                    </div>
                    <div className="flex items-center justify-between bg-violet-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600">💡 Commission Opportunity</span>
                      <span className="text-sm font-bold text-violet-700">${(pair.juniorBookings * 100).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600">🤝 Bookings closed (express + standard)</span>
                      <span className="text-sm font-bold text-emerald-700">{pair.buddyCloses}</span>
                    </div>
                    <div className="flex items-center justify-between bg-pink-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600">💰 Commission earned</span>
                      <span className="text-sm font-bold text-pink-700">${pair.juniorCommission.toLocaleString()}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <div className="text-[10px] text-amber-700">
                        Both express and standard closes from {pair.juniorName}&apos;s bookings earn +$100 commission
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team total */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-pink-50 rounded-lg px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-pink-600">⚡ Express spots used</span>
                  <span className="text-lg font-bold text-pink-700">{pair.expressTotal}</span>
                </div>
                <div className="bg-sky-50 rounded-lg px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-600">🏗️ Standard builds</span>
                  <span className="text-lg font-bold text-sky-700">{pair.standardTotal}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
