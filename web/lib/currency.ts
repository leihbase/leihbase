// Formatting of deposits, in the currency set on the leihbase record.
// Keep in sync with pocketbase/pb_hooks/lib/currency.js, so emails and the
// website match.

export const DEFAULT_CURRENCY = "EUR";

/**
 * Symbols of common currencies. Currencies not listed are shown with their
 * code, e.g. "CAD 10", as their symbol could be ambiguous.
 */
export const SYMBOLS: Record<string, string> = {
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
 * Formats a number without rounding: whole numbers as is ("10"), others with
 * two decimals ("7.50", or "7,50" in de)
 */
function formatNumber(amount: number | string | undefined, locale: string) {
  const n = Number(amount);
  if (amount === undefined || amount === "" || !Number.isFinite(n)) {
    return `${amount ?? ""}`;
  }
  const formatted = Number.isInteger(n) ? `${n}` : n.toFixed(2);
  return locale === "de" ? formatted.replace(".", ",") : formatted;
}

/**
 * Formats an amount, e.g. "€10" (en) or "10€" (de), "€7.50" or "7,50€".
 * Symbols made of letters are separated by a space: "CHF 10" or "10 CHF".
 */
export function formatCurrency(
  amount: number | string | undefined,
  locale: string,
  currency: string = DEFAULT_CURRENCY
) {
  const symbol = currencySymbol(currency);
  const separator = /^[a-z]/i.test(symbol) ? " " : "";
  const number = formatNumber(amount, locale);
  return locale === "de"
    ? `${number}${separator}${symbol}`
    : `${symbol}${separator}${number}`;
}
