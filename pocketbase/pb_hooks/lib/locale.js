// Languages with translations, allowed for template loading (prevents path
// traversal)
const LANGUAGES = ["en", "de"];

/**
 * @param {string} language
 * @returns {boolean}
 */
function isValidLanguage(language) {
  return LANGUAGES.indexOf(language) !== -1;
}

/**
 * The language of a locale, which may have a region: "en-GB" -> "en".
 * Texts, such as the default email templates, are chosen by language.
 * @param {string} locale
 * @returns {string}
 */
function getLanguage(locale) {
  return String(locale || "")
    .split("-")[0]
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
  const region = (String(locale || "").split("-")[1] || "").toUpperCase();
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

/**
 * Get the locale used for emails and date/currency formatting.
 * @returns {string}
 */
function getLocale() {
  const locale = $os.getenv("CONFIG_LOCALE");
  if (!locale) return "en";
  if (isValidLanguage(getLanguage(locale))) return locale;
  console.error(
    `[locale] CONFIG_LOCALE "${locale}" is not supported, using "en". Use one of ${LANGUAGES.join(", ")}, optionally with a region, for example "en-GB".`
  );
  return "en";
}

module.exports = {
  LANGUAGES,
  isValidLanguage,
  getLanguage,
  getLocale,
  formatDate,
};
