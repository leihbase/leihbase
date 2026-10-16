/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  /** @type {typeof import('./lib/openingHours')} */
  const { assertValidOpeningHours } = require(`${__hooks}/lib/openingHours`);

  if (!e.record) {
    throw new BadRequestError("Record_not_defined.");
  }

  assertValidOpeningHours(e.record);

  e.next();
}, "location");

onRecordUpdateRequest((e) => {
  /** @type {typeof import('./lib/openingHours')} */
  const { assertValidOpeningHours } = require(`${__hooks}/lib/openingHours`);

  // Fields managers (non-admins) are allowed to update on their locations
  const MANAGER_EDITABLE_FIELDS = ["opening_hours"];

  const { record } = e;
  if (!record) {
    throw new BadRequestError("Record_not_defined.");
  }

  const body = e.requestInfo().body;
  const isSuperuser = e.hasSuperuserAuth();
  const isAdmin = e.auth && e.auth.get("role") === "admin";

  // Managers are only allowed to update a limited set of fields
  if (!isSuperuser && !isAdmin) {
    const forbiddenFields = Object.keys(body).filter(
      (field) => MANAGER_EDITABLE_FIELDS.indexOf(field) === -1
    );
    if (forbiddenFields.length > 0) {
      throw new ForbiddenError("Field_not_editable.", {
        fields: forbiddenFields,
      });
    }
  }

  // Only validate opening hours when they are being changed, so that admins
  // can still edit other settings of locations with legacy opening hours
  if (body.opening_hours !== undefined) {
    assertValidOpeningHours(record);
  }

  e.next();
}, "location");
