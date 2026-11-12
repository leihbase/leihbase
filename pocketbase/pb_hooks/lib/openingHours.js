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
   * Returns today at midnight UTC
   * @returns {Date}
   */
  function startOfTodayUTC() {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  /**
   * Returns the opening hours of a given date
   * @param {OpeningHours} openingHours
   * @param {Date} date
   */
  function getOpeningHoursDay(openingHours, date) {
    return openingHours.days[Days[date.getUTCDay()]];
  }

  /**
   * Returns the parsed opening hours of a location record, or null when the
   * location has no usable opening hours (empty, invalid JSON, or no open days)
   * @param {core.Record} location
   * @returns {OpeningHours | null}
   */
  function parseOpeningHours(location) {
    const raw = location.getString("opening_hours");
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        typeof parsed.days !== "object" ||
        Object.keys(parsed.days).length === 0
      ) {
        return null;
      }
      return parsed;
    } catch (err) {
      return null;
    }
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

    const date = startOfTodayUTC();

    // Check up to `limit` days ahead to find the next open day
    let skipped = 0;
    for (let i = 0; i < limit; i++) {
      const dayName = Days[date.getUTCDay()];
      const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

      if (openDays.has(dayName) && !exceptDates.has(dateStr)) {
        if (skipped < skip) {
          skipped++;
        } else {
          return new Date(date);
        }
      }

      date.setUTCDate(date.getUTCDate() + 1);
    }

    return null; // No open day found within limit
  }

  /**
   * Returns the date range used to determine if a product is currently
   * available: from the next open day until the open day after that.
   * When the location has no opening hours defined, it is assumed to be open
   * every day, so the range is today until tomorrow.
   * Returns null when no open days are found within the lookup limit.
   * @param {core.Record} location
   * @returns {[Date, Date] | null}
   */
  function getAvailabilityWindow(location) {
    const openingHours = parseOpeningHours(location);

    if (!openingHours) {
      const today = startOfTodayUTC();
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(today.getUTCDate() + 1);
      return [today, tomorrow];
    }

    const start = getNextOpenDate(openingHours, 0);
    const end = getNextOpenDate(openingHours, 1);
    return start && end ? [start, end] : null;
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
    parseOpeningHours,
    getAvailabilityWindow,
    validateOpeningHours,
    assertValidOpeningHours,
  };
})();
