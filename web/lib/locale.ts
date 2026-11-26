/**
 * The language of a locale, which may have a region: "en-GB" -> "en". Texts
 * are chosen by language, dates and numbers are formatted with the full locale.
 */
export function getLanguage(locale: string) {
  return (locale || "").split("-")[0]!.toLowerCase();
}
