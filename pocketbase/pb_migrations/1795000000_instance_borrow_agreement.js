/// <reference path="../pb_data/types.d.ts" />

// Instance-wide borrowing terms: a borrow agreement without a location, set as
// `borrow_agreement` on the leihbase record, applies to every location without
// borrowing terms of its own. Acceptances are stored per borrow agreement, so
// one acceptance covers all those locations.
//
// Managers of any location may see and record acceptances of the instance-wide
// borrowing terms, as they apply to their locations too.

const ACCEPTANCE_RULES = {
  listRule:
    'user = @request.auth.id || @request.auth.role = "admin" || @request.auth.manager_locations ~ borrow_agreement.location',
  viewRule:
    'user = @request.auth.id || @request.auth.role = "admin" || @request.auth.manager_locations ~ borrow_agreement.location',
  createRule:
    'user = @request.auth.id || @request.auth.role = "admin" || @request.auth.manager_locations ~ borrow_agreement.location',
  deleteRule:
    'recorded_by != "" && (@request.auth.role = "admin" || @request.auth.manager_locations ~ borrow_agreement.location)',
};

// Managers of any location, for borrow agreements without a location
const INSTANCE_MANAGER =
  '(borrow_agreement.location = "" && @request.auth.role = "manager" && @request.auth.manager_locations:length > 0)';

const PUBLIC_LOCATIONS_QUERY = (borrowAgreementColumn) =>
  `SELECT id, name, address, email, description, slug, active, opening_hours, links, max_reservation_days, reservation_system, reservation_start_limit, ${borrowAgreementColumn}, borrow_agreement_optional, created, updated FROM location`;

migrate(
  (app) => {
    // Borrow agreements no longer need a location
    const borrowAgreements = app.findCollectionByNameOrId("pbc_3073683465");
    borrowAgreements.fields.getById("relation1587448267").required = false;
    app.save(borrowAgreements);

    // Instance-wide borrow agreement, editable by admins on the instance settings
    // page (1794200100 lets admins update the leihbase record)
    const leihbase = app.findCollectionByNameOrId("gu30h2m0sajzw6p");
    leihbase.fields.add(
      new Field({
        id: "relation1795000001",
        name: "borrow_agreement",
        type: "relation",
        collectionId: "pbc_3073683465",
        cascadeDelete: false,
        maxSelect: 1,
        help: "Borrowing terms of all locations without borrowing terms of their own. Edit them in the admin, under the instance settings.",
      })
    );
    app.save(leihbase);

    const acceptances = app.findCollectionByNameOrId("pbc_1946318072");
    acceptances.listRule = `${ACCEPTANCE_RULES.listRule} || ${INSTANCE_MANAGER}`;
    acceptances.viewRule = `${ACCEPTANCE_RULES.viewRule} || ${INSTANCE_MANAGER}`;
    acceptances.createRule = `${ACCEPTANCE_RULES.createRule} || ${INSTANCE_MANAGER}`;
    acceptances.deleteRule = `recorded_by != "" && (@request.auth.role = "admin" || @request.auth.manager_locations ~ borrow_agreement.location || ${INSTANCE_MANAGER})`;
    app.save(acceptances);

    // Public locations show the borrow agreement that applies: their own, or
    // else the instance-wide one
    const publicLocations = app.findCollectionByNameOrId("forvpmnark8rtoz");
    publicLocations.viewQuery = PUBLIC_LOCATIONS_QUERY(
      "CAST(COALESCE(NULLIF(borrow_agreement, ''), (SELECT borrow_agreement FROM leihbase LIMIT 1), '') AS TEXT) AS borrow_agreement"
    );
    app.save(publicLocations);
  },
  (app) => {
    const publicLocations = app.findCollectionByNameOrId("forvpmnark8rtoz");
    publicLocations.viewQuery = PUBLIC_LOCATIONS_QUERY("borrow_agreement");
    app.save(publicLocations);

    const acceptances = app.findCollectionByNameOrId("pbc_1946318072");
    acceptances.listRule = ACCEPTANCE_RULES.listRule;
    acceptances.viewRule = ACCEPTANCE_RULES.viewRule;
    acceptances.createRule = ACCEPTANCE_RULES.createRule;
    acceptances.deleteRule = ACCEPTANCE_RULES.deleteRule;
    app.save(acceptances);

    const leihbase = app.findCollectionByNameOrId("gu30h2m0sajzw6p");
    leihbase.fields.removeById("relation1795000001");
    app.save(leihbase);

    const borrowAgreements = app.findCollectionByNameOrId("pbc_3073683465");
    borrowAgreements.fields.getById("relation1587448267").required = true;
    app.save(borrowAgreements);
  }
);
