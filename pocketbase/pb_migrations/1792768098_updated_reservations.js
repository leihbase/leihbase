/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("h7plyphsy0mgjpf")

  // add field
  collection.fields.addAt(14, new Field({
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
  const collection = app.findCollectionByNameOrId("h7plyphsy0mgjpf")

  // remove field
  collection.fields.removeById("relation2565471406")

  return app.save(collection)
})
