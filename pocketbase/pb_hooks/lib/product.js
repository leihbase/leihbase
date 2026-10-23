/**
 * Checks if a product has another active reservation.
 * @param {string} productId
 * @param {core.Record} [excludeReservation]
 * @param {boolean} [includeUnreturned=false] - Also include reservations that were not marked as ended
 * @returns {boolean}
 */
function hasActiveReservation(
  productId,
  excludeReservation,
  includeUnreturned = false
) {
  /** @type {typeof import('./date')} */
  const { endOfDate } = require(`${__hooks}/lib/date`);
  const endedFilter = includeUnreturned
    ? "(end > {:endOfToday} || ended != true)"
    : "end > {:endOfToday}";
  const records = $app.findRecordsByFilter(
    "reservations",
    [
      excludeReservation && excludeReservation.get("id") ? "id != {:id}" : "",
      "product = {:product}",
      endedFilter,
      "cancelled != true",
    ]
      .filter((v) => !!v)
      .join(" && "),
    null,
    1,
    0,
    {
      id: excludeReservation && excludeReservation.get("id"),
      product: productId,
      endOfToday: endOfDate(new Date()),
    }
  );
  return records.length > 0;
}

/**
 * Returns active reservations of a product in the given date range.
 * @param {string} product
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array<(core.Record | undefined)>}
 */
function getActiveReservationsForDateRange(product, startDate, endDate) {
  /** @type {typeof import('./date')} */
  const { startOfDate, endOfDate } = require(`${__hooks}/lib/date`);
  return $app.findRecordsByFilter(
    "reservations",
    "cancelled != true && product = {:product} && start < {:endOfEndDate} && end >= {:startOfStartDate}",
    null,
    1,
    0,
    {
      product,
      startOfStartDate: startOfDate(startDate),
      endOfEndDate: endOfDate(endDate),
    }
  );
}

module.exports = {
  hasActiveReservation,
  getActiveReservationsForDateRange,
};
