const { Readable } = require("stream");

const { pullBatch } = require("./common");


function toNodeStream (gen, batchSize) {
  return new Readable({
    read () {
      const isLast = pullBatch(gen, batchSize, this);
      if (isLast) { this.push(null); }
    }
  });
}

module.exports = toNodeStream;
