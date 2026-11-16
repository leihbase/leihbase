import { languageOf } from "@@/lib/locale";

/**
 * The locale to format dates and numbers in: NUXT_PUBLIC_LOCALE with its
 * region (e.g. "en-GB"), while the current language is that locale's language.
 * Otherwise the current language, e.g. "en".
 */
export function useFormatLocale() {
  const { locale } = useI18n();
  const configured = useRuntimeConfig().public.locale;
  return computed(() =>
    configured && languageOf(configured) === locale.value
      ? configured
      : locale.value
  );
}
