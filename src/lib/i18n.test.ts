import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { fa } from "@/i18n/fa";
import { createTranslator, directionOf, formatCompactNumber, formatNumber, formatRelativeTime } from "./i18n";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("translations", () => {
  it("has Persian text for every English key", () => {
    const missing = Object.keys(en).filter((key) => !fa[key as keyof typeof fa]?.trim());
    expect(missing).toEqual([]);
  });

  it("has no Persian keys that English lacks", () => {
    const extra = Object.keys(fa).filter((key) => !(key in en));
    expect(extra).toEqual([]);
  });

  it("uses the same {placeholders} in both languages", () => {
    const mismatched = Object.keys(en).filter((key) => {
      const persian = fa[key as keyof typeof fa] ?? "";
      return placeholders(en[key as keyof typeof en]).join() !== placeholders(persian).join();
    });
    expect(mismatched).toEqual([]);
  });
});

describe("createTranslator", () => {
  it("fills in parameters and writes numbers in the visitor's language", () => {
    const key = Object.keys(en).find((k) => /\{\w+\}/.test(en[k as keyof typeof en])) as keyof typeof en;
    const name = placeholders(en[key])[0];
    expect(createTranslator("en")(key, { [name]: "Ali" })).toContain("Ali");
    expect(createTranslator("fa")(key, { [name]: 25 })).toContain("۲۵");
  });

  it("leaves unknown placeholders as they are", () => {
    const key = Object.keys(en).find((k) => /\{\w+\}/.test(en[k as keyof typeof en])) as keyof typeof en;
    expect(createTranslator("en")(key, {})).toBe(en[key]);
  });
});

describe("formatting", () => {
  it("uses Persian digits for Persian", () => {
    expect(formatNumber(1234, "fa")).toBe("۱٬۲۳۴");
    expect(formatNumber(1234, "en")).toBe("1,234");
  });

  it("shortens large numbers", () => {
    expect(formatCompactNumber(256_000, "en")).toBe("256K");
    expect(formatCompactNumber(256_000, "fa")).toContain("۲۵۶");
  });

  it("describes recent times relative to now", () => {
    const now = Date.UTC(2026, 10, 6, 12);
    expect(formatRelativeTime(now - 5 * 60_000, "en", now)).toBe("5 minutes ago");
    expect(formatRelativeTime(now - 5 * 60_000, "fa", now)).toBe("۵ دقیقه پیش");
  });

  it("is right-to-left for Persian only", () => {
    expect(directionOf("fa")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
  });
});
