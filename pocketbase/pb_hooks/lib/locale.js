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
 * The language of a locale, which may have a region: "en-GB" -> "en".
 * Texts, such as the default email templates, are chosen by language.
 * @param {string} locale
 * @returns {string}
 */
function getLanguage(locale) {
  return String(locale || "")
    .split(/[-_]/)[0]
    .toLowerCase();
}

/**
 * Date patterns by locale. A locale that is not listed uses "<language>-*"
 * when it has a region.
 * @type {Record<string, string>}
 */
const DATE_PATTERNS = {
  // English without a region is en-US
  en: "MM/DD/YYYY",
  "en-US": "MM/DD/YYYY",
  "en-PH": "MM/DD/YYYY",
  "en-GB": "DD/MM/YYYY",
  "en-CA": "YYYY-MM-DD",
  "en-ZA": "YYYY/MM/DD",
  // Other English regions: en-AU, en-IE, en-IN, ...
  "en-*": "DD/MM/YYYY",
  de: "DD.MM.YYYY",
};

/**
 * Formats a date, locale aware
 * @param {Date} date
 * @param {string} locale
 * @returns {string}
 */
function formatDate(date, locale) {
  if (!date) return "";
  const language = getLanguage(locale);
  const region = (String(locale || "").split(/[-_]/)[1] || "").toUpperCase();
  const pattern =
    (region &&
      (DATE_PATTERNS[`${language}-${region}`] ||
        DATE_PATTERNS[`${language}-*`])) ||
    DATE_PATTERNS[language] ||
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
