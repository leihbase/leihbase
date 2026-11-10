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
 * Formats an amount, e.g. "€10" (en) or "10€" (de). Symbols made of letters
 * are separated by a space: "CHF 10" or "10 CHF".
 * @param {number | string} amount
 * @param {string} locale
 * @param {string} [currency]
 * @returns {string}
 */
function formatAmount(amount, locale, currency = getCurrency()) {
  const symbol = currencySymbol(currency);
  const separator = /^[a-z]/i.test(symbol) ? " " : "";
  return locale === "de"
    ? `${amount}${separator}${symbol}`
    : `${symbol}${separator}${amount}`;
}

module.exports = {
  currencySymbol,
  formatAmount,
  getCurrency,
};
