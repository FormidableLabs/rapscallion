const { encode } = require("he");


const CAPITAL_CHAR = /([A-Z])/g;
const ENCODE_OPTS = {
  strict: true
};


const toDashCase = str => str.replace(CAPITAL_CHAR, char => `-${char.toLowerCase()}`);

const htmlStringEscape = str => encode(str, ENCODE_OPTS);


module.exports = {
  toDashCase,
  htmlStringEscape
};
