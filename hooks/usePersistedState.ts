// hooks/usePersistedState.ts

"use client";

import { useState, useEffect } from "react";

export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch (e) {
      console.warn(`Failed to load ${key} from localStorage:`, e);
    }
    setIsLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage:`, e);
    }
  }, [key, value, isLoaded]);

  return [value, setValue];
}
