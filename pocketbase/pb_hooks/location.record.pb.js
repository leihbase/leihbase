/// <reference path="../pb_data/types.d.ts" />

onRecordUpdateRequest((e) => {
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

  e.next();
}, "location");
