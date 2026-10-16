import { DateTime } from "luxon";
import { ReservationStatus, type Reservation } from "../models/reservation";

const startOfToday = DateTime.now().startOf("day");
const endOfToday = DateTime.now().startOf("day");

export function isToday(reservation: {
  start: string | Date;
  end: string | Date;
}): boolean {
  return (
    DateTime.fromJSDate(new Date(reservation.start)).startOf("day") <=
      startOfToday &&
    DateTime.fromJSDate(new Date(reservation.end)).startOf("day") >= endOfToday
  );
}

export function getReservationStatus(reservation: Reservation) {
  if (reservation.cancelled) return ReservationStatus.Cancelled;
  if (reservation.ended) return ReservationStatus.Ended;
  if (reservation.started) {
    if (new Date(reservation.end) < startOfToday.toJSDate()) {
      return ReservationStatus.Overdue;
    }
    return ReservationStatus.Started;
  }
  return ReservationStatus.New;
}
