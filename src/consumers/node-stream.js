const Promise = require("bluebird");
const { Readable } = require("stream");

const { EXHAUSTED } = require("../sequence");
const { pullBatch, getReactIdPushable, getChecksumWrapper } = require("./common");


/**
 * Consumes the provided sequence and pushes onto a readable Node stream.
 *
 * @param      {Sequence}  sequence        Source sequence.
 * @param      {Integer}   batchSize       The number of HTML segments to render
 *                                         before passing control back to the event loop.
 * @param      {Boolean}   dataReactAttrs  Indicates whether data-react* attrs should be
 *                                         rendered.
 *
 * @return     {Readable}                  A readable Node stream.
 */
function toNodeStream (sequence, batchSize, dataReactAttrs) {
  let sourceIsReady = true;

  const read = () => {
    // If source is not ready, defer any reads until the promise resolves.
    if (!sourceIsReady) { return; }

    const result = pullBatch(sequence, batchSize, reactIdPushable);

    if (result === EXHAUSTED) {
      stream.push(null);
    } else if (result instanceof Promise) {
      sourceIsReady = false;
      result.then(next => {
        sourceIsReady = true;
        reactIdPushable.push(next);
        read();
      });
    }
  };

  const stream = new Readable({ read });

  const checksumWrapper = getChecksumWrapper(stream);
  const reactIdPushable = getReactIdPushable(checksumWrapper, 1, dataReactAttrs);

  stream.checksum = checksumWrapper.checksum;
  return stream;
}

module.exports = toNodeStream;
