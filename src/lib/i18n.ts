import { en, type TranslationKey } from "@/i18n/en";
import { fa } from "@/i18n/fa";

export type Locale = "en" | "fa";
export type Direction = "ltr" | "rtl";
/** Text that is written once per language, e.g. a community name. */
export type LocalizedText = Record<Locale, string>;
export type TranslationParams = Record<string, string | number>;
export type Translator = (key: TranslationKey, params?: TranslationParams) => string;

export const locales: { code: Locale; label: string; flag: string }[] = [
  { code: "fa", label: "فارسی", flag: "🇮🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, fa };

export const isLocale = (value: unknown): value is Locale => value === "en" || value === "fa";

export const directionOf = (locale: Locale): Direction => (locale === "fa" ? "rtl" : "ltr");

/** BCP 47 tag for Intl APIs. fa-IR gives Persian digits and the Solar Hijri calendar. */
export const intlLocale = (locale: Locale) => (locale === "fa" ? "fa-IR" : "en-US");

/** Persian for visitors whose browser asks for it, English for everyone else. */
export function detectLocale(): Locale {
  try {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    return languages.some((lang) => lang?.toLowerCase().startsWith("fa")) ? "fa" : "en";
  } catch {
    return "en";
  }
}

const numberFormats = new Map<string, Intl.NumberFormat>();
function numberFormat(locale: Locale, options?: Intl.NumberFormatOptions) {
  const cacheKey = `${locale}:${JSON.stringify(options ?? {})}`;
  let format = numberFormats.get(cacheKey);
  if (!format) {
    format = new Intl.NumberFormat(intlLocale(locale), options);
    numberFormats.set(cacheKey, format);
  }
  return format;
}

export const formatNumber = (value: number, locale: Locale) => numberFormat(locale).format(value);

/** 256000 -> "256K" / "۲۵۶ هزار" */
export const formatCompactNumber = (value: number, locale: Locale) =>
  numberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);

/** A timestamp as "5 minutes ago" / "۵ دقیقه پیش"; older than a week becomes a date. */
export function formatRelativeTime(timestamp: number, locale: Locale, now = Date.now()) {
  const seconds = Math.round((timestamp - now) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: "auto" });
  if (abs < 60) return rtf.format(0, "second");
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 604800) return rtf.format(Math.round(seconds / 86400), "day");
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" }).format(timestamp);
}

export function createTranslator(locale: Locale): Translator {
  const dictionary = dictionaries[locale];
  return (key, params) => {
    const template = dictionary[key] ?? en[key] ?? key;
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
      const value = params[name];
      if (value === undefined) return match;
      return typeof value === "number" ? formatNumber(value, locale) : value;
    });
  };
}
