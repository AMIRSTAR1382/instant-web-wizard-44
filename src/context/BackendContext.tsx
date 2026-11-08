import { createContext, useContext, type ReactNode } from "react";
import type { Backend } from "@/lib/backend/types";

const BackendContext = createContext<Backend | null>(null);

/** Which server the site talks to: PocketBase on the real site, an in-memory one in tests. */
export const BackendProvider = ({ backend, children }: { backend: Backend; children: ReactNode }) => (
  <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>
);

// eslint-disable-next-line react-refresh/only-export-components
export function useBackend() {
  const backend = useContext(BackendContext);
  if (!backend) throw new Error("useBackend must be used inside <BackendProvider>");
  return backend;
}
