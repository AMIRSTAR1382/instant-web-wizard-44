import { useCallback } from "react";
import { updatePersistentState, usePersistentState } from "@/hooks/use-persistent-state";
import type { LocalizedText } from "@/lib/i18n";

export type ActivityType = "joined" | "left" | "created" | "deleted" | "profile";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  /** The community the entry is about (kept with its name, in case it is deleted later). */
  communityId?: string;
  communityName?: LocalizedText;
  /** Milliseconds since 1970. */
  at: number;
}

const ACTIVITY_KEY = "activity.log";
const MAX_ENTRIES = 50;

/** Records something the visitor did; shown under "Your activity" in the profile panel. */
export function logActivity(entry: Omit<ActivityEntry, "id" | "at">) {
  const full: ActivityEntry = {
    ...entry,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
  };
  updatePersistentState<ActivityEntry[]>(ACTIVITY_KEY, [], (previous) => [full, ...previous].slice(0, MAX_ENTRIES));
}

export function useActivityLog() {
  const [entries, setEntries] = usePersistentState<ActivityEntry[]>(ACTIVITY_KEY, []);
  const clear = useCallback(() => setEntries([]), [setEntries]);
  return { entries, clear };
}
