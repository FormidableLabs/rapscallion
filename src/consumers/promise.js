/* global setImmediate */
const Promise = require("bluebird");

const { EXHAUSTED } = require("../sequence");
const { pullBatch } = require("./common");


const TAG_END = /\/?>/;
const COMMENT_START = /^<\!\-\-/;


// eslint-disable-next-line max-params
function asyncBatch (
  renderer,
  pushable,
  resolve,
  reject
) {
  const pull = pullBatch(renderer, pushable);

  pull.then(result => {
    if (result === EXHAUSTED) {
      resolve();
    } else {
      setImmediate(
        asyncBatch,
        renderer,
        pushable,
        resolve,
        reject,
      );
    }
  }).catch(err => {
    reject(err);
  });
}

/**
 * Consumes the provided sequence and returns a promise with the concatenation of all
 * sequence segments.
 *
 * @param      {Renderer}     renderer     The Renderer from which to pull next-vals.
 *
 * @return     {Promise}                   A promise resolving to the HTML string.
 */
function toPromise (renderer) {
  // this.sequence, this.batchSize, this.dataReactAttrs
  const buffer = {
    value: [],
    push (segment) { this.value.push(segment); }
  };

  return new Promise((resolve, reject) =>
    setImmediate(
      asyncBatch,
      renderer,
      buffer,
      resolve,
      reject
    )
  )
  .then(() => Promise.all(buffer.value))
  .then(chunks => {
    let html = chunks
      .filter(chunk => typeof chunk === "string")
      .join("");

    if (renderer.dataReactAttrs && !COMMENT_START.test(html)) {
      const checksum = renderer.checksum();
      html = html.replace(TAG_END, ` data-react-checksum="${checksum}"$&`);
    }

    return html;
  });
}


module.exports = toPromise;
