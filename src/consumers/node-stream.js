const { Readable } = require("stream");

const { EXHAUSTED } = require("../sequence");
const { pullBatch, INCOMPLETE } = require("./common");


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
    if (!sourceIsReady) { return false; }

    sourceIsReady = false;
    const pull = pullBatch(renderer, stream);

    return pull.then(result => {
      sourceIsReady = true;
      if (result === EXHAUSTED) {
        return stream.push(null);
      } else {
        if (result !== INCOMPLETE) {
          stream.push(result);
        }
        return read();
      }
    }).catch(err => {
      return stream.emit("error", err);
    });
  };

  const stream = new Readable({ read });

  return stream;
}

module.exports = toNodeStream;
