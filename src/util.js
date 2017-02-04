const most = require("most");
const { encode } = require("he");


const CAPITAL_CHAR = /([A-Z])/g;
const ENCODE_OPTS = {
  strict: true
};


const toDashCase = str => str.replace(CAPITAL_CHAR, char => `-${char.toLowerCase()}`);

const htmlStringEscape = str => encode(str, ENCODE_OPTS);

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const concatAll = streams =>
  streams.reduce((memo, stream) => memo.concat(stream), most.empty());


module.exports = {
  toDashCase,
  htmlStringEscape,
  hasOwn,
  concatAll
};
