// hooks/useDealSplits.ts

"use client";

import { useState, useEffect, useCallback } from "react";

interface DealSplitsResult {
  rennie_units: number;
  rennie_revenue: number;
  closers: Record<string, { units: number; revenue: number }>;
  dealCount: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Fetches deal splits for a given date and returns Rennie's
 * computed units + revenue (to display in the scorecard tiles
 * instead of the normal +/- tracked values).
 */
export function useDealSplits(date: string): DealSplitsResult {
  const [rennie_units, setRennieUnits] = useState(0);
  const [rennie_revenue, setRennieRevenue] = useState(0);
  const [closers, setClosers] = useState<Record<string, { units: number; revenue: number }>>({});
  const [dealCount, setDealCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`/api/deal-splits?date=${date}&booker=thomas-rennie`);
      const data = await res.json();
      if (!data.error && data.splits) {
        setRennieUnits(data.splits.rennie?.units || 0);
        setRennieRevenue(data.splits.rennie?.revenue || 0);
        setClosers(data.splits.closers || {});
        setDealCount(data.records?.length || 0);
      }
    } catch (e) {
      console.error("useDealSplits fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setIsLoading(true);
    refetch();
  }, [refetch]);

  return { rennie_units, rennie_revenue, closers, dealCount, isLoading, refetch };
}
