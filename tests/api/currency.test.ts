import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";
import { formatCurrency, SYMBOLS } from "../../web/lib/currency";

/*
 * The back-end (emails) and the web app each have their own copy of the
 * currency formatting.
 *
 * These tests make sure both copies format amounts the same way.
 */

const require = createRequire(import.meta.url);
const pbCurrency = require("../../pocketbase/pb_hooks/lib/currency.js") as {
  SYMBOLS: Record<string, string>;
  formatAmount: (
    amount: number | string,
    locale: string,
    currency?: string
  ) => string;
};

test.describe("currency formatting", () => {
  test("formats whole and decimal amounts", () => {
    const cases: [number, string, string, string][] = [
      [10, "en", "EUR", "€10"],
      [10, "de", "EUR", "10€"],
      [7.5, "en", "EUR", "€7.50"],
      [7.5, "de", "EUR", "7,50€"],
      [12.25, "en", "GBP", "£12.25"],
      [12.25, "de", "CHF", "12,25 CHF"],
      [0.1, "en", "CAD", "CAD 0.10"],
    ];
    for (const [amount, locale, currency, expected] of cases) {
      expect(formatCurrency(amount, locale, currency)).toBe(expected);
      expect(pbCurrency.formatAmount(amount, locale, currency)).toBe(expected);
    }
  });

  test("back-end and web app list the same currency symbols", () => {
    expect(pbCurrency.SYMBOLS).toEqual(SYMBOLS);
  });

  test("back-end and web app format the same", () => {
    // Listed currencies, and one shown with its code
    for (const currency of [...Object.keys(SYMBOLS), "CAD"]) {
      for (const locale of ["en", "de"]) {
        for (const amount of [0, 5, 7.5, 12.25, 100, "42", "3.5"]) {
          expect(pbCurrency.formatAmount(amount, locale, currency)).toBe(
            formatCurrency(amount, locale, currency)
          );
        }
      }
    }
  });
});
