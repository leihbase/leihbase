/// <reference path="../../pb_data/types.d.ts" />
/// <reference path="../types.d.ts" />

/**
 * @param {core.Record} locationRecord
 * @returns {string[]}
 */
function getNotificationEmailAddresses(locationRecord) {
  if (!locationRecord.getString("notifications")) {
    return [];
  }
  /** @type {string[]} */
  const notifications = JSON.parse(locationRecord.getString("notifications"));
  if (
    !notifications ||
    !Array.isArray(notifications) ||
    notifications.length < 1
  ) {
    return [];
  }
  return notifications;
}

/**
 *
 * @param {core.Record} location
 * @param {'start' | 'end'} type
 */
function sendReminders(location, type) {
  /** @type {typeof import('./date')} */
  const { addDays, startOfDate, endOfDate, formatPocketbaseDate } = require(`${__hooks}/lib/date`);
  /** @type {typeof import('./reservation')} */
  const { saveSentEmail } = require(`${__hooks}/lib/reservation`);
  /** @type {typeof import('./email')} */
  const { sendLocationTemplateEmail, formatDate } = require(`${__hooks}/lib/email`);
  /** @type {typeof import('./openingHours')} */
  const { getOpeningHoursDay } = require(`${__hooks}/lib/openingHours`);

  const locale = $os.getenv("CONFIG_LOCALE") || "en";

  // Get reservations starting or ending tomorrow
  const startOfToday = startOfDate(new Date());
  const startOfTomorrow = startOfDate(addDays(new Date(), 1));
  const endOfTomorrow = endOfDate(addDays(new Date(), 1));
  const reservations = $app.findRecordsByFilter(
    "reservations",
    type === "start"
      ? `location = {:location} && cancelled != true && user != "" && created < {:startOfToday} && sent_emails !~ "start_reminder" && start >= {:startOfTomorrow} && start <= {:endOfTomorrow}`
      : `location = {:location} && cancelled != true && user != "" && started = true && ended = false && sent_emails !~ "end_reminder" && end >= {:startOfTomorrow} && end <= {:endOfTomorrow}`,
    '',
    100,
    0,
    {
      type,
      location: location.get("id"),
      startOfToday: formatPocketbaseDate(startOfToday),
      startOfTomorrow: formatPocketbaseDate(startOfTomorrow),
      endOfTomorrow: formatPocketbaseDate(endOfTomorrow),
    }
  );

  console.log(
    `[location/reservation-reminders] found ${
      reservations.length
    } reservations to remind of ${type}ing tomorrow for location '${location.get(
      "name"
    )}'`
  );

  // Send start/end reminder for each found reservation
  for (const reservation of reservations) {
    if (!reservation) {
      continue;
    }
    console.log(
      `[location/reservation-reminders] Send ${type} reminder for reservation`,
      reservation.get("id")
    );

    $app.expandRecord(reservation, ["user", "product"]);
    const user = reservation.expandedOne("user");
    const product = reservation.expandedOne("product");

    const start = new Date(reservation.get("start").string().split(" ")[0]);
    const end = new Date(reservation.get("end").string().split(" ")[0]);
    const appUrl = $app.settings().meta.appURL;

    const startOpenHours = getOpeningHoursDay(
      JSON.parse(location.get("opening_hours")),
      start
    );
    const endOpenHours = getOpeningHoursDay(
      JSON.parse(location.get("opening_hours")),
      end
    );

    if (type === "start") {
      sendLocationTemplateEmail(
        location,
        "reservation_start_reminder",
        user.getString("email"),
        locale,
        {
          APP_URL: appUrl,
          USER_NAME: user.get("name"),
          LOCATION_NAME: location.get("name"),
          PRODUCT_NAME: product.get("name"),
          RESERVATION_START: formatDate(start, locale),
          START_HOUR: startOpenHours && startOpenHours.length > 0 ? startOpenHours[0].from : null,
          END_HOUR: startOpenHours && startOpenHours.length > 0 ? startOpenHours[0].to : null,
        }
      );
    } else {
      sendLocationTemplateEmail(
        location,
        "reservation_end_reminder",
        user.getString("email"),
        locale,
        {
          APP_URL: appUrl,
          USER_NAME: user.get("name"),
          LOCATION_NAME: location.get("name"),
          PRODUCT_NAME: product.get("name"),
          RESERVATION_END: formatDate(end, locale),
          START_HOUR: endOpenHours && endOpenHours.length > 0 ? endOpenHours[0].from : null,
          END_HOUR: endOpenHours && endOpenHours.length > 0 ? endOpenHours[0].to : null,
        }
      );
    }

    // Save that reminder has been send
    saveSentEmail(reservation, `${type}_reminder`);
  }
}

module.exports = {
  getNotificationEmailAddresses,
  sendReminders,
};
