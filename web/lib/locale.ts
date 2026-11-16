/**
 * The language of a locale, which may have a region: "en-GB" -> "en". Texts
 * are chosen by language, dates and numbers are formatted with the full locale.
 */
export function languageOf(locale: string) {
  return (locale || "").split(/[-_]/)[0]!.toLowerCase();
}
