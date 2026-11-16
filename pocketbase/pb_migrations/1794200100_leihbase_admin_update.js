/// <reference path="../pb_data/types.d.ts" />

// Allow admins to update the leihbase record (instance settings, such as the
// currency), from the instance settings page in the admin section
migrate(
  (app) => {
    const leihbase = app.findCollectionByNameOrId("gu30h2m0sajzw6p");
    leihbase.updateRule = '@request.auth.role = "admin"';
    app.save(leihbase);
  },
  (app) => {
    const leihbase = app.findCollectionByNameOrId("gu30h2m0sajzw6p");
    leihbase.updateRule = null;
    app.save(leihbase);
  }
);
