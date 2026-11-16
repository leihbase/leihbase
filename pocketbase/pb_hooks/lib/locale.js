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
 * Formats a date for emails. Without a region, as before: "16/11/2026" (en)
 * or "16.11.2026" (de), without leading zeros. With a region, as on the
 * website (formatDate "DD.MM.YYYY" in web/lib/date.ts): "16/11/2026" (en-GB),
 * "11/16/2026" (en-US), "05.01.2026" (de-AT). Keep the two in sync.
 * @param {Date} date
 * @param {string} locale
 * @returns {string}
 */
function formatDate(date, locale) {
  if (!date) return "";
  const [, region] = String(locale || "").split(/[-_]/);
  const language = getLanguage(locale);
  // Dates are stored as UTC midnight
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();
  if (!region) {
    return language === "de"
      ? `${day}.${month}.${year}`
      : `${day}/${month}/${year}`;
  }
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  if (language === "de") return `${dd}.${mm}.${year}`;
  if (region.toUpperCase() === "US") return `${mm}/${dd}/${year}`;
  return `${dd}/${mm}/${year}`;
}

module.exports = {
  LOCALES,
  isValidLocale,
  getLanguage,
  formatDate,
};
