// hooks/useEasterPromo.ts

import { useState, useEffect, useCallback } from "react";

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

  const fetchToday = useCallback(async () => {
    try {
      const res = await fetch(`/api/easter-promo?trainee_slug=${traineeSlug}`);
      const data = await res.json();
      if (data && !data.error) {
        setToday({
          pitches: data.pitches || 0,
          promo_closes_own: data.promo_closes_own || 0,
          promo_closes_buddy: data.promo_closes_buddy || 0,
          quodo_bookings: data.quodo_bookings || 0,
        });
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
        await fetchTotals();
      } catch (e) {
        console.error("Error saving easter promo:", e);
      } finally {
        setIsSaving(false);
      }
    },
    [traineeSlug, traineeName, fetchTotals]
  );

  const increment = useCallback(
    async (field: keyof EasterPromoDaily, amount: number = 1) => {
      const updated = { ...today, [field]: Math.max(0, today[field] + amount) };
      setToday(updated);
      await save(updated);
    },
    [today, save]
  );

  return { today, totals, isLoading, isSaving, increment, refresh: () => { fetchToday(); fetchTotals(); } };
}
