/* global setImmediate */
const { pullBatch, getReactIdPushable } = require("./common");


// eslint-disable-next-line max-params
function asyncBatch (
  sequence,
  batchSize,
  pushable,
  dataReactAttrs,
  resolve
) {
  const isLast = pullBatch(sequence, batchSize, pushable);
  if (isLast) {
    resolve();
  } else {
    setImmediate(asyncBatch, sequence, batchSize, pushable, dataReactAttrs, resolve);
  }
}

/**
 * Consumes the provided sequence and returns a promise with the concatenation of all
 * sequence segments.
 *
 * @param      {Sequence}  sequence        Source sequence.
 * @param      {Integer}   batchSize       The number of HTML segments to render
 *                                         before passing control back to the event loop.
 * @param      {Boolean}   dataReactAttrs  Indicates whether data-react* attrs should be
 *                                         rendered.
 *
 * @return     {Promise}                   A promise resolving to the HTML string.
 */
function toPromise (sequence, batchSize, dataReactAttrs) {
  const arrayBuffer = [];
  const reactIdPushable = getReactIdPushable(arrayBuffer, 0, dataReactAttrs);

  return new Promise(resolve =>
    setImmediate(
      asyncBatch,
      sequence,
      batchSize,
      reactIdPushable,
      dataReactAttrs,
      resolve
    )
  ).then(() => arrayBuffer.join(""));
}


module.exports = toPromise;
