const { isInteger } = require("lodash");

const render = require("./render");
const toPromise = require("./consumers/promise");
const toNodeStream = require("./consumers/node-stream");


/**
 * A friendly wrapper around rendering operations.  The public API
 * is documented in the README.
 */
class Renderer {
  constructor (vdomNode, sequence) {
    this.sequence = sequence || render(vdomNode);
    this.batchSize = 100;
    this.dataReactAttrs = true;
    this.next = this.sequence.next.bind(this.sequence);
  }

  toPromise () {
    return toPromise(this.sequence, this.batchSize, this.dataReactAttrs);
  }

  toStream () {
    return toNodeStream(this.sequence, this.batchSize, this.dataReactAttrs);
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
