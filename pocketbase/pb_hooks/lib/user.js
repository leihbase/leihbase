/**
 * Checks if a user has another overlapping reservation for the given product.
 * @param {core.Record} user
 * @param {core.Record} product
 * @param {core.Record} reservation
 * @returns {boolean}
 */
function hasActiveReservationForProduct(user, product, reservation) {
  const { endOfDate } = require(`${__hooks}/lib/date`);
  // A cancelled reservation is allowed to have a second reservation for the same product
  if (reservation.get("cancelled")) {
    return false;
  }
  // A reservation without a user can't already have an open reservation
  if (!reservation.get("user")) {
    return false;
  }
  const records = $app.findRecordsByFilter(
    "reservations",
    reservation.get("id")
      ? `id != {:id} && user = {:user} && product = {:product} && end > {:endOfToday} && cancelled != true`
      : `user = {:user} && product = {:product} && end > {:endOfToday} && cancelled != true`,
    "",
    1,
    0,
    {
      id: reservation.get("id"),
      user,
      product,
      endOfToday: endOfDate(new Date()),
    }
  );
  return records.length > 0;
}

/**
 * Checks if a user has accepted the given borrow agreement.
 * @param {core.Record} user
 * @param {string} borrowAgreement
 * @returns {boolean}
 */
function hasAcceptedBorrowAgreement(user, borrowAgreement) {
  return (
    user
      .getStringSlice("accepted_borrow_agreements")
      .indexOf(borrowAgreement) !== -1
  );
}

module.exports = {
  hasActiveReservationForProduct,
  hasAcceptedBorrowAgreement,
};
