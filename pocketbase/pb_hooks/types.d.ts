type TemplateName =
  | "reservation_confirmation"
  | "reservation_confirmation_location"
  | "reservation_start_reminder"
  | "reservation_end_reminder"
  | "cancellation_confirmation"
  | "reservation_cancellation_location";

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
