import { Link } from "react-router-dom";
import { usePreferences } from "@/context/PreferencesContext";
import { intlLocale } from "@/lib/i18n";
import type { TranslationKey } from "@/i18n/en";

const links: { to: string; label: TranslationKey }[] = [
  { to: "/about", label: "footer.about" },
  { to: "/contact", label: "footer.contact" },
  { to: "/privacy", label: "footer.privacy" },
  { to: "/terms", label: "footer.terms" },
];

/** Links to the About, Contact, Privacy and Terms pages, at the bottom of every page. */
export const SiteFooter = () => {
  const { t, locale } = usePreferences();
  // Solar Hijri year in Persian (۱۴۰۵), Gregorian in English (2026).
  const year = new Intl.DateTimeFormat(intlLocale(locale), { year: "numeric" }).format(new Date());

  return (
    <footer className="mt-12 flex flex-col gap-3 border-t border-border pb-2 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label={t("footer.label")}>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="transition-colors hover:text-foreground">
                {t(link.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p>{t("footer.rights", { year })}</p>
    </footer>
  );
};
