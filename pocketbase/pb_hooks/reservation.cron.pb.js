/// <reference path="../pb_data/types.d.ts" />

// */1 * * * * - every whole minute
// 0 12 * * * - every day at 12:00
cronAdd("reservation-reminder", "0 12 * * *", () => {
  /** @type {typeof import('./lib/location')} */
  const { sendReminders } = require(`${__hooks}/lib/location`);
  console.log(`[cron/reservation-reminder] start`);

  // Get active locations
  const locations = $app.findRecordsByFilter(
    "location",
    "active = true",
    "",
    -1,
    0
  );
  console.log(
    `[cron/reservation-reminder] found ${locations.length} locations`
  );

  locations.forEach((location) => {
    if (location) {
      sendReminders(location, "start");
    }
  });

  locations.forEach((location) => {
    if (location) {
      sendReminders(location, "end");
    }
  });
});
