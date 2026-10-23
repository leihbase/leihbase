/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(12, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3073683465",
    "help": "",
    "hidden": false,
    "id": "relation4147821595",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "accepted_borrow_agreements",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(12, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3073683465",
    "help": "",
    "hidden": false,
    "id": "relation4147821595",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "accepted_borrow_agreements",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
