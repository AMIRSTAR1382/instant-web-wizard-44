import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePreferences } from "@/context/PreferencesContext";
import { siteConfig } from "@/config/site";

function setMeta(selector: string, attribute: "content" | "href", value: string) {
  document.head.querySelector(selector)?.setAttribute(attribute, value);
}

function setRobots(noIndex: boolean) {
  let tag = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (noIndex && !tag) {
    tag = document.createElement("meta");
    tag.name = "robots";
    document.head.appendChild(tag);
  }
  if (noIndex) tag?.setAttribute("content", "noindex");
  else tag?.remove();
}

interface PageMetaOptions {
  /** A short summary for search results and link previews. */
  description?: string;
  /** Keep this page out of search engines (e.g. "not found"). */
  noIndex?: boolean;
}

/**
 * Sets the browser tab title (e.g. "Gaming | Explore") plus the description, canonical
 * address and social-preview tags for the current page.
 */
export function useDocumentTitle(title?: string, { description, noIndex = false }: PageMetaOptions = {}) {
  const { t } = usePreferences();
  const { pathname } = useLocation();

  useEffect(() => {
    const app = t("app.name");
    const fullTitle = title ? `${title} | ${app}` : `${app} | ${t("app.tagline")}`;
    const summary = description ?? t("home.heroSubtitle");
    const url = `${siteConfig.url.replace(/\/+$/, "")}${pathname}`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', "content", summary);
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", summary);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('link[rel="canonical"]', "href", url);
    setRobots(noIndex);
  }, [title, description, noIndex, pathname, t]);
}
