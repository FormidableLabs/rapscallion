const Promise = require("bluebird");

const { EXHAUSTED } = require("../sequence");


const INCOMPLETE = Symbol();


/**
 * Given a batch size, request values from the source sequence and push them
 * onto the provided "pushable" (a Node stream or an array).  Once the number
 * of retrieved values reaches the specified batch size, return control back
 * to the caller.
 *
 * @param      {Sequence}     sequence   Source sequence.
 * @param      {Integer}      batchSize  The number of segments to generated before
 *                                       returning control call to the caller.
 * @param      {Array|Stream}            pushable   Destination for all segments.
 *
 * @return     {boolean|Promise}         Indicates whether there are more values to
 *                                       be retrieved, or if this the last batch.
 */
function pullBatch (renderer, pushable) {
  let iter = renderer.batchSize;
  while (iter--) {
    const next = renderer._next();
    if (
      next === EXHAUSTED ||
      next instanceof Promise
    ) {
      return next;
    }

    pushable.push(next);
  }
  return INCOMPLETE;
}


module.exports = {
  pullBatch,
  INCOMPLETE
};
