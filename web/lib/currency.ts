// Formatting of deposits, in the currency set on the leihbase record.
// Keep in sync with pocketbase/pb_hooks/lib/currency.js, so emails and the
// website match.

export const DEFAULT_CURRENCY = "EUR";

/**
 * Symbols of common currencies. Currencies not listed are shown with their
 * code, e.g. "CAD 10", as their symbol could be ambiguous.
 */
const SYMBOLS: Record<string, string> = {
  EUR: "€",
  GBP: "£",
  USD: "$",
  CHF: "CHF",
  JPY: "¥",
  PLN: "zł",
  CZK: "Kč",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
};

/**
 * Returns the symbol of a currency, or its code
 */
export function currencySymbol(currency: string = DEFAULT_CURRENCY) {
  return SYMBOLS[currency] || currency;
}

/**
 * Formats an amount, e.g. "€10" (en) or "10€" (de). Symbols made of letters
 * are separated by a space: "CHF 10" or "10 CHF".
 */
export function formatCurrency(
  amount: number | string | undefined,
  locale: string,
  currency: string = DEFAULT_CURRENCY
) {
  const symbol = currencySymbol(currency);
  const separator = /^[a-z]/i.test(symbol) ? " " : "";
  return locale === "de"
    ? `${amount}${separator}${symbol}`
    : `${symbol}${separator}${amount}`;
}
