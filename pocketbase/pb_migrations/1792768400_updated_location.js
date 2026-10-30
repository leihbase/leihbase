/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // add field
  collection.fields.addAt(16, new Field({
    "help": "Allows users to reserve without accepting the borrow agreement, to accept it later or in the store.",
    "hidden": false,
    "id": "bool2184021863",
    "name": "borrow_agreement_optional",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // remove field
  collection.fields.removeById("bool2184021863")

  return app.save(collection)
})
