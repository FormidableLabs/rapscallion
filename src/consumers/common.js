const { EXHAUSTED } = require("../sequence");


/**
 * Given a batch size, request values from the source sequence and push them
 * onto the provided "pushable" (a Node stream or an array).  Once the number
 * of retrieved values reaches the specified batch size, return control back
 * to the caller.
 *
 * @param      {Sequence}   sequence   Source sequence.
 * @param      {Integer}    batchSize  The number of segments to generated before
 *                                     returning control call to the caller.
 * @param      {Array}      pushable   Destination for all segments.
 *
 * @return     {boolean}               Indicates whether there are more values to
 *                                     be retrieved, or if this the last batch.
 */
function pullBatch (sequence, batchSize, pushable) {
  let iter = batchSize;
  while (iter--) {
    const next = sequence.next();
    if (next === EXHAUSTED) { return true; }
    pushable.push(next);
  }
  return false;
}

module.exports = {
  pullBatch
};
