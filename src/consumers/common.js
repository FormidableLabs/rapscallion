const { EXHAUSTED } = require("../sequence");


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
