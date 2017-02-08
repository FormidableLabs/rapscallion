const { Readable } = require("stream");

const { pullBatch } = require("./common");


function toNodeStream (sequence, batchSize) {
  return new Readable({
    read () {
      const isLast = pullBatch(sequence, batchSize, this);
      if (isLast) { this.push(null); }
    }
  });
}

module.exports = toNodeStream;
