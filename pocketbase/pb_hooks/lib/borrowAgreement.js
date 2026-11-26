/// <reference path="../../pb_data/types.d.ts" />

/**
 * Returns the id of the instance-wide borrow agreement, set on the leihbase
 * record, or an empty string
 * @returns {string}
 */
function getInstanceBorrowAgreement() {
  try {
    const leihbase = $app.findAllRecords("leihbase")[0];
    return leihbase?.getString("borrow_agreement") || "";
  } catch (e) {
    return "";
  }
}

/**
 * Returns the id of the borrow agreement that applies to the location: its own,
 * or else the instance-wide one. An empty string when there is none.
 * @param {core.Record} location
 * @returns {string}
 */
function getEffectiveBorrowAgreement(location) {
  return location.getString("borrow_agreement") || getInstanceBorrowAgreement();
}

/**
 * If the borrow agreement is the current one: of its location, or for a borrow
 * agreement without a location, of the instance
 * @param {core.Record} borrowAgreement
 * @returns {boolean}
 */
function isCurrentBorrowAgreement(borrowAgreement) {
  const locationId = borrowAgreement.getString("location");
  if (!locationId) {
    return getInstanceBorrowAgreement() === borrowAgreement.id;
  }
  const location = $app.findRecordById("location", locationId);
  return location.getString("borrow_agreement") === borrowAgreement.id;
}

module.exports = {
  getInstanceBorrowAgreement,
  getEffectiveBorrowAgreement,
  isCurrentBorrowAgreement,
};
