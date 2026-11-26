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

  test("dates in emails have leading zeros", () => {
    expect(pbLocale.formatDate(JAN_5, "en")).toBe("01/05/2026");
    expect(pbLocale.formatDate(JAN_5, "en_gb")).toBe("05/01/2026");
    expect(pbLocale.formatDate(JAN_5, "de")).toBe("05.01.2026");
  });

  test("dates in emails match the website", () => {
    for (const locale of [
      "en",
      "de",
      "en-GB",
      "en-IE",
      "en-NZ",
      "en-IN",
      "en-PH",
      "en-US",
      "en-AU",
      "en-CA",
      "en-ZA",
      "de-DE",
      "de-AT",
      "de-CH",
    ]) {
      for (const date of [NOV_16, JAN_5]) {
        expect(pbLocale.formatDate(date, locale)).toBe(
          formatDate(date, "DD.MM.YYYY", locale)
        );
      }
    }
  });
});
