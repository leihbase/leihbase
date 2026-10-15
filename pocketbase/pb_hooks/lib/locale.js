// Allowed locales for template loading (prevents path traversal)
const LOCALES = ["en", "de"];

/**
 * @param {string} locale
 * @returns {boolean}
 */
function isValidLocale(locale) {
  return LOCALES.indexOf(locale) !== -1;
}

module.exports = {
  LOCALES,
  isValidLocale
};
