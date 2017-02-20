const { isInteger } = require("lodash");

const render = require("./render");
const { sequence } = require("./sequence");
const toPromise = require("./consumers/promise");
const toNodeStream = require("./consumers/node-stream");


/**
 * A friendly wrapper around rendering operations.  The public API
 * is documented in the README.
 */
class Renderer {
  constructor (vdomNode, seq) {
    this.sequence = seq || sequence();
    this.vdomNode = vdomNode;

    this.batchSize = 100;
    this.dataReactAttrs = true;
    this._stream = null;
  }

  _render (seq) {
    render(seq || this.sequence, this.vdomNode);
  }

  toPromise () {
    this._render();
    return toPromise(this.sequence, this.batchSize, this.dataReactAttrs);
  }

  toStream () {
    this._render();
    return this._stream = toNodeStream(this.sequence, this.batchSize, this.dataReactAttrs);
  }

  checksum () {
    if (!this._stream) {
      throw new Error(
        "Renderer#checksum can only be invoked for a renderer converted to node stream."
      );
    }
    return this._stream.checksum();
  }

  includeDataReactAttrs (yesNo) {
    this.dataReactAttrs = yesNo;
    return this;
  }

  tuneAsynchronicity (batchSize) {
    if (!isInteger(batchSize) || batchSize < 1) {
      throw new RangeError("Asynchronicity must be an integer greater than or equal to 1.");
    }
    this.batchSize = batchSize;
    return this;
  }
}

module.exports = Renderer;
