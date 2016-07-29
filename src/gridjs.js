// Relative targets
const ALL           = 'ALL';          // All entities in grid
const PREV_IN_ROW   = 'PREV_IN_ROW';  // Previous entity in row
const NEXT_IN_ROW   = 'NEXT_IN_ROW';  // Next entity in row
const PREV_ROW      = 'PREV_ROW';     // All entities in previous row
const ROW           = 'ROW';          // All entities in row
const NEXT_ROW      = 'NEXT_ROW';     // All entities in next row
const PREV_IN_COL   = 'PREV_IN_COL';  // Previous entity in column
const NEXT_IN_COL   = 'NEXT_IN_COL';  // Next entity in column
const PREV_COL      = 'PREV_COL';     // All entities in previous column
const COL           = 'COL';          // All entities in column
const NEXT_COL      = 'NEXT_COL';     // All entities in next column

// After entity removed - actions
const DO_NOTHING          = 'DO_NOTHING';           // Do nothing
const RENEW               = 'RENEW';                // Replace with a new entity
const SHIFT_LEFT          = 'SHIFT_LEFT';           // Shift the entities in the row left when one is deleted
const SHIFT_UP            = 'SHIFT_UP';             // Shift the entities in the column up when one is deleted
const SHIFT_LEFT_ELSE_UP  = 'SHIFT_LEFT_ELSE_UP';   // Shift the entities to the left if there are any, otherwise shift column up
const SHIFT_UP_ELSE_LEFT  = 'SHIFT_UP_ELSE_LEFT';   // Shift the entities up if there are any, otherwise shift row left

// Default options for new grid.
// User may override any number of options in object passed as argument to the function.
let defaultOptions = {
  userObjectChanged: null,      // (newUserObject, oldUserObject, row, column, entityProperties, entityId)
  entityAdded: null,            // (row, column, entityProperties, entityId)
  entityRemoved: null,          // (row, column, entityProperties, entityId)
  entityMessageReceived: null   // (subject, message, userObject, entityProperties, entityId)
};

/**
 * [getObjectValues description]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function getObjectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

/**
 * Checks if value is classified as a Function object
 * Thanks to A.Levy for this clone function (http://stackoverflow.com/a/728694)
 * @param  {*}       value  The value to check
 * @return {Boolean}        Returns true if value is a function, else false.
 */
function isFunction(value) {
  let getType = {};
  return value && getType.toString.call(value) === '[object Function]';
}

/**
 * Generate a uuid
 * Thanks to broofa for this method of generating a uuid (ttp://stackoverflow.com/a/2117523)
 * @return {string} uuid
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
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

/**
 * [isAfterRemoveAction description]
 * @param  {[type]}  action [description]
 * @return {Boolean}        [description]
 */
function isAfterRemoveAction(action) {
  return [DO_NOTHING, RENEW, SHIFT_LEFT, SHIFT_UP, SHIFT_LEFT_ELSE_UP, SHIFT_UP_ELSE_LEFT].includes(action);
}

/**
 * [isEntity description]
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isEntity(obj) {
  return obj && obj instanceof Entity;
}

// When we remove an entity from the grid we will call a callback provided for the user's object.
// Based on the options passed in, we can modify the bahaviour.

/**
 * Create a new grid
 * @return {object}
 */
