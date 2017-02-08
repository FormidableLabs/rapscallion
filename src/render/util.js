const { encode } = require("he");


const CAPITAL_CHAR = /([A-Z])/g;
const ENCODE_OPTS = {
  strict: true
};


const toDashCase = str => {
  if (str === "className") { return "class"; }
  return str.replace(CAPITAL_CHAR, char => `-${char.toLowerCase()}`);
};

const htmlStringEscape = str => encode(str, ENCODE_OPTS);

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);


module.exports = {
  toDashCase,
  htmlStringEscape,
  hasOwn
};
