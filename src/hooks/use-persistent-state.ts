import { useEffect, useState } from "react";

/** useState that survives page reloads by mirroring the value into localStorage. */
export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable (private mode, full quota); the in-memory value still works.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
