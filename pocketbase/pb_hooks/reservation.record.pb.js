/// <reference path="../pb_data/types.d.ts" />
/// <reference path="./types.d.ts" />

onRecordCreateRequest((e) => {
  /** @type {typeof import('./lib/reservation')} */
  const { validateStartEnd, hasOverlappingReservations } = require(`${__hooks}/lib/reservation`);
  /** @type {typeof import('./lib/user')} */
  const { hasActiveReservationForProduct } = require(`${__hooks}/lib/user`);
  /** @type {typeof import('./lib/product')} */
  const { hasActiveReservation } = require(`${__hooks}/lib/product`);

  const { record } = e;
  if (!record) {
    throw new BadRequestError("Record_not_defined.");
  }

  const start = new Date(record.get("start").string().split(" ")[0]);
  const end = new Date(record.get("end").string().split(" ")[0]);
  const isSuperuser = e.hasSuperuserAuth();
  const requestUser = e.auth;
  const requireUser = $os.getenv("CONFIG_RESERVATION_REQUIRE_USER") !== "false";

  // Store location of product in reservation
  $app.expandRecord(record, ["product"], null);
  const product = record.expandedOne("product");
  $app.expandRecord(product, ["location"], null);
  const location = product.expandedOne("location");
  const isAdmin = requestUser && requestUser.get("role") === "admin"
  const isLocationUser =
    requestUser &&
    requestUser.get("manager_locations") &&
    requestUser.get("manager_locations").includes(location.id);
  record.set("location", product.get("location"));

  // Require e-mail verification
  if (!requestUser?.verified()) {
    throw new BadRequestError("User_not_verified.");
  }

  // If reservation system is disabled, prevent reservations from regular users
  if (
    location.get("reservation_system") === "disabled" &&
    !isSuperuser &&
    !isAdmin &&
    !isLocationUser
  ) {
    throw new BadRequestError("Reservation_system_disabled.");
  }

  // If only a single reservation is allowed per product, verify if there is no
  // other active reservation for this product (including unreturned ones)
  if (
    location.get("reservation_system") === "single" &&
    !record.get("cancelled") &&
    hasActiveReservation(record.getString("product"), record, true) &&
    !isSuperuser &&
    !isAdmin &&
    !isLocationUser
  ) {
    throw new BadRequestError("Product_has_open_reservation.");
  }

  // Make sure there is not already an open reservation with the same user
  // and product
  if (
    hasActiveReservationForProduct(
      record.get("user"),
      record.get("product"),
      record
    ) &&
    !isSuperuser &&
    !isAdmin &&
    !isLocationUser
  ) {
    throw new BadRequestError("User_has_open_reservation.");
  }

  // Check reservation_start_limit
  const reservationStartLimit = location.getInt("reservation_start_limit");
  if (reservationStartLimit > 0) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const maxStartDate = new Date(today);
    maxStartDate.setDate(maxStartDate.getDate() + reservationStartLimit);

    if (start > maxStartDate && !isSuperuser && !isAdmin && !isLocationUser) {
      throw new BadRequestError("Reservation_start_too_far_in_future.");
    }
  }

  // Validate reservation start/end
  validateStartEnd(
    start,
    end,
    location.getInt("max_reservation_days") || 14,
    isLocationUser || isAdmin || isSuperuser,
  );

  // Make sure the reservation is linked to a user
  if (requireUser && !record.get("user") && !isSuperuser && !isLocationUser) {
    throw new BadRequestError("User_not_defined.");
  }

  // If send_confirmation isn't set yet, make sure to set it to false for admin
  // or location users, so that no confirmations are send when creating
  // reservations from the admin section or pocketbase interface
  if (!record.get("send_confirmation") && (isSuperuser || isLocationUser)) {
    record.set("send_confirmation", false);
  }

  // Set default note content
  if (!record.get("note") && location.get("note_default")) {
    record.set("note", location.get("note_default"));
  }

  // Make sure there is no overlapping reservation for the same product in the
  // same timespan
  const locationConfig = location.getString("config")
    ? JSON.parse(location.getString("config")) || {}
    : {};
  const allowSameDayReservations =
    isLocationUser || !!locationConfig["allow_same_day_reservations"];
  if (hasOverlappingReservations(record, allowSameDayReservations)) {
    throw new BadRequestError("Overlapping_reservation.");
  }

  // Strip html out of message field
  // https://stackoverflow.com/a/51208595
  record.set(
    "message",
    record.get("message").replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "")
  );

  e.next();
}, "reservations");

