/**
 * @param {Date} date
 * @param {number} n
 * @returns {Date}
 */
function addDays(date, n) {
  return new Date(date.getTime() + n * 24 * 60 * 60 * 1000);
}

/**
 * @param {Date} date
 * @returns {Date}
 */
function startOfDate(date) {
  return new Date(date.setUTCHours(0, 0, 0, 0));
}

/**
 * @param {Date} date
 * @returns {Date}
 */
function endOfDate(date) {
  return new Date(date.setUTCHours(23, 59, 59, 999));
}

/**
 * @param {Date} date
 * @returns {string}
 */
function formatPocketbaseDate(date) {
  return new Date(date).toISOString().replace('T', ' ');
}

module.exports = {
  addDays,
  startOfDate,
  endOfDate,
  formatPocketbaseDate,
};
