import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SearchCommand } from "@/components/SearchCommand";
import { CreateCommunityDialog } from "@/components/CreateCommunityDialog";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import type { CategoryId } from "@/data/communities";

interface DialogsValue {
  openSearch: () => void;
  /** Opens the "Create a community" form, optionally with a category already picked. */
  openCreateCommunity: (category?: CategoryId) => void;
  openEditProfile: () => void;
}

const DialogsContext = createContext<DialogsValue | null>(null);

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** App-wide dialogs that can be opened from anywhere (header, rail, pages, settings). */
export const DialogsProvider = ({ children }: { children: ReactNode }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<CategoryId | undefined>();
  const [profileOpen, setProfileOpen] = useState(false);

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

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const openCreateCommunity = useCallback((category?: CategoryId) => {
    setCreateCategory(category);
    setCreateOpen(true);
  }, []);
  const openEditProfile = useCallback(() => setProfileOpen(true), []);

  const value = useMemo(
    () => ({ openSearch, openCreateCommunity, openEditProfile }),
    [openSearch, openCreateCommunity, openEditProfile],
  );

  return (
    <DialogsContext.Provider value={value}>
      {children}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      <CreateCommunityDialog open={createOpen} onOpenChange={setCreateOpen} initialCategory={createCategory} />
      <EditProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </DialogsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useDialogs() {
  const context = useContext(DialogsContext);
  if (!context) throw new Error("useDialogs must be used inside <DialogsProvider>");
  return context;
}
