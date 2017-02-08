/* global setImmediate */
const { pullBatch } = require("./common");


// eslint-disable-next-line max-params
function asyncBatch (gen, batchSize, arrayBuffer, resolve) {
  const isLast = pullBatch(gen, batchSize, arrayBuffer);
  if (isLast) {
    resolve(arrayBuffer.join(""));
  } else {
    setImmediate(asyncBatch, gen, batchSize, arrayBuffer, resolve);
  }
}

function toPromise (gen, batchSize) {
  const arrayBuffer = [];
  return new Promise(resolve =>
    setImmediate(asyncBatch, gen, batchSize, arrayBuffer, resolve)
  );
}


module.exports = toPromise;
