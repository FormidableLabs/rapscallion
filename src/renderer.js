const { isInteger } = require("lodash");

const render = require("./render");
const toPromise = require("./consumers/promise");
const toNodeStream = require("./consumers/node-stream");


class Renderer {
  constructor (jsx) {
    this.gen = render(jsx);
    this.batchSize = 100;
    this.next = this.gen.next.bind(this.gen);
  }

  toPromise () {
    return toPromise(this.gen, this.batchSize);
  }

  toStream () {
    return toNodeStream(this.gen, this.batchSize);
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
