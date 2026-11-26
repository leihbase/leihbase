// Allowed locales for template loading (prevents path traversal)
const LOCALES = ["en", "de"];

/**
 * @param {string} locale
 * @returns {boolean}
 */
function isValidLocale(locale) {
  return LOCALES.indexOf(locale) !== -1;
}

/**
 * The language of a locale, which may have a region: "en-GB" -> "en". Texts,
 * such as the default email templates, are chosen by language.
 * @param {string} locale
 * @returns {string}
 */
function getLanguage(locale) {
  return String(locale || "")
    .split(/[-_]/)[0]
    .toLowerCase();
}

/**
 * Date patterns by locale, or by language when a locale is not listed. They
 * follow the website (formatDate "DD.MM.YYYY" in web/lib/date.ts), which uses
 * Intl. PocketBase has no Intl, so keep the two in sync.
 * @type {Record<string, string>}
 */
const DATE_PATTERNS = {
  "en-US": "MM/DD/YYYY",
  "en-GB": "DD/MM/YYYY",
  "en-CA": "YYYY-MM-DD",
  "en-ZA": "YYYY/MM/DD",
  en: "DD/MM/YYYY",
  de: "DD.MM.YYYY",
};

/**
 * Formats a date for emails, e.g. "05/01/2026" (en), "01/05/2026" (en-US) or
 * "05.01.2026" (de)
 * @param {Date} date
 * @param {string} locale
 * @returns {string}
 */
function formatDate(date, locale) {
  if (!date) return "";
  const [language, region = ""] = String(locale || "").split(/[-_]/);
  const pattern =
    DATE_PATTERNS[`${language}-${region.toUpperCase()}`] ||
    DATE_PATTERNS[getLanguage(locale)] ||
    DATE_PATTERNS.en;
  const pad = (/** @type {number} */ n) => (n < 10 ? `0${n}` : `${n}`);
  // Dates are stored as UTC midnight
  return pattern
    .replace("DD", pad(date.getUTCDate()))
    .replace("MM", pad(date.getUTCMonth() + 1))
    .replace("YYYY", `${date.getUTCFullYear()}`);
}

module.exports = {
  LOCALES,
  isValidLocale,
  getLanguage,
  formatDate,
};
