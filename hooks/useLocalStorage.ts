// hooks/useLocalStorage.ts

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TraineeProgress } from "@/types";

const getStorageKey = (traineeSlug: string) => `training-progress-${traineeSlug}`;

const defaultProgress: TraineeProgress = {
  checkedItems: {},
  notes: {},
  lastUpdated: new Date().toISOString(),
};

export function useTraineeProgress(traineeSlug: string, traineeName: string) {
  const [progress, setProgress] = useState<TraineeProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to Airtable (debounced)
  const syncToAirtable = useCallback(
    async (progressToSync: TraineeProgress, overallProgress: number) => {
      try {
        setIsSyncing(true);
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trainee_slug: traineeSlug,
            trainee_name: traineeName,
            checked_items: progressToSync.checkedItems,
            notes: progressToSync.notes,
            overall_progress: overallProgress,
          }),
        });
      } catch (error) {
        console.error("Failed to sync to Airtable:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    [traineeSlug, traineeName]
  );

  // Load from localStorage first, then try to fetch from Airtable
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadProgress = async () => {
      const storageKey = getStorageKey(traineeSlug);
      const stored = localStorage.getItem(storageKey);
      let localProgress = defaultProgress;

      if (stored) {
        try {
          localProgress = JSON.parse(stored) as TraineeProgress;
          setProgress(localProgress);
        } catch (e) {
          console.error("Failed to parse stored progress:", e);
        }
      }

      // Try to fetch from Airtable
      try {
        const response = await fetch(`/api/progress?trainee_slug=${traineeSlug}`);
        const data = await response.json();

        if (data && !data.error && data.checked_items) {
          const airtableProgress: TraineeProgress = {
            checkedItems: data.checked_items,
            notes: data.notes || {},
            lastUpdated: data.last_updated || new Date().toISOString(),
          };

          // Use Airtable data if it's newer
          const localDate = new Date(localProgress.lastUpdated || 0);
          const airtableDate = new Date(airtableProgress.lastUpdated || 0);

          if (airtableDate > localDate) {
            setProgress(airtableProgress);
            localStorage.setItem(storageKey, JSON.stringify(airtableProgress));
          }
        }
      } catch (error) {
        console.error("Failed to fetch from Airtable:", error);
      }

      setIsLoaded(true);
    };

    loadProgress();
  }, [traineeSlug]);

  // Save to localStorage and schedule Airtable sync
  const saveProgress = useCallback(
    (newProgress: TraineeProgress, allChecklistIds: string[]) => {
      if (typeof window === "undefined") return;

      const storageKey = getStorageKey(traineeSlug);
      const progressWithTimestamp = {
        ...newProgress,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(progressWithTimestamp));
      setProgress(progressWithTimestamp);

      // Calculate overall progress
      const checkedCount = allChecklistIds.filter(
        (id) => newProgress.checkedItems[id]
      ).length;
      const overallProgress = Math.round(
        (checkedCount / allChecklistIds.length) * 100
      );

      // Debounce Airtable sync (wait 1 second after last change)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(() => {
        syncToAirtable(progressWithTimestamp, overallProgress);
      }, 1000);
    },
    [traineeSlug, syncToAirtable]
  );

  // Toggle a checklist item
  const toggleItem = useCallback(
    (itemId: string, allChecklistIds: string[]) => {
      const newCheckedItems = {
        ...progress.checkedItems,
        [itemId]: !progress.checkedItems[itemId],
      };
      saveProgress(
        {
          ...progress,
          checkedItems: newCheckedItems,
        },
        allChecklistIds
      );
    },
    [progress, saveProgress]
  );

  // Update notes for a module
  const updateNotes = useCallback(
    (moduleId: string, content: string, allChecklistIds: string[]) => {
      const newNotes = {
        ...progress.notes,
        [moduleId]: content,
      };
      saveProgress(
        {
          ...progress,
          notes: newNotes,
        },
        allChecklistIds
      );
    },
    [progress, saveProgress]
  );

  // Reset all progress
  const resetProgress = useCallback(
    async (allChecklistIds: string[]) => {
      if (typeof window === "undefined") return;

      const storageKey = getStorageKey(traineeSlug);
      localStorage.removeItem(storageKey);
      const newProgress = {
        ...defaultProgress,
        lastUpdated: new Date().toISOString(),
      };
      setProgress(newProgress);

      // Also reset in Airtable
      await syncToAirtable(newProgress, 0);
    },
    [traineeSlug, syncToAirtable]
  );

  // Calculate progress percentage for a module
  const getModuleProgress = useCallback(
    (checklistIds: string[]): number => {
      if (checklistIds.length === 0) return 0;
      const checkedCount = checklistIds.filter(
        (id) => progress.checkedItems[id]
      ).length;
      return Math.round((checkedCount / checklistIds.length) * 100);
    },
    [progress.checkedItems]
  );

  // Calculate overall progress
  const getOverallProgress = useCallback(
    (allChecklistIds: string[]): number => {
      if (allChecklistIds.length === 0) return 0;
      const checkedCount = allChecklistIds.filter(
        (id) => progress.checkedItems[id]
      ).length;
      return Math.round((checkedCount / allChecklistIds.length) * 100);
    },
    [progress.checkedItems]
  );

  return {
    progress,
    isLoaded,
    isSyncing,
    toggleItem,
    updateNotes,
    resetProgress,
    getModuleProgress,
    getOverallProgress,
  };
}
