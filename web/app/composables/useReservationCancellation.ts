import type { Location } from "@@/models/location";
import type { Reservation } from "@@/models/reservation";

export enum ReservationCancellationStatus {
  Default = "default",
  Loading = "loading",
  Success = "success",
  Error = "error",
}

export function useReservationCancellation(
  reservation: () => Reservation | undefined,
  location: () => Location | undefined,
  onCancel: () => void
) {
  const { pb } = usePocketbase();
  const { t } = useI18n({ useScope: "global" });

  const message = ref();
  const status = ref<ReservationCancellationStatus>(
    ReservationCancellationStatus.Default
  );

  watch(reservation, () => {
    status.value = ReservationCancellationStatus.Default;
  });

  async function handleReservationCancel() {
    const _reservation = reservation();
    const _location = location();
    if (!_reservation || !_location) {
      console.error(
        "Trying to handleReservationCancel without reservation or location"
      );
      return;
    }
    status.value = ReservationCancellationStatus.Loading;
    try {
      await pb.collection("reservations").update<Reservation>(_reservation.id, {
        cancelled: true,
      });
      status.value = ReservationCancellationStatus.Success;
      message.value = t("cancellation_success_message");
      onCancel();
    } catch (e) {
      status.value = ReservationCancellationStatus.Error;
      message.value = t("cancellation_unknown_error_message", [
        _location.email,
      ]);
    }
  }
  return {
    message,
    status,
    cancel: handleReservationCancel,
  };
}
