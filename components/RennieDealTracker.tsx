// components/RennieDealTracker.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";

interface DealRecord {
  id: string;
  date: string;
  booker: string;
  closer: string;
  deal_value: number;
  notes: string;
}

interface Splits {
  rennie: { units: number; revenue: number };
  closers: Record<string, { units: number; revenue: number }>;
}

const CLOSERS = [
  { slug: "thomas-rennie", label: "Tom (self)", color: "bg-slate-600" },
  { slug: "lucas-tirri", label: "Lucas", color: "bg-indigo-600" },
  { slug: "felipe-garcia", label: "Felipe", color: "bg-pink-600" },
  { slug: "dylan-munro", label: "Dylan", color: "bg-amber-500" },
];

const CLOSER_NAMES: Record<string, string> = {
  "thomas-rennie": "Tom",
  "lucas-tirri": "Lucas",
  "felipe-garcia": "Felipe",
  "dylan-munro": "Dylan",
};

const CLOSER_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  "thomas-rennie": { bg: "bg-slate-100", text: "text-slate-700", light: "bg-slate-50" },
  "lucas-tirri": { bg: "bg-indigo-100", text: "text-indigo-700", light: "bg-indigo-50" },
  "felipe-garcia": { bg: "bg-pink-100", text: "text-pink-700", light: "bg-pink-50" },
  "dylan-munro": { bg: "bg-amber-100", text: "text-amber-700", light: "bg-amber-50" },
};

