import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SearchCommand } from "@/components/SearchCommand";
import { CreateCommunityDialog } from "@/components/CreateCommunityDialog";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { AuthDialog, type AuthMode } from "@/components/AuthDialog";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import type { CategoryId } from "@/data/communities";

export interface SignInOptions {
  mode?: AuthMode;
  /** Shown under the title, e.g. "Sign in to join Gaming Zone." */
  reason?: string;
  /** Runs once the visitor has signed in or created an account. */
  onSignedIn?: () => void;
}

interface DialogsValue {
  openSearch: () => void;
  /** Opens the "Create a community" form (after signing in), optionally with a category already picked. */
  openCreateCommunity: (category?: CategoryId) => void;
  openEditProfile: () => void;
  openSignIn: (options?: SignInOptions) => void;
  openChangePassword: () => void;
  /** Runs the action now when signed in; otherwise asks the visitor to sign in first, then runs it. */
  requireAccount: (reason: string, action: () => void) => void;
}

const DialogsContext = createContext<DialogsValue | null>(null);

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** App-wide dialogs that can be opened from anywhere (header, rail, pages, settings). */
export const DialogsProvider = ({ children }: { children: ReactNode }) => {
  const { t } = usePreferences();
  const { account } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<CategoryId | undefined>();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [auth, setAuth] = useState<{ open: boolean; mode: AuthMode; reason?: string }>({ open: false, mode: "signIn" });
  // Kept outside state: it must not re-render anything, and it runs at most once.
  const afterSignIn = useRef<(() => void) | undefined>();

  // Ctrl+K / Cmd+K anywhere, or "/" when not typing, opens search.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      const slash = event.key === "/" && !event.ctrlKey && !event.metaKey && !isTypingTarget(event.target);
      if (shortcut || slash) {
        event.preventDefault();
        setSearchOpen((open) => !open || !shortcut);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openSignIn = useCallback((options: SignInOptions = {}) => {
    afterSignIn.current = options.onSignedIn;
    setAuth({ open: true, mode: options.mode ?? "signIn", reason: options.reason });
  }, []);

  const requireAccount = useCallback(
    (reason: string, action: () => void) => {
      if (account) action();
      else openSignIn({ reason, onSignedIn: action });
    },
    [account, openSignIn],
  );

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const openCreateCommunity = useCallback(
    (category?: CategoryId) =>
      requireAccount(t("auth.reasonCreate"), () => {
        setCreateCategory(category);
        setCreateOpen(true);
      }),
    [requireAccount, t],
  );
  const openEditProfile = useCallback(() => setProfileOpen(true), []);
  const openChangePassword = useCallback(() => setPasswordOpen(true), []);

  const handleAuthOpenChange = useCallback((open: boolean) => {
    setAuth((previous) => ({ ...previous, open }));
    if (!open) {
      // Closed without signing in: forget what was waiting. (After a sign-in the dialog closes
      // first and runs the waiting action right after, before this clears it.)
      queueMicrotask(() => {
        afterSignIn.current = undefined;
      });
    }
  }, []);

  const handleSignedIn = useCallback(() => {
    const action = afterSignIn.current;
    afterSignIn.current = undefined;
    action?.();
  }, []);

  const value = useMemo(
    () => ({ openSearch, openCreateCommunity, openEditProfile, openSignIn, openChangePassword, requireAccount }),
    [openSearch, openCreateCommunity, openEditProfile, openSignIn, openChangePassword, requireAccount],
  );

  return (
    <DialogsContext.Provider value={value}>
      {children}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      <CreateCommunityDialog open={createOpen} onOpenChange={setCreateOpen} initialCategory={createCategory} />
      <EditProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
      <AuthDialog
        open={auth.open}
        onOpenChange={handleAuthOpenChange}
        initialMode={auth.mode}
        reason={auth.reason}
        onSignedIn={handleSignedIn}
      />
    </DialogsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useDialogs() {
  const context = useContext(DialogsContext);
  if (!context) throw new Error("useDialogs must be used inside <DialogsProvider>");
  return context;
}
