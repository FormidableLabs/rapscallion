const adler32 = require("adler-32");
const Promise = require("bluebird");

const { EXHAUSTED } = require("../sequence");
const { REACT_ID } = require("../symbols");


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
function pullBatch (sequence, batchSize, pushable) {
  let iter = batchSize;
  while (iter--) {
    const next = sequence.next();
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


function getReactIdPushable (pushable, reactIdStart, dataReactAttrs) {
  let reactIdIdx = reactIdStart;
  return {
    push: el => {
      if (el === REACT_ID) {
        if (!dataReactAttrs) { return; }
        if (reactIdIdx === reactIdStart) { pushable.push(" data-reactroot=\"\""); }
        pushable.push(` data-reactid="${reactIdIdx}"`);
        reactIdIdx++;
      } else {
        pushable.push(el);
      }
    }
  };
}

function getChecksumWrapper (pushable) {
  let checksum;
  return {
    push: data => {
      checksum = adler32.str(data, checksum);
      pushable.push(data);
    },
    checksum: () => checksum
  };
}


module.exports = {
  pullBatch,
  getReactIdPushable,
  getChecksumWrapper,
  INCOMPLETE
};
