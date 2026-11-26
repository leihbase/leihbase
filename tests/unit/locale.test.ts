import { expect, test } from "@playwright/test";
import { formatDate } from "../../web/lib/date";
import { getLanguage } from "../../web/lib/locale";
import { requireHook } from "../lib/hooks";

/*
 * The back-end and the web app each have their own copy of
 * date formatting.
 *
 * These tests make sure both copies format dates the same way.
 */

const pbLocale = requireHook<{
  getLanguage: (locale: string) => string;
  formatDate: (date: Date, locale: string) => string;
}>("lib/locale");

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
      expect(getLanguage(locale!)).toBe(language);
      expect(pbLocale.getLanguage(locale!)).toBe(language);
    }
  });

  test("dates on the website and in emails follow the region", () => {
    for (const [locale, expected] of [
      ["en", "01/05/2026"],
      ["en-US", "01/05/2026"],
      ["en-GB", "05/01/2026"],
      ["en-AU", "05/01/2026"],
      ["en-CA", "2026-01-05"],
      ["de", "05.01.2026"],
      ["de-AT", "05.01.2026"],
    ]) {
      expect(formatDate(JAN_5, "DD.MM.YYYY", locale!)).toBe(expected);
      expect(pbLocale.formatDate(JAN_5, locale!)).toBe(expected);
    }
  });

  test("dates with a month name on the website follow the region", () => {
    expect(formatDate(NOV_16, "dd, D MMM YYYY", "en")).toBe(
      "Mon, Nov 16, 2026"
    );
    expect(formatDate(NOV_16, "dd, D MMM YYYY", "en-GB")).toBe(
      "Mon, 16 Nov 2026"
    );
  });
});
