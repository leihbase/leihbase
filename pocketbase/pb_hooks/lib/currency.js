// Formatting of deposits, in the currency set on the leihbase record.
// Keep in sync with web/lib/currency.ts, so emails and the website match.

const DEFAULT_CURRENCY = "EUR";

/**
 * Symbols of common currencies. Currencies not listed are shown with their
 * code, e.g. "CAD 10", as their symbol could be ambiguous.
 * @type {Record<string, string>}
 */
const SYMBOLS = {
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
 * Returns the currency set on the leihbase record, or the default
 * @returns {string}
 */
function getCurrency() {
  try {
    const leihbase = $app.findAllRecords("leihbase")[0];
    return leihbase?.getString("currency") || DEFAULT_CURRENCY;
  } catch (e) {
    return DEFAULT_CURRENCY;
  }
}

/**
 * Returns the symbol of a currency, or its code
 * @param {string} currency
 * @returns {string}
 */
function currencySymbol(currency) {
  return SYMBOLS[currency] || currency;
}

/**
 * Formats a number without rounding: whole numbers as is ("10"), others with
 * two decimals ("7.50", or "7,50" in de)
 * @param {number | string} amount
 * @param {string} locale
 * @returns {string}
 */
function formatNumber(amount, locale) {
  const n = Number(amount);
  if (amount === "" || !Number.isFinite(n)) return `${amount}`;
  const formatted = Number.isInteger(n) ? `${n}` : n.toFixed(2);
  return locale === "de" ? formatted.replace(".", ",") : formatted;
}

/**
 * Formats an amount, e.g. "€10" (en) or "10€" (de), "€7.50" or "7,50€".
 * Symbols made of letters are separated by a space: "CHF 10" or "10 CHF".
 * @param {number | string} amount
 * @param {string} locale
 * @param {string} [currency]
 * @returns {string}
 */
function formatAmount(amount, locale, currency = getCurrency()) {
  const symbol = currencySymbol(currency);
  const separator = /^[a-z]/i.test(symbol) ? " " : "";
  const number = formatNumber(amount, locale);
  return locale === "de"
    ? `${number}${separator}${symbol}`
    : `${symbol}${separator}${number}`;
}

module.exports = {
  SYMBOLS,
  currencySymbol,
  formatAmount,
  getCurrency,
};
