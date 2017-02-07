function pullBatch (gen, batchSize, pushable) {
  let iter = batchSize;
  while (iter--) {
    const next = gen.next();
    if (next.done) { return true; }
    pushable.push(next.value);
  }
  return false;
}

module.exports = {
  pullBatch
};
