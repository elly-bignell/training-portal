// hooks/useEasterPromo.ts

import { useState, useEffect, useCallback, useRef } from "react";

interface EasterPromoDaily {
  pitches: number;
  pipe_own: number;
  pipe_buddy: number;
  express_closes_own: number;
  express_closes_buddy: number;
  standard_closes_own: number;
  standard_closes_buddy: number;
  quodo_bookings: number;
}

interface EasterPromoTotals extends EasterPromoDaily {}

const EMPTY: EasterPromoDaily = {
  pitches: 0,
  pipe_own: 0,
  pipe_buddy: 0,
  express_closes_own: 0,
  express_closes_buddy: 0,
  standard_closes_own: 0,
  standard_closes_buddy: 0,
  quodo_bookings: 0,
};

export function useEasterPromo(traineeSlug: string, traineeName: string) {
  const [today, setToday] = useState<EasterPromoDaily>({ ...EMPTY });
  const [totals, setTotals] = useState<EasterPromoTotals>({ ...EMPTY });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const todayRef = useRef<EasterPromoDaily>({ ...EMPTY });
  const totalsRef = useRef<EasterPromoTotals>({ ...EMPTY });

  const fetchToday = useCallback(async (updateRef = false) => {
    try {
      const res = await fetch(`/api/easter-promo?trainee_slug=${traineeSlug}`);
      const data = await res.json();
      if (data && !data.error) {
        const d: EasterPromoDaily = {
          pitches: data.pitches || 0,
          pipe_own: data.pipe_own || 0,
          pipe_buddy: data.pipe_buddy || 0,
          express_closes_own: data.express_closes_own || 0,
          express_closes_buddy: data.express_closes_buddy || 0,
          standard_closes_own: data.standard_closes_own || 0,
          standard_closes_buddy: data.standard_closes_buddy || 0,
          quodo_bookings: data.quodo_bookings || 0,
        };
        setToday(d);
        if (updateRef) {
          todayRef.current = d;
        }
      }
    } catch (e) {
      console.error("Error fetching easter promo today:", e);
    }
  }, [traineeSlug]);

  const fetchTotals = useCallback(async () => {
    try {
      const res = await fetch(`/api/easter-promo?trainee_slug=${traineeSlug}&all=true`);
      const data = await res.json();
      if (data && !data.error && data.totals) {
        setTotals(data.totals);
        totalsRef.current = data.totals;
      }
    } catch (e) {
      console.error("Error fetching easter promo totals:", e);
    }
  }, [traineeSlug]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchToday(true), fetchTotals()]);
      setIsLoading(false);
    };
    load();
  }, [fetchToday, fetchTotals]);

  const save = useCallback(
    async (data: EasterPromoDaily) => {
      setIsSaving(true);
      try {
        await fetch("/api/easter-promo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trainee_slug: traineeSlug,
            trainee_name: traineeName,
            ...data,
          }),
        });
        // Don't re-fetch today after save — the optimistic value is correct.
        // Re-fetching risks Airtable returning stale data and resetting the counter.
        // Only update campaign totals which aggregate across all days.
        await fetchTotals();
      } catch (e) {
        console.error("Error saving easter promo:", e);
      } finally {
        setIsSaving(false);
      }
    },
    [traineeSlug, traineeName, fetchToday, fetchTotals]
  );

  const increment = useCallback(
    async (field: keyof EasterPromoDaily, amount: number = 1) => {
      const current = todayRef.current;
      const updated = { ...current, [field]: Math.max(0, current[field] + amount) };
      setToday(updated);
      todayRef.current = updated;
      // Optimistically update totals: swap out old today value for new one
      const oldFieldVal = current[field] || 0;
      const newFieldVal = updated[field];
      const updatedTotals = { ...totalsRef.current, [field]: (totalsRef.current[field] || 0) - oldFieldVal + newFieldVal };
      setTotals(updatedTotals);
      totalsRef.current = updatedTotals;
      await save(updated);
    },
    [save]
  );

  return { today, totals, isLoading, isSaving, increment, refresh: () => { fetchToday(true); fetchTotals(); } };
}

// Hook for juniors — fetches their senior's buddy closes (express + standard)
export function useBuddyCloses(seniorSlug: string) {
  const [expressCloses, setExpressCloses] = useState(0);
  const [standardCloses, setStandardCloses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`/api/easter-promo?trainee_slug=${seniorSlug}&all=true`);
      const data = await res.json();
      if (data && !data.error && data.totals) {
        setExpressCloses(data.totals.express_closes_buddy || 0);
        setStandardCloses(data.totals.standard_closes_buddy || 0);
      }
    } catch (e) {
      console.error("Error fetching buddy closes:", e);
    } finally {
      setIsLoading(false);
    }
  }, [seniorSlug]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const totalCloses = expressCloses + standardCloses;
  return { totalCloses, expressCloses, standardCloses, isLoading, refresh: fetch_ };
}
