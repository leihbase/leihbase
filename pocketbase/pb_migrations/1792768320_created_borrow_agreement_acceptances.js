/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "user = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.manager_locations ~ borrow_agreement.location",
    "deleteRule": "@request.auth.role = \"admin\" || @request.auth.manager_locations ~ borrow_agreement.location",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "help": "",
        "hidden": false,
        "id": "relation2375276105",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "user",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_3073683465",
        "help": "",
        "hidden": false,
        "id": "relation2565471406",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "borrow_agreement",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "help": "",
        "hidden": false,
        "id": "relation1931542637",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "recorded_by",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_1946318072",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_borrow_agreement_acceptances_user_borrow_agreement` ON `borrow_agreement_acceptances` (`user`, `borrow_agreement`)"
    ],
    "listRule": "user = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.manager_locations ~ borrow_agreement.location",
    "name": "borrow_agreement_acceptances",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "user = @request.auth.id || @request.auth.role = \"admin\" || @request.auth.manager_locations ~ borrow_agreement.location"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1946318072");

  return app.delete(collection);
})