onRecordUpdateRequest((e) => {
  /** @type {typeof import('./lib/reservation')} */
  const { validateStartEnd, hasOverlappingReservations } = require(`${__hooks}/lib/reservation`);
  /** @type {typeof import('./lib/user')} */
  const { hasActiveReservationForProduct } = require(`${__hooks}/lib/user`);

  const { record } = e;
  if (!record) {
    throw new BadRequestError("Record_not_defined.");
  }

  const requestUser = e.auth;
  const isSuperuser = e.hasSuperuserAuth();
  const start = new Date(record.get("start").string().split(" ")[0]);
  const end = new Date(record.get("end").string().split(" ")[0]);
  $app.expandRecord(record, ["location"], null);
  const location = record.expandedOne("location");
  const isAdmin = requestUser && requestUser.get("role") === "admin";
  const isLocationUser =
    requestUser &&
    requestUser.get("manager_locations") &&
    requestUser.get("manager_locations").includes(location.id);

  // Make sure there is not already an open reservation with the same user
  // and product
  if (
    hasActiveReservationForProduct(
      record.get("user"),
      record.get("product"),
      record
    ) &&
    !isSuperuser &&
    !isAdmin &&
    !isLocationUser
  ) {
    throw new BadRequestError("User_has_open_reservation.");
  }

  // Check reservation_start_limit
  const reservationStartLimit = location.getInt("reservation_start_limit");
  if (reservationStartLimit > 0) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const maxStartDate = new Date(today);
    maxStartDate.setDate(maxStartDate.getDate() + reservationStartLimit);

    if (start > maxStartDate && !isSuperuser && !isAdmin && !isLocationUser) {
      throw new BadRequestError("Reservation_start_too_far_in_future.");
    }
  }

  // Validate reservation start/end
  validateStartEnd(
    start,
    end,
    location.getInt("max_reservation_days") || 14,
    isLocationUser || isAdmin || isSuperuser
  );

  // Make sure there is no overlapping reservation for the same product in the
  // same timespan
  const locationConfig = location.getString("config")
    ? JSON.parse(location.getString("config")) || {}
    : {};
  const allowSameDayReservations =
    isSuperuser || isLocationUser || !!locationConfig.allow_same_day_reservations;
  if (hasOverlappingReservations(record, allowSameDayReservations)) {
    throw new BadRequestError("Overlapping_reservation.");
  }

  e.next();
}, "reservations");

onRecordCreateRequest((e) => {
  e.next();

  const locale = $os.getenv("CONFIG_LOCALE") || "en";

  /** @type {typeof import('./lib/reservation')} */
  const { saveSentEmail } = require(`${__hooks}/lib/reservation`);
  /** @type {typeof import('./lib/email')} */
  const { sendLocationTemplateEmail, formatCurrency, formatDate } = require(`${__hooks}/lib/email`);
  /** @type {typeof import('./lib/location')} */
  const { getNotificationEmailAddresses } = require(`${__hooks}/lib/location`);

  const appUrl = $app.settings().meta.appURL;

  const { record } = e;
  if (!record) {
    throw new BadRequestError("Record_not_defined.");
  }

  const requestUser = e.auth;
  $app.expandRecord(record, ["location"], null);
  const location = record.expandedOne("location");

  if (!record.get("send_confirmation")) {
    // Prevent sending notifications if the reservation has been marked to not
    // send those
    return;
  }

  // TODO: only send notification when the user creating the reservation, is
  // also the user involved in the reservation
  // https://pocketbase.io/docs/js-routing/#retrieving-the-current-auth-state

  $app.expandRecord(record, ["product", "user"], null);

  const product = record.expandedOne("product");
  const productName = product.get("name");

  const user = record.expandedOne("user");

  if (!user) {
    // Don't send a confirmation if no user is defined
    return;
  }

  const userName = user.get("name");

  const start = new Date(record.get("start").string().split(" ")[0]);
  const end = new Date(record.get("end").string().split(" ")[0]);

  // Notify location
  const notificationEmails = getNotificationEmailAddresses(location);
  if (notificationEmails.length > 0) {
    sendLocationTemplateEmail(
      location,
      "reservation_confirmation_location",
      notificationEmails,
      locale,
      {
        APP_URL: appUrl,
        USER_NAME: userName,
        USER_EMAIL: user.get("email"),
        LOCATION_NAME: location.get('name'),
        PRODUCT_URL: `${appUrl}/link/product/${product.get("id")}`,
        PRODUCT_NAME: productName,
        RESERVATION_START: formatDate(start, locale),
        RESERVATION_END: formatDate(end, locale),
        MESSAGE: record.get("message"),
      }
    );
  }

  // Notify user, if the user is the one making the reservation
  if (user && requestUser && requestUser.get("id") === user.get("id")) {
    const productUrl = `${appUrl}/link/product/${product.get("id")}`;
    sendLocationTemplateEmail(
      location,
      "reservation_confirmation",
      user.get("email"),
      locale,
      {
        APP_URL: appUrl,
        USER_NAME: userName,
        LOCATION_NAME: location.get('name'),
        PRODUCT_LINK: `<a href="${productUrl}">${productName}</a>`,
        PRODUCT_URL: productUrl,
        PRODUCT_NAME: productName,
        RESERVATION_START: formatDate(start, locale),
        RESERVATION_END: formatDate(end, locale),
        PRODUCT_DEPOSIT: product.get("deposit") ? formatCurrency(product.get("deposit"), locale) : null,
      }
    );
    // Store that email has been sent
    saveSentEmail(record, "confirmation");
  }
}, "reservations");

