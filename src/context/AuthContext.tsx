import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useBackend } from "@/context/BackendContext";
import { clearPersistentState } from "@/hooks/use-persistent-state";
import type { Account, ProfileChanges, SignUpInput } from "@/lib/backend/types";

interface AuthValue {
  /** The signed-in person, or null for a visitor browsing without an account. */
  account: Account | null;
  signUp: (input: SignUpInput) => Promise<Account>;
  signIn: (email: string, password: string) => Promise<Account>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateAccount: (changes: ProfileChanges) => Promise<Account>;
}

const AuthContext = createContext<AuthValue | null>(null);

/** The visitor's account. The session is kept by the backend client (in this browser). */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const backend = useBackend();
  const [account, setAccount] = useState<Account | null>(() => backend.currentAccount());

  useEffect(() => backend.onAccountChange(setAccount), [backend]);

  // A saved session may have expired or been revoked: check it once per visit.
  useEffect(() => {
    backend
      .refreshSession()
      .then(setAccount)
      .catch(() => {
        // Server unreachable: keep the saved session; it is checked again on the next visit.
      });
  }, [backend]);

  const signOut = useCallback(() => {
    backend.signOut();
    // "Your activity" belongs to the person who was signed in.
    clearPersistentState(["activity."]);
  }, [backend]);

  const value = useMemo<AuthValue>(
    () => ({
      account,
      signUp: (input) => backend.signUp(input),
      signIn: (email, password) => backend.signIn(email, password),
      signOut,
      requestPasswordReset: (email) => backend.requestPasswordReset(email),
      changePassword: (currentPassword, newPassword) => backend.changePassword(currentPassword, newPassword),
      updateAccount: (changes) => backend.updateProfile(changes),
    }),
    [account, backend, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
