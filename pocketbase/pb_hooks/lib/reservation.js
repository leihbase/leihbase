/**
 * Validates if the reservation start is before the end, if the start is after
 * today, and if `maxReservationDays` is respected.
 * @param {Date} start
 * @param {Date} end
 * @param {Number} maxReservationDays
 * @param {Boolean} isManager
 */
function validateStartEnd(start, end, maxReservationDays, isManager) {
  var startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  // Start and end shouldn't be the same
  if (start.getTime() === end.getTime()) {
    throw new BadRequestError("Start_and_end_equal.");
  }
  // End should be after start of reservation
  if (end.getTime() < start.getTime()) {
    throw new BadRequestError("End_before_start.");
  }

  // Don't allow reserving where start of end is before today
  // Except if the user is an admin or a location user
  if (start < startOfDay && !isManager) {
    throw new BadRequestError("Start_before_today.");
  }
  if (end < startOfDay && !isManager) {
    throw new BadRequestError("End_before_today.");
  }

  // Consider maximum reservation length configured in location
  const maxDays = 1000 * 60 * 60 * 24 * maxReservationDays;
  if (end.getTime() - start.getTime() > maxDays && !isManager) {
    throw new BadRequestError("Date_range_too_long.");
  }
}

/**
 * Checks if a reservation has other overlapping reservations
 * @param {core.Record} reservation
 * @param {boolean} allowSameDay
 * @returns {boolean}
 */
function hasOverlappingReservations(reservation, allowSameDay) {
  // A cancelled reservation is allowed to have an overlap
  if (reservation.get("cancelled")) {
    return false;
  }
  // When allowing same day reservations the start of one reservation can be on
  // the same day as the end of another reservation
  const startEndComparison = allowSameDay
    ? "start < {:end} && end > {:start}"
    : "start <= {:end} && end >= {:start}";
  const records = $app.findRecordsByFilter(
    "reservations",
    reservation.get("id")
      ? `id != {:id} && product = {:product} && cancelled != true && ${startEndComparison}`
      : `product = {:product} && cancelled != true && ${startEndComparison}`,
    null,
    1,
    0,
    {
      id: reservation.get("id"),
      product: reservation.get("product"),
      start: reservation.get("start"),
      end: reservation.get("end"),
    }
  );
  return records.length > 0;
}

/**
 * @param {core.Record} reservation
 * @param {'confirmation'|'start_reminder'|'end_reminder'} type
 */
function saveSentEmail(reservation, type) {
  const sent_emails = reservation.getStringSlice("sent_emails");
  sent_emails.push(type);
  reservation.set("sent_emails", sent_emails);
  $app.save(reservation);
}

/**
 * @param {core.Record} reservation
 * @param {'confirmation'|'start_reminder'|'end_reminder'} type
 */
function removeSentEmail(reservation, type) {
  const sent_emails = reservation.getStringSlice("sent_emails");
  sent_emails.push(type);
  reservation.set(
    "sent_emails",
    sent_emails.filter((t) => t !== type)
  );
  $app.save(reservation);
  return reservation;
}

module.exports = {
  validateStartEnd,
  hasOverlappingReservations,
  saveSentEmail,
  removeSentEmail,
};
