import type { Location } from "@@/models/location";
import type { Reservation } from "@@/models/reservation";
import { ClientResponseError } from "pocketbase";

export type CreateReservationResult =
  | { status: "created"; reservation: Reservation }
  // The borrow agreement of the location has to be accepted. The server only
  // returns this after all other validation, so the reservation is otherwise
  // valid.
  | { status: "borrow_agreement_not_accepted" }
  | { status: "error"; message: string };

/**
 * Creates reservations as the user, translating errors of the server into
 * messages for the user
 */
export function useCreateReservation() {
  const { pb } = usePocketbase();
  const { t } = useI18n({ useScope: "global" });

  /**
   * Returns the message for an error of the server, if known
   */
  function getErrorMessage(error: string, location: Location) {
    const messages: Record<string, () => string> = {
      "User_not_verified.": () => t("reservation_errors.user_not_verified"),
      "Product_has_open_reservation.": () =>
        t("reservation_errors.product_has_open_reservation", {
          email: location.email,
        }),
      "User_has_open_reservation.": () =>
        t("reservation_errors.user_has_open_reservation", {
          email: location.email,
        }),
      "Date_range_too_long.": () =>
        t("reservation_errors.date_range_too_long", {
          days: location.max_reservation_days || 14,
          email: location.email,
        }),
      "Overlapping_reservation.": () =>
        t("reservation_errors.overlapping_reservation"),
      "Start_before_today.": () => t("reservation_errors.start_before_today"),
      "End_before_today.": () => t("reservation_errors.end_before_today"),
      "Start_and_end_equal.": () => t("reservation_errors.start_and_end_equal"),
      "End_before_start.": () => t("reservation_errors.end_before_start"),
      "Reservation_system_disabled.": () =>
        t("reservation_errors.reservation_system_disabled"),
      "Reservation_start_too_far_in_future.": () =>
        t("reservation_errors.reservation_start_too_far_in_future", {
          days: location.reservation_start_limit,
          email: location.email,
        }),
    };
    return messages[error]?.();
  }

  async function createReservation(
    location: Location,
    data: {
      user: string;
      product: string;
      start?: Date;
      end?: Date;
      message?: string;
      // Id of the borrow agreement, to accept it along with the reservation
      borrow_agreement?: string;
    }
  ): Promise<CreateReservationResult> {
    try {
      const reservation = await pb
        .collection("reservations")
        .create<Reservation>({ ...data, send_confirmation: true });
      return { status: "created", reservation };
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 400) {
        if (e.message === "Borrow_agreement_not_accepted.") {
          return { status: "borrow_agreement_not_accepted" };
        }
        const message = getErrorMessage(e.message, location);
        if (message) {
          return { status: "error", message };
        }
      }
      return { status: "error", message: t("reservation_errors.general") };
    }
  }

  return { createReservation };
}
