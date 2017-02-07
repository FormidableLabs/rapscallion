const { encode } = require("he");


const CAPITAL_CHAR = /([A-Z])/g;
const ENCODE_OPTS = {
  strict: true
};


const toDashCase = str => str.replace(CAPITAL_CHAR, char => `-${char.toLowerCase()}`);

const htmlStringEscape = str => encode(str, ENCODE_OPTS);

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

function *queueGeneration (generatorFn) {
  yield* generatorFn();
}


module.exports = {
  queueGeneration,
  toDashCase,
  htmlStringEscape,
  hasOwn
};
