import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  createTranslator,
  detectLocale,
  directionOf,
  formatCompactNumber,
  formatNumber,
  formatRelativeTime,
  isLocale,
  type Direction,
  type Locale,
  type LocalizedText,
  type Translator,
} from "@/lib/i18n";

export type ThemePreference = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

interface PreferencesValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: Direction;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  resolvedTheme: ResolvedTheme;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
  animations: boolean;
  setAnimations: (value: boolean) => void;
  /** UI text in the current language. */
  t: Translator;
  /** Picks the current language out of a `{ en, fa }` pair. */
  pick: (text: LocalizedText) => string;
  formatNumber: (value: number) => string;
  formatCompact: (value: number) => string;
  formatRelative: (timestamp: number) => string;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

// Theme colours for the browser UI (address bar on mobile), matching --background in index.css.
const THEME_COLORS: Record<ResolvedTheme, string> = { dark: "#0f121a", light: "#f5f6f9" };

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "dark" || value === "light" || value === "system";

/**
 * Site-wide preferences: language (with right-to-left layout for Persian), theme, compact
 * mode and animations. Everything is saved in localStorage. The inline script in index.html
 * applies the same classes before React loads, so the page never flashes the wrong theme.
 */
export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [storedLocale, setStoredLocale] = usePersistentState<string>("settings.language", detectLocale());
  const [storedTheme, setStoredTheme] = usePersistentState<string>("settings.theme", "dark");
  const [compactMode, setCompactMode] = usePersistentState("settings.compactMode", false);
  const [animations, setAnimations] = usePersistentState("settings.animations", true);
  const prefersLight = useMediaQuery("(prefers-color-scheme: light)");

  // Older versions offered languages that were never translated; treat those as unset.
  const locale: Locale = isLocale(storedLocale) ? storedLocale : detectLocale();
  const theme: ThemePreference = isThemePreference(storedTheme) ? storedTheme : "dark";
  const resolvedTheme: ResolvedTheme = theme === "system" ? (prefersLight ? "light" : "dark") : theme;
  const dir = directionOf(locale);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
  }, [locale, dir]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", resolvedTheme === "light");
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[resolvedTheme]);
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle("compact", compactMode);
  }, [compactMode]);

  useEffect(() => {
    // Turns motion off site-wide; see .reduce-motion in index.css.
    document.documentElement.classList.toggle("reduce-motion", !animations);
  }, [animations]);

  const setLocale = useCallback((next: Locale) => setStoredLocale(next), [setStoredLocale]);
  const setTheme = useCallback((next: ThemePreference) => setStoredTheme(next), [setStoredTheme]);

  const value = useMemo<PreferencesValue>(
    () => ({
      locale,
      setLocale,
      dir,
      theme,
      setTheme,
      resolvedTheme,
      compactMode,
      setCompactMode,
      animations,
      setAnimations,
      t: createTranslator(locale),
      pick: (text) => text[locale] || text.en,
      formatNumber: (n) => formatNumber(n, locale),
      formatCompact: (n) => formatCompactNumber(n, locale),
      formatRelative: (timestamp) => formatRelativeTime(timestamp, locale),
    }),
    [locale, setLocale, dir, theme, setTheme, resolvedTheme, compactMode, setCompactMode, animations, setAnimations],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return context;
}
