import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";

/*
 * A tiny localStorage-backed store. Every component that uses the same key sees the same
 * value: when one of them writes, all of them re-render (other browser tabs too). When
 * storage is unavailable (some private-browsing modes) values live in memory instead.
 */

const memory = new Map<string, string | null>();
const listeners = new Map<string, Set<() => void>>();

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function readRaw(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    // Storage is blocked: fall back to memory only.
  }
  memory.set(key, raw);
  return raw;
}

function writeRaw(key: string, raw: string | null) {
  memory.set(key, raw);
  try {
    if (raw === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, raw);
  } catch {
    // Storage is full or blocked: the in-memory value still works for this visit.
  }
  notify(key);
}

function subscribe(key: string, listener: () => void) {
  let keyListeners = listeners.get(key);
  if (!keyListeners) {
    keyListeners = new Set();
    listeners.set(key, keyListeners);
  }
  keyListeners.add(listener);
  return () => {
    keyListeners?.delete(listener);
  };
}

if (typeof window !== "undefined") {
  // Another tab changed storage: pick up the new value.
  window.addEventListener("storage", (event) => {
    if (event.key === null) {
      const keys = [...memory.keys()];
      memory.clear();
      keys.forEach(notify);
      return;
    }
    memory.set(event.key, event.newValue);
    notify(event.key);
  });
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

type SetStateArg<T> = T | ((previous: T) => T);

/** Updates a stored value from outside React (e.g. an event log written by several features). */
export function updatePersistentState<T>(key: string, fallback: T, next: SetStateArg<T>) {
  const previous = parse(readRaw(key), fallback);
  const resolved = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
  writeRaw(key, JSON.stringify(resolved));
}

/** Deletes every stored value whose key starts with one of the prefixes. */
export function clearPersistentState(prefixes: string[]) {
  const keys = new Set(memory.keys());
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) keys.add(key);
    }
  } catch {
    // Storage is blocked: only the in-memory keys exist.
  }
  keys.forEach((key) => {
    if (prefixes.some((prefix) => key.startsWith(prefix))) writeRaw(key, null);
  });
}

/** Like useState, but saved in localStorage and shared by every component using the same key. */
export function usePersistentState<T>(key: string, initialValue: T) {
  // Only the first initial value is used, so callers can pass inline objects and arrays.
  const initialRef = useRef(initialValue);
  const subscribeToKey = useCallback((listener: () => void) => subscribe(key, listener), [key]);
  const raw = useSyncExternalStore(subscribeToKey, () => readRaw(key));
  const value = useMemo(() => parse(raw, initialRef.current), [raw]);

  const setValue = useCallback(
    (next: SetStateArg<T>) => updatePersistentState(key, initialRef.current, next),
    [key],
  );

  return [value, setValue] as const;
}
