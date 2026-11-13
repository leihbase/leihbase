/// <reference path="../pb_data/types.d.ts" />

// Currency of deposits, as an ISO 4217 code (e.g. "EUR", "GBP"). Empty means
// "EUR", the currency used before this setting existed.
migrate(
  (app) => {
    const leihbase = app.findCollectionByNameOrId("gu30h2m0sajzw6p");
    leihbase.fields.add(
      new Field({
        id: "text1794200001",
        name: "currency",
        type: "text",
        help: "Currency of deposits, as an uppercase ISO 4217 code such as EUR, GBP or CHF. Empty means EUR.",
        max: 3,
        pattern: "^[A-Z]{3}$",
      })
    );
    app.save(leihbase);
  },
  (app) => {
    const leihbase = app.findCollectionByNameOrId("gu30h2m0sajzw6p");
    leihbase.fields.removeById("text1794200001");
    app.save(leihbase);
  }
);
