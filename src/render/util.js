const { encode } = require("he");


const ENCODE_OPTS = { strict: true };


const htmlStringEscape = str => encode(str, ENCODE_OPTS);
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);


module.exports = {
  htmlStringEscape,
  hasOwn
};
