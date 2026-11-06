/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1946318072")

  // update collection data
  unmarshal({
    "deleteRule": "recorded_by != \"\" && (@request.auth.role = \"admin\" || @request.auth.manager_locations ~ borrow_agreement.location)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1946318072")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = \"admin\" || @request.auth.manager_locations ~ borrow_agreement.location"
  }, collection)

  return app.save(collection)
})
