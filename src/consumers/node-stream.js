const Promise = require("bluebird");
const { Readable } = require("stream");

const { EXHAUSTED } = require("../sequence");
const { pullBatch } = require("./common");


/**
 * Consumes the provided sequence and pushes onto a readable Node stream.
 *
 * @param      {Renderer}  renderer        The Renderer from which to pull next-vals.
 *
 * @return     {Readable}                  A readable Node stream.
 */
function toNodeStream (renderer) {
  let sourceIsReady = true;

  const read = () => {
    // If source is not ready, defer any reads until the promise resolves.
    if (!sourceIsReady) { return; }

    const result = pullBatch(renderer, stream);

    if (result === EXHAUSTED) {
      stream.push(null);
    } else if (result instanceof Promise) {
      sourceIsReady = false;
      result.then(next => {
        sourceIsReady = true;
        stream.push(next);
        read();
      }).catch(err => {
        stream.emit("error", err);
      });
    }
  };

  const stream = new Readable({ read });

  return stream;
}

module.exports = toNodeStream;
