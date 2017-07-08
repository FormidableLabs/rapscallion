/* eslint-disable no-invalid-this */
const {
  isFunction,
  assign
} = require("lodash");


/**
 * A synchronous replacement for React's `setState` method.
 *
 * @param      {Function|Object}  newState  An object containing new keys/values
 *                                          or a function that will provide the same.
 *
 * @returns    {undefined}                  No return value.
 */
function syncSetState (newState) {
  // Mutation is faster and should be safe here.
  this.state = assign(
    this.state,
    isFunction(newState) ?
      newState(this.state, this.props) :
      newState
  );
}


module.exports = { syncSetState };
