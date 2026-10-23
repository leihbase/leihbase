/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("forvpmnark8rtoz")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT id, name, address, email, description, slug, active, opening_hours, links, max_reservation_days, reservation_system, reservation_start_limit, borrow_agreement, created, updated FROM location"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_vGyo")

  // remove field
  collection.fields.removeById("_clone_qh7l")

  // remove field
  collection.fields.removeById("_clone_mIbb")

  // remove field
  collection.fields.removeById("_clone_qzFP")

  // remove field
  collection.fields.removeById("_clone_1Iml")

  // remove field
  collection.fields.removeById("_clone_r3Qp")

  // remove field
  collection.fields.removeById("_clone_02sX")

  // remove field
  collection.fields.removeById("_clone_nxCj")

  // remove field
  collection.fields.removeById("_clone_ndZk")

  // remove field
  collection.fields.removeById("_clone_zQws")

  // remove field
  collection.fields.removeById("_clone_0ho5")

  // remove field
  collection.fields.removeById("_clone_rdp1")

  // remove field
  collection.fields.removeById("_clone_BXpy")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_7WHD",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_RrBT",
    "max": 0,
    "min": 0,
    "name": "address",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "_clone_uAH6",
    "name": "email",
    "onlyDomains": null,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "email"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "convertURLs": false,
    "help": "",
    "hidden": false,
    "id": "_clone_FaIM",
    "maxSize": 0,
    "name": "description",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_lDmU",
    "max": 0,
    "min": 0,
    "name": "slug",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_RMDo",
    "name": "active",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_qII6",
    "maxSize": 2000000,
    "name": "opening_hours",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_6X4z",
    "maxSize": 2000000,
    "name": "links",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_Vkl6",
    "max": null,
    "min": null,
    "name": "max_reservation_days",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "single: allow one active or future reservation per product; multiple: allow multiple active or future reservations per product (in different time-spans)",
    "hidden": false,
    "id": "_clone_ISr9",
    "maxSelect": 0,
    "name": "reservation_system",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "disabled",
      "single",
      "multiple"
    ]
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "help": "Furthest in advance a reservation can begin, in days (0=endless).",
    "hidden": false,
    "id": "_clone_oXnb",
    "max": null,
    "min": 0,
    "name": "reservation_start_limit",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3073683465",
    "help": "",
    "hidden": false,
    "id": "_clone_lJLu",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "borrow_agreement",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "_clone_PI0y",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "_clone_bTFP",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("forvpmnark8rtoz")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT id, name, address, email, description, slug, active, opening_hours, links, max_reservation_days, reservation_system, reservation_start_limit, created, updated FROM location"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_vGyo",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_qh7l",
    "max": 0,
    "min": 0,
    "name": "address",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "_clone_mIbb",
    "name": "email",
    "onlyDomains": null,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "email"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "convertURLs": false,
    "help": "",
    "hidden": false,
    "id": "_clone_qzFP",
    "maxSize": 0,
    "name": "description",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_1Iml",
    "max": 0,
    "min": 0,
    "name": "slug",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_r3Qp",
    "name": "active",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_02sX",
    "maxSize": 2000000,
    "name": "opening_hours",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_nxCj",
    "maxSize": 2000000,
    "name": "links",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_ndZk",
    "max": null,
    "min": null,
    "name": "max_reservation_days",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "single: allow one active or future reservation per product; multiple: allow multiple active or future reservations per product (in different time-spans)",
    "hidden": false,
    "id": "_clone_zQws",
    "maxSelect": 0,
    "name": "reservation_system",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "disabled",
      "single",
      "multiple"
    ]
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "help": "Furthest in advance a reservation can begin, in days (0=endless).",
    "hidden": false,
    "id": "_clone_0ho5",
    "max": null,
    "min": 0,
    "name": "reservation_start_limit",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "_clone_rdp1",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "_clone_BXpy",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // remove field
  collection.fields.removeById("_clone_7WHD")

  // remove field
  collection.fields.removeById("_clone_RrBT")

  // remove field
  collection.fields.removeById("_clone_uAH6")

  // remove field
  collection.fields.removeById("_clone_FaIM")

  // remove field
  collection.fields.removeById("_clone_lDmU")

  // remove field
  collection.fields.removeById("_clone_RMDo")

  // remove field
  collection.fields.removeById("_clone_qII6")

  // remove field
  collection.fields.removeById("_clone_6X4z")

  // remove field
  collection.fields.removeById("_clone_Vkl6")

  // remove field
  collection.fields.removeById("_clone_ISr9")

  // remove field
  collection.fields.removeById("_clone_oXnb")

  // remove field
  collection.fields.removeById("_clone_lJLu")

  // remove field
  collection.fields.removeById("_clone_PI0y")

  // remove field
  collection.fields.removeById("_clone_bTFP")

  return app.save(collection)
})
