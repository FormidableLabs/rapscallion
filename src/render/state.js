const {
  isFunction,
  assign
} = require("lodash");


/* eslint-disable no-invalid-this */
function syncSetState (newState, cb) {
  // Mutation is faster and should be safe here.
  this.state = assign(
    this.state,
    isFunction(newState) ?
      newState(this.state, this.props) :
      newState
  );
  if (cb) { cb.call(this); }
}
/* eslint-enable no-invalid-this */


module.exports = { syncSetState };
