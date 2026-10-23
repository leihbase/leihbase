/// <reference path="../pb_data/types.d.ts" />

onRecordEnrich(({ record, requestInfo, next }) => {
  if (!record) {
    return next();
  }

  const isLocationUser = (
    requestInfo?.auth?.get("manager_locations") || []
  ).includes(record.get("location"));
  const isAdmin = requestInfo?.auth?.get("role") === "admin";

  // Don't show admin notes and owning user of product by default
  record.hide("notes");
  record.hide("user");

  // Do show notes and user when location manager or admin
  if (isLocationUser || isAdmin || requestInfo?.hasSuperuserAuth()) {
    record.unhide("notes");
    record.unhide("user");
  }

  // When passing the 'computeAvailability' query parameter:
  // Populate product data with `computeIsAvailable` showing if the product is
  // currently available for borrowing.
  if (Boolean(requestInfo?.query.computeAvailability)) {
    /** @type {typeof import('./lib/openingHours')} */
    const { getNextOpenDate } = require(`${__hooks}/lib/openingHours`);
    /** @type {typeof import('./lib/product')} */
    const { hasActiveReservation, getActiveReservationsForDateRange } = require(
      `${__hooks}/lib/product`
    );

    record.withCustomData(true);
    $app.expandRecord(record, ["location"], null);
    const location = record.expandedOne("location");

    if (location.get("reservation_system") === "multiple") {
      const openingHours = JSON.parse(location.get("opening_hours"));
      const nextOpenDate = getNextOpenDate(openingHours, 0);
      const nextNextOpenDate = getNextOpenDate(openingHours, 1);
      if (nextOpenDate && nextNextOpenDate) {
        const reservations = getActiveReservationsForDateRange(
          record.id,
          nextOpenDate,
          nextNextOpenDate
        );
        record.set(
          "computedIsAvailable",
          reservations && reservations.length === 0
        );
      }
    } else {
      // For single system, include unreturned reservations as active
      record.set(
        "computedIsAvailable",
        !hasActiveReservation(record.id, null, true)
      );
    }
  }

  next();
}, "products");
