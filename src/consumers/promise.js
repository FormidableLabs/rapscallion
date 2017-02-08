/* global setImmediate */
const { pullBatch } = require("./common");


// eslint-disable-next-line max-params
function asyncBatch (sequence, batchSize, arrayBuffer, resolve) {
  const isLast = pullBatch(sequence, batchSize, arrayBuffer);
  if (isLast) {
    resolve(arrayBuffer.join(""));
  } else {
    setImmediate(asyncBatch, sequence, batchSize, arrayBuffer, resolve);
  }
}

/**
 * Consumes the provided sequence and returns a promise with the concatenation of all
 * sequence segments.
 *
 * @param      {Sequence}    sequence   Source sequence.
 * @param      {Integer}     batchSize  The number of HTML segments to render
 *                                      before passing control back to the event loop.
 *
 * @return     {Promise}                A promise resolving to the HTML string.
 */
function toPromise (sequence, batchSize) {
  const arrayBuffer = [];
  return new Promise(resolve =>
    setImmediate(asyncBatch, sequence, batchSize, arrayBuffer, resolve)
  );
}


module.exports = toPromise;
