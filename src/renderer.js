const { isInteger } = require("lodash");

const toPromise = require("./consumers/promise");
const toNodeStream = require("./consumers/node-stream");


class Renderer {
  constructor (gen) {
    this.gen = gen;
    this.batchSize = 100;
    this.next = gen.next.bind(gen);
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
  }
}

module.exports = Renderer;
