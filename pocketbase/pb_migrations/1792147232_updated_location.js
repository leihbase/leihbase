/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = \"admin\" || (@request.auth.role = \"manager\" && @request.auth.manager_locations ~ id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = \"admin\""
  }, collection)

  return app.save(collection)
})
