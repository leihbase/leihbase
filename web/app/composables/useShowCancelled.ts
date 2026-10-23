/**
 * Shared "show cancelled" state for the admin reservation tabs, so the switch
 * keeps its value when switching between tabs
 */
export function useShowCancelled() {
  return useState<boolean>("admin-show-cancelled", () => false);
}
