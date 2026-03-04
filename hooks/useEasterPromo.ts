// hooks/useEasterPromo.ts

import { useState, useEffect, useCallback, useRef } from "react";

interface EasterPromoDaily {
  pitches: number;
  promo_closes_own: number;
  promo_closes_buddy: number;
  quodo_bookings: number;
}

interface EasterPromoTotals {
  pitches: number;
  promo_closes_own: number;
  promo_closes_buddy: number;
  quodo_bookings: number;
}

export function useEasterPromo(traineeSlug: string, traineeName: string) {
  const [today, setToday] = useState<EasterPromoDaily>({
    pitches: 0,
    promo_closes_own: 0,
    promo_closes_buddy: 0,
    quodo_bookings: 0,
  });
  const [totals, setTotals] = useState<EasterPromoTotals>({
    pitches: 0,
    promo_closes_own: 0,
    promo_closes_buddy: 0,
    quodo_bookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Ref to track latest today values — prevents stale closure on rapid +1 taps
  const todayRef = useRef(today);
  todayRef.current = today;

  const fetchToday = useCallback(async () => {
    try {
      const res = await fetch(`/api/easter-promo?trainee_slug=${traineeSlug}`);
      const data = await res.json();
      if (data && !data.error) {
        const fresh = {
          pitches: data.pitches || 0,
          promo_closes_own: data.promo_closes_own || 0,
          promo_closes_buddy: data.promo_closes_buddy || 0,
          quodo_bookings: data.quodo_bookings || 0,
        };
        setToday(fresh);
        todayRef.current = fresh;
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
      }
    } catch (e) {
      console.error("Error fetching easter promo totals:", e);
    }
  }, [traineeSlug]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchToday(), fetchTotals()]);
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
        // Re-fetch BOTH today and totals from Airtable after save
        await Promise.all([fetchToday(), fetchTotals()]);
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
      // Read from ref (always latest) instead of stale closure
      const current = todayRef.current;
      const updated = { ...current, [field]: Math.max(0, current[field] + amount) };
      setToday(updated);
      todayRef.current = updated;
      await save(updated);
    },
    [save]
  );

  return {
    today,
    totals,
    isLoading,
    isSaving,
    increment,
    refresh: () => {
      fetchToday();
      fetchTotals();
    },
  };
}
