/* global setImmediate */
const Promise = require("bluebird");

const { EXHAUSTED } = require("../sequence");
const {
  pullBatch,
  INCOMPLETE
} = require("./common");


const TAG_END = /\/?>/;
const COMMENT_START = /^<\!\-\-/;


// eslint-disable-next-line max-params
function asyncBatch (
  renderer,
  pushable,
  resolve
) {
  const result = pullBatch(renderer, pushable);
  if (result === INCOMPLETE) {
    setImmediate(asyncBatch, renderer, pushable, resolve);
  } else if (result === EXHAUSTED) {
    resolve();
  } else if (result instanceof Promise) {
    result.then(next => {
      pushable.push(next);
      setImmediate(asyncBatch, renderer, pushable, resolve);
    });
  }
}

/**
 * Consumes the provided sequence and returns a promise with the concatenation of all
 * sequence segments.
 *
 * @param      {Sequence}  sequence        Source sequence.
 * @param      {Integer}   batchSize       The number of HTML segments to render
 *                                         before passing control back to the event loop.
 * @param      {Boolean}   dataReactAttrs  Indicates whether data-react* attrs should be
 *                                         rendered.
 *
 * @return     {Promise}                   A promise resolving to the HTML string.
 */
function toPromise (renderer) {
  // this.sequence, this.batchSize, this.dataReactAttrs

  const buffer = {
    value: "",
    push (segment) { this.value += segment; }
  };

  return new Promise(resolve =>
    setImmediate(
      asyncBatch,
      renderer,
      buffer,
      resolve
    )
  ).then(() => {
    let html = buffer.value;

    if (renderer.dataReactAttrs && !COMMENT_START.test(html)) {
      const checksum = renderer.checksum();
      html = html.replace(TAG_END, ` data-react-checksum="${checksum}"$&`);
    }

    return html;
  });
}


module.exports = toPromise;