function createGrid(options = {}) {
  const entities = {};
  const rows = [];
  const columns = [];
  const grid = {};

  function addEntity(row, col) {
    // Create a new entity and append to row and column.
    let prevInRow = row.length > 0 ? row[row.length - 1] : null;
    let prevInCol = col.length > 0 ? col[col.length - 1] : null;
    let newEntity = new Entity(prevInRow, prevInCol, options);

    if (prevInRow !== null) {
      prevInRow.nextInRow = newEntity;
    }

    if (prevInCol !== null) {
      prevInCol.netInCol = newEntity;
    }

    entities[newEntity.id] = newEntity;
    row.push(newEntity);
    col.push(newEntity);

    if (isFunction(options.entityAdded)) {
      options.entityAdded(row, col, newEntity.properties, newEntity.id);
    }

    return newEntity;
  }

  function getEntity(val) {
    // We need to resolve the value of source to an Entity
    let entity = null;

    // Is this a string? It could be an id
    if (isEntity(val)) {
      entity = val;
    } else if (typeof val === 'string' && Object.keys(entities).includes(val)) {
      entity = entities[val];
    } else if (Array.isArray(val) && val.length === 2) {
      entity = getEntityByPosition(val[0], val[1]);
    } else {
      entity = getEntityByUserObject(val);
    }
  }

  function isEntityRelativeTarget(e1, e2, target) {
    if (e1 !== e2) {
      switch (target) {
        case ALL:
          return true;
        case PREV_IN_ROW:
          return e2 === e1.prevInRow;
        case NEXT_IN_ROW:
          return e2 === e1.prevInRow;
        case PREV_ROW:
          return e2.rowNumber === (e1.rowNumber - 1);
        case ROW:
          return e2.rowNumber === e1.rowNumber;
        case NEXT_ROW:
          return e2.rowNumber === (e1.rowNumber + 1);
        case PREV_IN_COL:
          return e2 === e1.prevInCol;
        case NEXT_IN_COL:
          return e2 === e1.nextInCol;
        case NEXT_COL:
          return e2.colNumber === (e1.colNumber - 1);
        case COL:
          return e2.colNumber === e1.colNumber;
        case PREV_COL:
          return e2.colNumber === (e1.colNumber + 1);
      }
    }

    return false;
  }

  function getRelativeEntities(entity, target) {
    return getObjectValues(entities).filter(val => isEntityRelativeTarget(entity, val, target));
  }

  function getEntityByPosition(row, col, create) {
    // Do we have this many rows and columns?
    // If not, and create flag is true, we will create them first
    if (create) {
      // Create new rows
      for (let i = rows.length; i < row; i++) {
        addRow();
      }

      // Create new columns
      for (let i = columns.length; i < col; i++) {
        addColumn();
      }
    }

    if (rows.length >= row && rows[row - 1].length >= col) {
      return rows[row - 1][col - 1];
    }

    // No entity there, and we didn't create it
    return null;
  }

  function getEntityByUserObject(userObject) {
    return (getObjectValues(entities).find(entity => entity.userObject === userObject) || null);
  }

  function addRow() {
    // Add an entity for each column
    let row = [];
    columns.forEach(col => addEntity(row, col));
    rows.push(row);
  }

  function addColumn() {
    // Add an entity for each row
    let col = [];
    rows.forEach(row => addEntity(row, col));
    columns.push(col);
  }

  function setUserObject(entity, userObject) {
    let oldUserObject = entity.userObject;
    entity.userObject = userObject;

    if (isFunction(options.userObjectChanged)) {
      options.userObjectChanged(userObject, oldUserObject, entity.rowNumber, entity.colNumber, entity.properties, entity.id);
    }
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

    let targetEntity = getEntity(target);

    if (targetEntity !== null) {
      if (isFunction(options.entityMessageReceived)) {
        options.entityMessageReceived(subject, message, targetEntity.userObject, targetEntity.properties, targetEntity.id);
      }
    } else if (isRelativeTarget(target)) {
      // Get entities, and for each call grid.publish
      getRelativeEntities(source, target).forEach(entity => grid.publish(source, entity, subject, message));
    }
  };

  /**
   * Find entities that when passed to interatee function, return true.
   * @param  {function} iteratee Iteratee function (userObject, entityProps, entityId)
   * @return {Entity[]}
   */
  grid.find = function (iteratee) {
    if (isFunction(iteratee)) {
      return getObjectValues(entities).filter(entity => iteratee(entity.userObject, entity.properties, entity.id));
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
      let entity = getEntityByPosition(row, column, false);
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
    let entity = getEntityByPosition(row, column, true);
    if (userObject) {
      setUserObject(entity, userObject);
    }
  };

  /**
   * Move the user object from one entity on grid to another
   * @param  {[type]} fromRow    [description]
   * @param  {[type]} fromColumn [description]
   * @param  {[type]} toRow      [description]
   * @param  {[type]} toColumn   [description]
   * @return {[type]}            [description]
   */
  grid.move = function (fromRow, fromColumn, toRow, toColumn) {
    let fromEntity = getEntityByPosition(fromRow, fromColumn);
    let toEntity = getEntityByPosition(toRow, toColumn, true);

    if (fromEntity && toEntity) {
      let userObject = fromEntity.userObject;
      setUserObject(fromEntity, null);
      setUserObject(toEntity, userObject);
    }
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
class Entity {
  constructor(prevInRow, prevInCol, options) {
    this.id = uuid();
    this.rowNumber = prevInRow ? prevInRow.rowNumber + 1 : 1;
    this.colNumber = prevInCol ? prevInCol.colNumber + 1 : 1;
    this.prevInRow = prevInRow;
    this.prevInCol = prevInCol;
    this.properties = {};
    this.userObject = null;
    this.options = options;
  }
}

class DuplicateFirstEntityException {
  constructor() {
    this.name = 'DuplicateFirstEntityException';
    this.message = 'Cannot add multiple entities as first entity in grid';
  }
}

export { createGrid };