type TemplateName =
  | "reservation_confirmation"
  | "reservation_confirmation_location"
  | "reservation_start_reminder"
  | "reservation_end_reminder"
  | "cancellation_confirmation"
  | "reservation_cancellation_location";

/**
 * Opening hours of a location, see `OpeningHours` in web/lib/openingHours.ts
 */
type OpeningHours = {
  days: { [day: string]: { from: string; to: string }[] };
  except?: { dates: string[] };
};

declare namespace core {
  interface App {
    /**
     * The generated types mark `optFetchFunc` as required, but it's optional:
     * without it, a default function is used that returns all relation records.
     */
    expandRecord(
      record: Record,
      expands: Array<string>,
      optFetchFunc?: ExpandFetchFunc
    ): _TygojaDict;
  }
}
