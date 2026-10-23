/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // add field
  collection.fields.addAt(15, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3073683465",
    "help": "",
    "hidden": false,
    "id": "relation2565471406",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "borrow_agreement",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // remove field
  collection.fields.removeById("relation2565471406")

  return app.save(collection)
})
