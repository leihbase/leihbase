import { expect, test } from "@playwright/test";
import { formatCurrency } from "../../web/lib/currency";
import { formatDate } from "../../web/lib/date";
import { languageOf } from "../../web/lib/locale";
import { requireHook } from "../lib/hooks";

/*
 * NUXT_PUBLIC_LOCALE and CONFIG_LOCALE may have a region, e.g. "en-GB". Texts
 * use the language, dates and numbers the full locale. The back-end (emails)
 * has its own copy of the date formatting.
 */

const pbLocale = requireHook<{
  getLanguage: (locale: string) => string;
  formatDate: (date: Date, locale: string) => string;
}>("lib/locale");
const pbCurrency = requireHook<{
  formatAmount: (amount: number, locale: string, currency?: string) => string;
}>("lib/currency");

const NOV_16 = new Date(Date.UTC(2026, 10, 16));
const JAN_5 = new Date(Date.UTC(2026, 0, 5));

test.describe("locales with a region", () => {
  test("texts use the language of the locale", () => {
    for (const [locale, language] of [
      ["en", "en"],
      ["en-GB", "en"],
      ["en_US", "en"],
      ["de-AT", "de"],
      ["DE-ch", "de"],
    ]) {
      expect(languageOf(locale!)).toBe(language);
      expect(pbLocale.getLanguage(locale!)).toBe(language);
    }
  });

  test("dates on the website follow the region", () => {
    expect(formatDate(NOV_16, "DD.MM.YYYY", "en")).toBe("11/16/2026");
    expect(formatDate(NOV_16, "DD.MM.YYYY", "en-US")).toBe("11/16/2026");
    expect(formatDate(NOV_16, "DD.MM.YYYY", "en-GB")).toBe("16/11/2026");
    expect(formatDate(NOV_16, "DD.MM.YYYY", "de")).toBe("16.11.2026");
    expect(formatDate(NOV_16, "dd, D MMM YYYY", "en")).toBe(
      "Mon, Nov 16, 2026"
    );
    expect(formatDate(NOV_16, "dd, D MMM YYYY", "en-GB")).toBe(
      "Mon, 16 Nov 2026"
    );
  });

  test("dates in emails without a region are unchanged", () => {
    expect(pbLocale.formatDate(JAN_5, "en")).toBe("5/1/2026");
    expect(pbLocale.formatDate(JAN_5, "de")).toBe("5.1.2026");
  });

  test("dates in emails with a region match the website", () => {
    for (const locale of ["en-GB", "en-US", "en-AU", "de-DE", "de-AT"]) {
      for (const date of [NOV_16, JAN_5]) {
        expect(pbLocale.formatDate(date, locale)).toBe(
          formatDate(date, "DD.MM.YYYY", locale)
        );
      }
    }
  });

  test("amounts use the language of the locale", () => {
    for (const [locale, expected] of [
      ["en-GB", "£7.50"],
      ["de-AT", "7,50£"],
    ]) {
      expect(formatCurrency(7.5, locale!, "GBP")).toBe(expected);
      expect(pbCurrency.formatAmount(7.5, locale!, "GBP")).toBe(expected);
    }
  });
});
