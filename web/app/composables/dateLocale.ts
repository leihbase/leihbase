import { DEFAULT_CURRENCY } from "@@/lib/currency";
import { dateLocale } from "@@/lib/date";

/**
 * The locale to format dates in, from the current locale and the currency set
 * on the leihbase record (see dateLocale)
 */
export function useDateLocale() {
  const { locale } = useI18n();
  const { leihbase } = storeToRefs(useLeihbase());
  return computed(() =>
    dateLocale(locale.value, leihbase.value?.currency || DEFAULT_CURRENCY)
  );
}
