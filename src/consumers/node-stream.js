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

    sourceIsReady = false;
    const pull = pullBatch(renderer, stream);

    pull.then(result => {
      sourceIsReady = true;
      if (result === EXHAUSTED) {
        stream.push(null);
      } else {
        stream.push(result);
        read();
      }
    }).catch(err => {
      stream.emit("error", err);
    });
  };

  const stream = new Readable({ read });

  return stream;
}

module.exports = toNodeStream;
