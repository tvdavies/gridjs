// GridJS
// Author: Tom Davies
// GridJS provides a dynamic data structure for storage and access of entities
// within a grid structure.

/*

Options: {

  autoExpand: row|column|both,

  afterCellCleared: collapse|

}
 */

var gridjs = (function () {

  // Relative Target Constants
  const ALL           = 'ALL';          // All entities in grid
  const PREV_IN_ROW   = 'PREV_IN_ROW';  // Previous entity in row
  const NEXT_IN_ROW   = 'NEXT_IN_ROW';  // Next entity in row
  const PREV_ROW      = 'PREV_ROW'      // All entities in previous row
  const ROW           = 'ROW';          // All entities in row
  const NEXT_ROW      = 'NEXT_ROW';     // All entities in next row
  const PREV_IN_COL   = 'PREV_IN_COL';  // Previous entity in column
  const NEXT_IN_COL   = 'NEXT_IN_COL';  // Next entity in column
  const PREV_COL      = 'PREV_COL';     // All entities in previous column
  const COL           = 'COL';          // All entities in column
  const NEXT_COL      = 'NEXT_COL';     // All entities in next column


  function isRelativeTarget(target) {
    return [ALL, PREV_IN_ROW, NEXT_IN_ROW, PREV_ROW, ROW, NEXT_ROW, PREV_IN_COL, NEXT_IN_COL, PREV_COL, COL, NEXT_COL].includes(target);
  }

  function isEntityId(entities, entityId) {
    return entities.hasOwnProperty(entityId) && entities[entityId] !== null;
  }

  // When we remove an entity from the grid we will call a callback provided for the user's object.
  // Based on the options passed in, we can modify the bahaviour.


  function createGrid() {

    let entities = {};
    let rows = [];
    let columns = [];

    let grid = {};

    /**
     * Publish a message out to other entities in the grid.
     * @param  {string} source   The entity ID of the message source
     * @param  {string} target   The relative target(s), or entity ID or target for message
     * @param  {object} message  The message to send
     * @return {undefined}
     */
    grid.publish = function (source, target, message) {
      // Check target is valid
      if (isRelativeTarget(target)) {

      } else (isEntityId(target)) {
        // Send message to entity
      }
    }

    return grid;
  }

}());