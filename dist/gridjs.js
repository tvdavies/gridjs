/**
 * gridjs - Provides a dynamic data structure for storage and access of entities within a grid structure.
 * @version 0.0.1
 * @link https://github.com/tvdavies/gridjs
 * @copyright Copyright (c) 2016 Tom Davies
 * @license https://github.com/tvdavies/gridjs/raw/master/LICENSE.md
 */
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.gridjs = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  // Relative targets
  var ALL = 'ALL'; // All entities in grid
  var PREV_IN_ROW = 'PREV_IN_ROW'; // Previous entity in row
  var NEXT_IN_ROW = 'NEXT_IN_ROW'; // Next entity in row
  var PREV_ROW = 'PREV_ROW'; // All entities in previous row
  var ROW = 'ROW'; // All entities in row
  var NEXT_ROW = 'NEXT_ROW'; // All entities in next row
  var PREV_IN_COL = 'PREV_IN_COL'; // Previous entity in column
  var NEXT_IN_COL = 'NEXT_IN_COL'; // Next entity in column
  var PREV_COL = 'PREV_COL'; // All entities in previous column
  var COL = 'COL'; // All entities in column
  var NEXT_COL = 'NEXT_COL'; // All entities in next column

  // After entity removed - actions
  var DO_NOTHING = 'DO_NOTHING'; // Do nothing
  var RENEW = 'RENEW'; // Replace with a new entity
  var SHIFT_LEFT = 'SHIFT_LEFT'; // Shift the entities in the row left when one is deleted
  var SHIFT_UP = 'SHIFT_UP'; // Shift the entities in the column up when one is deleted
  var SHIFT_LEFT_ELSE_UP = 'SHIFT_LEFT_ELSE_UP'; // Shift the entities to the left if there are any, otherwise shift column up
  var SHIFT_UP_ELSE_LEFT = 'SHIFT_UP_ELSE_LEFT'; // Shift the entities up if there are any, otherwise shift row left

  // Default options for new grid.
  // User may override any number of options in object passed as argument to the function.
  var defaultOptions = {
    autoExpand: false,
    autoCollapse: false,
    afterEntityRemoved: DO_NOTHING,

    // Callbacks
    userObjectChanged: null, // (entity, newUserObject, oldUserObject)
    entityAdded: null, // (entity)
    entityRemoved: null // (entity)
  };

  function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  /**
   * Generate a uuid
   * Thanks to broofa for this method of generating a uuid
   * http://stackoverflow.com/a/2117523
   * @return {string} uuid
   */
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  function isRelativeTarget(target) {
    return [ALL, PREV_IN_ROW, NEXT_IN_ROW, PREV_ROW, ROW, NEXT_ROW, PREV_IN_COL, NEXT_IN_COL, PREV_COL, COL, NEXT_COL].includes(target);
  }

  function isEntityId(entitiesMap, entityId) {
    return entitiesMap.hasOwnProperty(entityId) && entitiesMap[entityId];
  }

  function isEntity(obj) {
    return obj && obj instanceof Entity;
  }

  // When we remove an entity from the grid we will call a callback provided for the user's object.
  // Based on the options passed in, we can modify the bahaviour.

  /**
   * Create a new grid
   * @return {object}
   */
  function createGrid(options) {
    var entitiesId = {};
    var entities = [];
    var rows = [];
    var columns = [];
    var grid = {};

    var firstEntity = null;

    /**
     * Publish a message out to other entities in the grid.
     * @param  {string} source   The entity ID of the message source
     * @param  {string} target   The relative target(s), or entity ID or target for message
     * @param  {strinf} subject  The subject
     * @param  {object} message  The message to send
     * @return {undefined}
     */
    grid.publish = function (source, target, subject, message) {
      // Check target is valid
      if (isRelativeTarget(target)) {} else if (isEntityId(target)) {
        // Send message to entity
      }
    };

    /**
     * [find description]
     * @param  {[type]} iteratee [description]
     * @return {[type]}          [description]
     */
    grid.find = function (iteratee) {
      if (isFunction(iteratee)) {
        return entities.filter(function (entity) {
          return iteratee(entity.userObject, entity.properties, entity.id);
        });
      } else {
        return [];
      }
    };

    grid.addEntity = function (after) {
      var space = arguments.length <= 1 || arguments[1] === undefined ? ROW : arguments[1];

      // After must be an entity/entityId/userObject on the grid, unless this is the first entity, in which case
      // it will be added to the first row, and the first column.

      if (typeof after === 'undefined' || after === null) {
        if (firstEntity !== null) {
          // I'm afraid this isn't going to work out. It's not you, it's me.
          throw new DuplicateFirstEntityException();
        } else {
          // Add a new entity as the first in the grid

          // TODO Create an entity and add it.
          // Surely we must be able to automatically create the first row/column
          // even when autoExpand is not set to true.
          // There is also the crucial question of how do we create the properties
          // for the new entity? The properties could depend on other entities in the
          // group, but we don't know which... needs some thinkin'.
        }
      }

      // TODO
      // Whatever the user has provided, we need to try and resolve it to an entity in the grid
      // otherwise we cannot add a new entity.

      /*
      if (isEntity(after)) {
       } else if (isEntityId(after)) {
       }
      */
    };

    grid.removeEntity = function (entity) {
      // TODO
      // Remove an entity and do the jiggery-pokery to shift things around according to the options
    };

    return grid;
  }

  /**
   * Entity class. Represents an item in the grid data store.
   */

  var Entity = function () {
    function Entity(options) {
      _classCallCheck(this, Entity);

      this.id = uuid();
      // Properties object can be passed to the user object when it is attached to the entity.
      // This allows properties associated with the entity can remain in place when the user object
      // is moved within the grid.
      this.properties = {};
      this.userObject = null;
      this.options = options;
    }

    _createClass(Entity, [{
      key: 'setUserObject',
      value: function setUserObject(newUserObject) {
        var oldUserObject = this.userObject;
        this.userObject = newUserObject;

        if (isFunction(this.options.userObjectChanged)) {
          this.options.userObjectChanged(this.properties, newUserObject, oldUserObject);
        }
      }
    }]);

    return Entity;
  }();

  var DuplicateFirstEntityException = function DuplicateFirstEntityException() {
    _classCallCheck(this, DuplicateFirstEntityException);

    this.name = 'DuplicateFirstEntityException';
    this.message = 'Cannot add multiple entities as first entity in grid';
  };

  exports.default = createGrid;
});