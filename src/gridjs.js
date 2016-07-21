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
  autoExpand: false,
  autoCollapse: false,
  afterEntityRemoved: DO_NOTHING,

  // Callbacks
  userObjectChanged: null,  // (entity, newUserObject, oldUserObject)
  entityAdded: null,        // (entity)
  entityRemoved: null       // (entity)
};

function isFunction(functionToCheck) {
  let getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Generate a uuid
 * Thanks to broofa for this method of generating a uuid
 * http://stackoverflow.com/a/2117523
 * @return {string} uuid
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
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
  let entitiesId = {};
  let entities = [];
  let rows = [];
  let columns = [];
  let grid = {};

  let firstEntity = null;

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
    if (isRelativeTarget(target)) {

    } else if (isEntityId(target)) {
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
      return entities.filter(entity => iteratee(entity.userObject, entity.properties, entity.id));
    } else {
      return [];
    }
  };

  grid.addEntity = function (after, space=ROW) {
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
class Entity {
  constructor(options) {
    this.id = uuid();
    // Properties object can be passed to the user object when it is attached to the entity.
    // This allows properties associated with the entity can remain in place when the user object
    // is moved within the grid.
    this.properties = {};
    this.userObject = null;
    this.options = options;
  }

  setUserObject(newUserObject) {
    let oldUserObject = this.userObject;
    this.userObject = newUserObject;

    if (isFunction(this.options.userObjectChanged)) {
      this.options.userObjectChanged(this.properties, newUserObject, oldUserObject);
    }
  }
}

class DuplicateFirstEntityException {
  constructor() {
    this.name = 'DuplicateFirstEntityException';
    this.message = 'Cannot add multiple entities as first entity in grid';
  }
}

export default createGrid;