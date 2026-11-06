import { Suspense, useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Moon, Search, Sun, User } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/AppSidebar";
import { ServerIconsBar } from "@/components/ServerIconsBar";
import { UserActivity } from "@/components/UserActivity";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteFooter } from "@/components/SiteFooter";
import { DialogsProvider, useDialogs } from "@/context/DialogsContext";
import { usePreferences } from "@/context/PreferencesContext";

/** Shown while a page's code is downloading (pages are loaded on demand). */
const PageSkeleton = () => {
  const { t } = usePreferences();
  return (
    <div className="space-y-6" role="status" aria-label={t("app.loading")}>
      <Skeleton className="h-48 w-full rounded-2xl sm:h-64" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <Skeleton className="aspect-[4/3] rounded-2xl" />
        <Skeleton className="aspect-[4/3] rounded-2xl" />
      </div>
    </div>
  );
};

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

const Header = ({ onOpenProfile, profileOpen, profileButtonRef }: {
  onOpenProfile: () => void;
  profileOpen: boolean;
  profileButtonRef: RefObject<HTMLButtonElement>;
}) => {
  const { t, locale, setLocale, resolvedTheme, setTheme } = usePreferences();
  const { openSearch } = useDialogs();
  const iconButton =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-10 sm:w-10";

  return (
    <header className="z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:gap-3 sm:px-4">
      <SidebarTrigger aria-label={t("nav.toggleSidebar")} />

      {/* Looks like a search box; opens the search palette (also Ctrl+K or "/"). */}
      <button
        type="button"
        onClick={openSearch}
        aria-haspopup="dialog"
        aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
        className="flex h-10 min-w-0 max-w-2xl flex-1 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm text-muted-foreground transition-colors hover:border-primary/50"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{t("header.search")}</span>
        <kbd className="ms-auto hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block" dir="ltr">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <div className="ms-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => setLocale(locale === "fa" ? "en" : "fa")}
          aria-label={t("header.switchLanguageLabel")}
          title={t("header.switchLanguageLabel")}
          className={`${iconButton} w-auto px-2 text-xs font-semibold sm:w-auto`}
        >
          {t("header.switchLanguage")}
        </button>
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label={resolvedTheme === "dark" ? t("header.lightMode") : t("header.darkMode")}
          title={resolvedTheme === "dark" ? t("header.lightMode") : t("header.darkMode")}
          className={`${iconButton} hidden sm:flex`}
        >
          {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        {/* The profile panel is a permanent column from xl up; below that this opens it. */}
        <button
          ref={profileButtonRef}
          type="button"
          onClick={onOpenProfile}
          aria-label={t("header.openProfile")}
          aria-expanded={profileOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent transition-transform hover:scale-110 sm:h-10 sm:w-10 xl:hidden"
        >
          <User className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
        </button>
      </div>
    </header>
  );
};

export const MainLayout = () => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const { t } = usePreferences();

  // The content area is its own scroll container, so start each page at the top.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const closeRightSidebar = useCallback(() => {
    setRightSidebarOpen(false);
    // Hand focus back to the button that opened the drawer.
    profileButtonRef.current?.focus();
  }, []);

  return (
    <SidebarProvider>
      <DialogsProvider>
        {/* Moves keyboard focus straight to the page content, past the navigation. */}
        <button
          type="button"
          onClick={() => contentRef.current?.focus()}
          className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          {t("app.skipToContent")}
        </button>

        {/* Fixed to the viewport height: only the content column scrolls, so the header and
            the profile panel stay in place. */}
        <div className="flex h-svh w-full overflow-hidden bg-background md:ps-[72px]">
          <ServerIconsBar />
          <AppSidebar />

          <main className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Header
              onOpenProfile={() => setRightSidebarOpen(true)}
              profileOpen={rightSidebarOpen}
              profileButtonRef={profileButtonRef}
            />

            <div className="relative flex min-h-0 flex-1 overflow-hidden">
              <div
                ref={contentRef}
                id="main-content"
                tabIndex={-1}
                className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 outline-none sm:p-4 md:p-6"
              >
                <ErrorBoundary key={pathname}>
                  <Suspense fallback={<PageSkeleton />}>
                    <Outlet />
                  </Suspense>
                </ErrorBoundary>
                <SiteFooter />
              </div>
              <UserActivity isOpen={rightSidebarOpen} onClose={closeRightSidebar} />
            </div>
          </main>
        </div>
      </DialogsProvider>
    </SidebarProvider>
  );
};