export default function RennieDealTracker({ date }: { date: string }) {
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [splits, setSplits] = useState<Splits>({ rennie: { units: 0, revenue: 0 }, closers: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedCloser, setSelectedCloser] = useState("thomas-rennie");
  const [dealValue, setDealValue] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch(`/api/deal-splits?date=${date}&booker=thomas-rennie`);
      const data = await res.json();
      if (!data.error) {
        setDeals(data.records || []);
        setSplits(data.splits || { rennie: { units: 0, revenue: 0 }, closers: {} });
      }
    } catch (e) {
      console.error("Error fetching deals:", e);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setIsLoading(true);
    fetchDeals();
  }, [fetchDeals]);

  const handleAddDeal = async () => {
    const val = parseFloat(dealValue);
    if (!val || val <= 0) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/deal-splits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          booker: "thomas-rennie",
          closer: selectedCloser,
          deal_value: val,
          notes,
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setDealValue("");
        setNotes("");
        setSelectedCloser("thomas-rennie");
        setShowForm(false);
        await fetchDeals();
      }
    } catch (e) {
      console.error("Error saving deal:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDeal = async (id: string) => {
    try {
      await fetch(`/api/deal-splits?id=${id}`, { method: "DELETE" });
      await fetchDeals();
    } catch (e) {
      console.error("Error deleting deal:", e);
    }
  };

  const fmtMoney = (v: number) => "$" + Math.round(v).toLocaleString();
  const fmtUnits = (v: number) => (v % 1 !== 0 ? v.toFixed(1) : v.toString());

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-slate-500 rounded-full animate-spin" />
          Loading deals...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>🤝</span> Deal Tracker — Split Revenue
            </h3>
            <p className="text-slate-300 text-[10px] mt-0.5">
              Log deals closed by you or the other guys · 50/50 split on handoffs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-lg font-bold">{fmtMoney(splits.rennie.revenue)}</div>
              <div className="text-[10px] text-slate-400">Your share today</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{fmtUnits(splits.rennie.units)}</div>
              <div className="text-[10px] text-slate-400">Units</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Split summary tiles */}
        {Object.keys(splits.closers).length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(splits.closers).map(([slug, totals]) => {
              const cc = CLOSER_COLORS[slug] || CLOSER_COLORS["thomas-rennie"];
              return (
                <div key={slug} className={`${cc.light} rounded-lg p-3 border ${cc.bg.replace("bg-", "border-").replace("100", "200")}`}>
                  <div className={`text-xs font-bold ${cc.text}`}>{CLOSER_NAMES[slug]}&apos;s share</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-sm font-bold text-gray-800">{fmtMoney(totals.revenue)}</span>
                    <span className="text-[10px] text-gray-500">{fmtUnits(totals.units)} units</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Deal list */}
        {deals.length > 0 ? (
          <div className="space-y-2">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Today&apos;s Deals</div>
            {deals.map((deal) => {
              const isSelf = deal.closer === "thomas-rennie";
              const cc = CLOSER_COLORS[deal.closer] || CLOSER_COLORS["thomas-rennie"];
              const yourShare = isSelf ? deal.deal_value : deal.deal_value / 2;
              const theirShare = isSelf ? 0 : deal.deal_value / 2;

              return (
                <div key={deal.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group">
                  {/* Closer badge */}
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${cc.bg} ${cc.text}`}>
                    {CLOSER_NAMES[deal.closer]}
                  </span>

                  {/* Deal details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{fmtMoney(deal.deal_value)}</span>
                      {!isSelf && (
                        <span className="text-[10px] text-gray-400">
                          → {fmtMoney(yourShare)} you · {fmtMoney(theirShare)} {CLOSER_NAMES[deal.closer]}
                        </span>
                      )}
                      {isSelf && (
                        <span className="text-[10px] text-emerald-600 font-semibold">100% yours</span>
                      )}
                    </div>
                    {deal.notes && (
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">{deal.notes}</div>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteDeal(deal.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
                    title="Remove deal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm">
            No deals logged today yet
          </div>
        )}

        {/* Add deal form */}
        {showForm ? (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-gray-700">Log a Deal</div>

            {/* Closer selection */}
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-1.5">Who closed it?</div>
              <div className="grid grid-cols-4 gap-2">
                {CLOSERS.map((c) => {
                  const isSelected = selectedCloser === c.slug;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => setSelectedCloser(c.slug)}
                      className={
                        "px-3 py-2 rounded-lg text-xs font-semibold transition-all border " +
                        (isSelected
                          ? `${c.color} text-white border-transparent shadow-sm`
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")
                      }
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {selectedCloser !== "thomas-rennie" && (
                <div className="mt-2 text-[10px] text-amber-600 bg-amber-50 rounded px-2 py-1">
                  50/50 split: half to your card, half to {CLOSER_NAMES[selectedCloser]}&apos;s
                </div>
              )}
            </div>

            {/* Deal value */}
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-1.5">Total deal value ($)</div>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="e.g. 400"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
              {dealValue && selectedCloser !== "thomas-rennie" && (
                <div className="mt-1 text-[10px] text-gray-500">
                  Your share: <strong>{fmtMoney(parseFloat(dealValue) / 2)}</strong> · {CLOSER_NAMES[selectedCloser]}&apos;s share: <strong>{fmtMoney(parseFloat(dealValue) / 2)}</strong>
                </div>
              )}
            </div>

            {/* Notes (optional) */}
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-1.5">Notes (optional)</div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. client name, package type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleAddDeal}
                disabled={isSaving || !dealValue || parseFloat(dealValue) <= 0}
                className="flex-1 py-2 bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? "Saving..." : "Log Deal"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setDealValue("");
                  setNotes("");
                  setSelectedCloser("thomas-rennie");
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
          >
            + Log a Deal
          </button>
        )}

        {/* How it works */}
        <div className="bg-gray-50 rounded-lg p-3 text-[10px] text-gray-500 space-y-1">
          <div className="font-bold text-gray-600">How splits work:</div>
          <div>• <strong>Tom closes his own:</strong> 100% units + revenue to Tom</div>
          <div>• <strong>Another guy closes:</strong> 50% units + revenue to Tom, 50% to the closer</div>
          <div>• <strong>Meetings attended:</strong> all count under Tom regardless of who closes</div>
          <div>• Units and $ shown above replace the normal scorecard units/revenue</div>
        </div>
      </div>
    </div>
  );
}
