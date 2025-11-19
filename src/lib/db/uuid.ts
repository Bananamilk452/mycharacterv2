// @ts-nocheck
/**
 * This class allows you to use UUID primary keys in Dexie by defining them in the store using two dollar signs ($$), eg:
 *
 * db.version(1).stores({
 *   orders: '$$id, price',
 *   order_products: '$$id, product, order_id'
 * });
 *
 * Parts are adapted from dexie-observable.js.
 */

import Dexie from "dexie";

/**
 * DexieUUIDPrimaryKey plugin
 * @param db
 * @constructor
 */
function DexieUUIDPrimaryKey(db) {
  // Override the _parseStoresSpec method with our own implementation
  db.Version.prototype._parseStoresSpec = Dexie.override(
    db.Version.prototype._parseStoresSpec,
    overrideParseStoresSpec,
  );
  // Override the open method with our own implementation
  db.open = Dexie.override(db.open, prepareOverrideOpen(db));
}

/**
 * This function overrides the parseStoresSpec method of Dexie to allow for UUID primary keys.
 * @param origFunc
 * @returns {(function(*, *): void)|*}
 */
function overrideParseStoresSpec(origFunc) {
  return function (stores, dbSchema) {
    origFunc.call(this, stores, dbSchema);
    Object.keys(dbSchema).forEach(function (tableName) {
      const schema = dbSchema[tableName];
      if (schema.primKey.name.indexOf("$$") === 0) {
        schema.primKey.uuid = true;
        schema.primKey.name = schema.primKey.name.substr(2);
        schema.primKey.keyPath = schema.primKey.keyPath.substr(2);
      }
    });
  };
}

/**
 * This function prepares the hook that will trigger on creation of a new record
 * @param table
 * @returns {function(*, *): undefined}
 */
function initCreatingHook(table) {
  return function creatingHook(primKey, obj) {
    let rv = undefined;
    if (primKey === undefined && table.schema.primKey.uuid) {
      primKey = rv = crypto.randomUUID();
      if (table.schema.primKey.keyPath) {
        Dexie.setByKeyPath(obj, table.schema.primKey.keyPath, primKey);
      }
    }

    return rv;
  };
}

/**
 * This function prepares the hook that will trigger on opening the database and will loop through all tables to add the creating hook.
 * @param db
 * @returns {function(*): function(): *}
 */
function prepareOverrideOpen(db) {
  return function overrideOpen(origOpen) {
    return function () {
      Object.keys(db._allTables).forEach((tableName) => {
        const table = db._allTables[tableName];
        table.hook("creating").subscribe(initCreatingHook(table));
      });
      return origOpen.apply(this, arguments);
    };
  };
}

Dexie.UUIDPrimaryKey = DexieUUIDPrimaryKey;
Dexie.addons.push(DexieUUIDPrimaryKey);

export default Dexie.UUIDPrimaryKey;