onRecordUpdateRequest((e) => {
  e.next();

  /** @type {typeof import('./lib/reservation')} */
  const { removeSentEmail } = require(`${__hooks}/lib/reservation`);
  /** @type {typeof import('./lib/email')} */
  const { sendLocationTemplateEmail, formatDate } = require(`${__hooks}/lib/email`);
  /** @type {typeof import('./lib/location')} */
  const { getNotificationEmailAddresses } = require(`${__hooks}/lib/location`);

  const locale = $os.getenv("CONFIG_LOCALE") || "en";

  let { record } = e;
  if (!record) {
    throw new BadRequestError("Record_not_defined.");
  }

  const requestUser = e.auth;
  const originalRecord = record.original();

  // Reset end_reminder notification if the end date has been moved back
  const end = new Date(record.get("end").string().split(" ")[0]);
  const originalEnd = new Date(
    originalRecord.get("end").string().split(" ")[0]
  );
  if (end > originalEnd) {
    record = removeSentEmail(record, "end_reminder");
  }

  // Reservation got cancelled, send confirmations
  if (!originalRecord.getBool("cancelled") && record.getBool("cancelled")) {
    $app.expandRecord(record, ["product", "location", "user"], null);
    const product = record.expandedOne("product");
    const location = record.expandedOne("location");
    const productName = product.get("name");
    const user = record.expandedOne("user");
    const start = new Date(record.get("start").string().split(" ")[0]);
    const end = new Date(record.get("end").string().split(" ")[0]);
    const appUrl = $app.settings().meta.appURL;

    // Notify the user if they do the cancellation themselves
    if (user && requestUser && requestUser.get("id") === user.get("id")) {
      sendLocationTemplateEmail(
        location,
        "cancellation_confirmation",
        user.get("email"),
        locale,
        {
          APP_URL: appUrl,
          USER_NAME: user.get("name"),
          LOCATION_NAME: location.get('name'),
          PRODUCT_URL: `${appUrl}/link/product/${product.get("id")}`,
          PRODUCT_NAME: productName,
        }
      );
    }

    // Notify the location of the cancellation
    const notificationEmails = getNotificationEmailAddresses(location);
    if (notificationEmails.length > 0) {
      sendLocationTemplateEmail(
        location,
        "reservation_cancellation_location",
        notificationEmails,
        locale,
        {
          APP_URL: appUrl,
          USER_NAME: user.get("name"),
          USER_EMAIL: user.get("email"),
          LOCATION_NAME: location.get('name'),
          PRODUCT_URL: `${appUrl}/link/product/${product.get("id")}`,
          PRODUCT_NAME: productName,
          RESERVATION_START: formatDate(start, locale),
          RESERVATION_END: formatDate(end, locale),
        }
      );
    }
  }
}, "reservations");
