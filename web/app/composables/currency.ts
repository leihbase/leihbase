import {
  currencySymbol,
  DEFAULT_CURRENCY,
  formatCurrency as format,
} from "@@/lib/currency";

/**
 * Formats deposits in the currency set on the leihbase record, and the
 * current locale
 */
export function useCurrency() {
  const { locale } = useI18n();
  const { leihbase } = storeToRefs(useLeihbase());
  const currency = computed(() => leihbase.value?.currency || DEFAULT_CURRENCY);

  return {
    symbol: computed(() => currencySymbol(currency.value)),
    formatCurrency: (amount: number | string | undefined) =>
      format(amount, locale.value, currency.value),
  };
}
