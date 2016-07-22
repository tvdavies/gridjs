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
    userObjectChanged: null, // (entity, newUserObject, oldUserObject)
    entityAdded: null, // (entity)
    entityRemoved: null, // (entity)
    entityMessageReceived: null // (subject, message, userObject, entityProperties, entityId)
  };

  /**
   * Checks if value is classified as a Function object
   * Thanks to A.Levy for this clone function (http://stackoverflow.com/a/728694)
   * @param  {*}       value  The value to check
   * @return {Boolean}        Returns true if value is a function, else false.
   */
  function isFunction(value) {
    var getType = {};
    return value && getType.toString.call(value) === '[object Function]';
  }

  /**
   * Generate a uuid
   * Thanks to broofa for this method of generating a uuid (ttp://stackoverflow.com/a/2117523)
   * @return {string} uuid
   */
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Detect whether or not the target provided is a valid relative target identifier
   * @param  {[type]}  target targetName
   * @return {Boolean}
   */
  function isRelativeTarget(target) {
    return [ALL, PREV_IN_ROW, NEXT_IN_ROW, PREV_ROW, ROW, NEXT_ROW, PREV_IN_COL, NEXT_IN_COL, PREV_COL, COL, NEXT_COL].includes(target);
  }

  function isAfterRemoveAction(action) {
    return [DO_NOTHING, RENEW, SHIFT_LEFT, SHIFT_UP, SHIFT_LEFT_ELSE_UP, SHIFT_UP_ELSE_LEFT].includes(action);
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
    var FIRST_ENTITY = new Entity(null, null, options);
    var entities = {};
    var rows = [[FIRST_ENTITY]];
    var columns = [[FIRST_ENTITY]];
    var grid = {};

    function addEntity(row, col) {
      // Create a new entity and append to row and column.
      var prevInRow = row[row.length - 1];
      var prevInCol = col[col.length - 1];
      var newEntity = new Entity(prevInRow, prevInCol, options);

      prevInRow.nextInRow = newEntity;
      prevInCol.netInCol = newEntity;

      entities[newEntity.id] = newEntity;
      row.push(newEntity);
      col.push(newEntity);
    }

    function getEntity(val) {
      // We need to resolve the value of source to an Entity
      var entity = null;

      // Is this a string? It could be an id
      if (isEntity(val)) {
        entity = val;
      } else if (typeof val === 'string' && entities.keys().includes(val)) {
        entity = entities[val];
      } else if (Array.isArray(val) && val.length === 2) {
        entity = getEntityByPosition(val[0], val[1]);
      } else {
        entity = getEntityByUserObject(val);
      }
    }

    function getRelativeEntities(entity, target) {
      var relativeEntities = [];

      return relativeEntities;
    }

    function getEntityByPosition(row, col, create) {
      // Do we have this many rows and columns?
      // If not, and create flag is true, we will create them first
      if (create) {
        // Create new rows
        for (var i = rows.length; i < row; i++) {
          grid.addRow();
        }

        // Create new columns
        for (var _i = columns.length; _i < col; _i++) {
          grid.addColumn();
        }
      }

      if (rows.length >= row && rows[row - 1].length >= col) {
        return rows[row - 1][col - 1];
      }

      // No entity there, and we didn't create it
      return null;
    }

    function getEntityByUserObject(userObject) {
      return entities.find(function (entity) {
        return entity.userObject === userObject;
      });
    }

    function addRow() {
      var _this = this;

      // Add an entity for each column
      var row = [];
      columns.forEach(function (col) {
        return _this.addEntity(row, col);
      });
    }

    function addColumn() {
      var _this2 = this;

      // Add an entity for each row
      var col = [];
      rows.forEach(function (row) {
        return _this2.addEntity(row, col);
      });
    }

    /**
     * Publish a message out to other entities in the grid.
     * @param  {string} source   The entity ID of the message source
     * @param  {string} target   The relative target(s), or entity ID or target for message
     * @param  {strinf} subject  The subject
     * @param  {object} message  The message to send
     * @return {undefined}
     */
    grid.publish = function (source, target, subject, message) {
      // Source should be Entity, entityId, userObject or Array[row, column];
      source = getEntity(source);

      if (source === null) {
        throw new Error('Cannot publish message without a valid source');
      }

      var targetEntity = getEntity(target);

      if (targetEntity !== null) {
        if (isFunction(options.entityMessageReceived)) {
          options.entityMessageReceived(subject, message, targetEntity.userObject, targetEntity.properties, targetEntity.id);
        }
      } else if (isRelativeTarget(target)) {
        // Get entities, and for each call grid.publish
        getRelativeEntities(source, target).forEach(function (entity) {
          return grid.publish(source, entity, subject, message);
        });
      }
    };

    /**
     * Find entities that when passed to interatee function, return true.
     * @param  {function} iteratee Iteratee function (userObject, entityProps, entityId)
     * @return {Entity[]}
     */
    grid.find = function (iteratee) {
      if (isFunction(iteratee)) {
        return Object.values(entities).filter(function (entity) {
          return iteratee(entity.userObject, entity.properties, entity.id);
        });
      } else {
        return [];
      }
    };

    /**
     * Get user object at grid position
     * @param  {[type]} row    [description]
     * @param  {[type]} column [description]
     * @return {[type]}        [description]
     */
    grid.get = function (row, column, callback) {
      if (isFunction(callback)) {
        var entity = getEntity(row, column, true);
        callback(entity.userObject, entity.properties);
      }
    };

    /**
     * Set user object at grid position
     * @param {[type]} row        [description]
     * @param {[type]} column     [description]
     * @param {[type]} userObject [description]
     */
    grid.set = function (row, column, userObject) {
      getEntity(row, column).userObject = userObject;
    };

    /**
     * Get number of rows in grid
     * @return {number} Number of rows
     */
    grid.getRowCount = function () {
      return rows.length;
    };

    /**
     * Get number of columns in grid
     * @return {number} Number of columns
     */
    grid.getColumnCount = function () {
      return columns.length;
    };

    return grid;
  }

  /**
   * Entity class. Represents an item in the grid data store.
   */

  var Entity = function () {
    function Entity(prevInRow, prevInCol, options) {
      _classCallCheck(this, Entity);

      this.id = uuid();

      this.prevInRow = prevInRow;
      this.prevInCol = prevInCol;

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

  exports.createGrid = createGrid;
});