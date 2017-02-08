const { Readable } = require("stream");

const { pullBatch } = require("./common");


/**
 * Consumes the provided sequence and pushes onto a readable Node stream.
 *
 * @param      {Sequence}    sequence   Source sequence.
 * @param      {Integer}     batchSize  The number of HTML segments to render
 *                                      before passing control back to the event loop.
 *
 * @return     {Readable}               A readable Node stream.
 */
function toNodeStream (sequence, batchSize) {
  return new Readable({
    read () {
      const isLast = pullBatch(sequence, batchSize, this);
      if (isLast) { this.push(null); }
    }
  });
}

module.exports = toNodeStream;
