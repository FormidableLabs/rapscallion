const Promise = require("bluebird");

const { EXHAUSTED } = require("../sequence");
const INCOMPLETE = Symbol();

function next (renderer, iter, push) {
  const max = renderer.batchSize;
  let nextVal;

  if (iter >= max) {
    return Promise.resolve(INCOMPLETE);
  }

  try {
    nextVal = renderer._next();
  } catch (err) {
    return Promise.reject(err);
  }

  if (nextVal === EXHAUSTED) {
    return Promise.resolve(EXHAUSTED);
  } else if (nextVal instanceof Promise) {
    return nextVal
    .then(push)
    .then(() => next(renderer, iter + 1, push));
  } else {
    push(nextVal);
    return Promise.resolve(nextVal);
  }
}

/**
 * Given a batch size, request values from the source sequence and push them
 * onto the provided "pushable" (a Node stream or an array).  Once the number
 * of retrieved values reaches the specified batch size, return control back
 * to the caller.
 *
 * @param      {Renderer}     renderer   The Renderer from which to pull next-vals.
 * @param      {Array|Stream}            pushable   Destination for all segments.
 *
 * @return     {boolean|Promise}         Indicates whether there are more values to
 *                                       be retrieved, or if this the last batch.
 */
function pullBatch (renderer, pushable) {
  return next(renderer, 0, val => typeof val === "string" && pushable.push(val));
}

module.exports = { pullBatch, INCOMPLETE };
