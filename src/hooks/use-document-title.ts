import { useEffect } from "react";
import { usePreferences } from "@/context/PreferencesContext";

/** Sets the browser tab title, e.g. "Gaming | Explore". */
export function useDocumentTitle(title?: string) {
  const { t } = usePreferences();
  useEffect(() => {
    const app = t("app.name");
    document.title = title ? `${title} | ${app}` : `${app} | ${t("app.tagline")}`;
  }, [title, t]);
}
