/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("forvpmnark8rtoz")

  // update collection data, the fields of the view are generated from the query
  unmarshal({
    "viewQuery": "SELECT id, name, address, email, description, slug, active, opening_hours, links, max_reservation_days, reservation_system, reservation_start_limit, borrow_agreement, borrow_agreement_optional, created, updated FROM location"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("forvpmnark8rtoz")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT id, name, address, email, description, slug, active, opening_hours, links, max_reservation_days, reservation_system, reservation_start_limit, borrow_agreement, created, updated FROM location"
  }, collection)

  return app.save(collection)
})
