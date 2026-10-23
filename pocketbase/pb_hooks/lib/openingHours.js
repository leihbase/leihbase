module.exports = (function () {
  const Days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // HH:mm from 00:00 to 23:59, e.g. "09:30" (not "9:30" or "24:00")
  const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

  // YYYY-MM-DD format only, e.g. "2026-12-25" (also matches "2026-13-45")
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

  /**
   * Returns the opening hours of a given date
   * @param {OpeningHours} openingHours
   * @param {Date} date
   */
  function getOpeningHoursDay(openingHours, date) {
    return openingHours.days[Days[date.getDay()]];
  }

  /**
   * Returns the date of the next open day
   * @param {OpeningHours} openingHours
   * @param {number} [skip=0] - Number of open days to skip
   * @param {number} [limit=31] - Number of days to check
   * @returns {Date | null}
   */
  function getNextOpenDate(openingHours, skip = 0, limit = 31) {
    const { days, except } = openingHours;
    const exceptDates = new Set(except?.dates || []);
    const openDays = new Set(Object.keys(days));

    const date = new Date();
    date.setHours(0, 0, 0, 0);

    // Check up to 365 days ahead to find the next open day
    let skipped = 0;
    for (let i = 0; i < limit; i++) {
      const dayName = Days[date.getDay()];
      const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

      if (openDays.has(dayName) && !exceptDates.has(dateStr)) {
        if (skipped < skip) {
          skipped++;
        } else {
          return new Date(date);
        }
      }

      date.setDate(date.getDate() + 1);
    }

    return null; // No open day found within limit
  }

  /**
   * Validates the structure of opening hours, returns an error message when
   * invalid, or null when valid. Empty opening hours are valid.
   * @param {any} openingHours
   * @returns {string | null}
   */
  function validateOpeningHours(openingHours) {
    if (openingHours === null || openingHours === undefined) {
      return null;
    }
    if (typeof openingHours !== "object" || Array.isArray(openingHours)) {
      return "Opening hours should be an object.";
    }

    const { days, except } = openingHours;
    if (typeof days !== "object" || days === null || Array.isArray(days)) {
      return "Opening hours should contain a 'days' object.";
    }

    for (const day of Object.keys(days)) {
      if (Days.indexOf(day) === -1) {
        return `Unknown day '${day}'.`;
      }
      const ranges = days[day];
      if (!Array.isArray(ranges) || ranges.length === 0) {
        return `Day '${day}' should contain at least one time range.`;
      }
      const sorted = [...ranges].sort((a, b) =>
        String(a?.from).localeCompare(String(b?.from))
      );
      for (let i = 0; i < sorted.length; i++) {
        const { from, to } = sorted[i] || {};
        if (!TIME_REGEX.test(from) || !TIME_REGEX.test(to)) {
          return `Invalid time range on '${day}', expected HH:mm.`;
        }
        if (from >= to) {
          return `Time range on '${day}' should end after it starts.`;
        }
        if (i > 0 && from < sorted[i - 1].to) {
          return `Time ranges on '${day}' should not overlap.`;
        }
      }
    }

    if (except !== undefined && except !== null) {
      if (typeof except !== "object" || !Array.isArray(except.dates)) {
        return "Opening hours 'except' should contain a 'dates' array.";
      }
      for (const date of except.dates) {
        if (!DATE_REGEX.test(date) || isNaN(new Date(date).getTime())) {
          return `Invalid date '${date}', expected YYYY-MM-DD.`;
        }
      }
    }

    return null;
  }

  /**
   * Throws a BadRequestError when the opening hours of a location record are
   * invalid
   * @param {core.Record} record
   */
  function assertValidOpeningHours(record) {
    const raw = record.getString("opening_hours");
    let error;
    try {
      error = validateOpeningHours(raw ? JSON.parse(raw) : null);
    } catch (err) {
      error = "Opening hours should be valid JSON.";
    }
    if (error) {
      throw new BadRequestError("Invalid_opening_hours.", {
        opening_hours: new ValidationError("invalid_opening_hours", error),
      });
    }
  }

  return {
    getOpeningHoursDay,
    getNextOpenDate,
    validateOpeningHours,
    assertValidOpeningHours,
  };
})();
