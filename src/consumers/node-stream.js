const { Readable } = require("stream");

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
  const stream = new Readable({
    read () {
      const isLast = pullBatch(sequence, batchSize, reactIdPushable);
      if (isLast) { this.push(null); }
    }
  });

  const checksumWrapper = getChecksumWrapper(stream);
  const reactIdPushable = getReactIdPushable(checksumWrapper, 1, dataReactAttrs);

  stream.checksum = checksumWrapper.checksum;
  return stream;
}

module.exports = toNodeStream;
