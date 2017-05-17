const { isInteger } = require("lodash");
const adler32 = require("adler-32");

const render = require("./render");
const { sequence } = require("./sequence");
const toPromise = require("./consumers/promise");
const toNodeStream = require("./consumers/node-stream");
const {
  REACT_EMPTY,
  REACT_ID,
  REACT_TEXT_START,
  REACT_TEXT_END
} = require("./symbols");


const REACT_ID_START = 1;


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
    this.reactIdIdx = REACT_ID_START;
    this._checksum = undefined;
  }

  _queueRootNode (seq) {
    render(seq || this.sequence, this.vdomNode);
  }

  _next () {
    let nextVal = this.sequence.next();

    if (nextVal === REACT_ID) {
      if (this.dataReactAttrs) {
        nextVal = this.reactIdIdx === REACT_ID_START ?
          ` data-reactroot="" data-reactid="${this.reactIdIdx}"` :
          ` data-reactid="${this.reactIdIdx}"`;
        this.reactIdIdx++;
      } else {
        return "";
      }
    } else if (nextVal === REACT_EMPTY) {
      if (this.dataReactAttrs) {
        nextVal = `<!-- react-empty: ${this.reactIdIdx} -->`;
        this.reactIdIdx++;
      } else {
        return "";
      }
    } else if (nextVal === REACT_TEXT_START) {
      if (this.dataReactAttrs) {
        nextVal = `<!-- react-text: ${this.reactIdIdx} -->`;
        this.reactIdIdx++;
      } else {
        return "";
      }
    } else if (nextVal === REACT_TEXT_END) {
      if (this.dataReactAttrs) {
        nextVal = "<!-- /react-text -->";
      } else {
        return "";
      }
    }


    this._checksum = adler32.str(nextVal, this._checksum);

    return nextVal;
  }

  toPromise () {
    this._queueRootNode();
    return toPromise(this);
  }

  toStream () {
    this._queueRootNode();
    return toNodeStream(this);
  }

  checksum () {
    if (!this._checksum) {
      throw new Error("checksum method must be invoked after rendering has completed.");
    }
    return this._checksum.toString();
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
