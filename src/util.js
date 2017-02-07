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

/* eslint-disable no-magic-numbers, no-bitwise, max-statements */
const adler32 = data => {
  const MOD = 65521;
  let a = 1;
  let b = 0;
  let i = 0;
  const l = data.length;
  // eslint-disable-next-line
  let m = l & ~0x3;
  while (i < m) {
    const n = Math.min(i + 4096, m);
    for (; i < n; i += 4) {
      b += (
        (a += data.charCodeAt(i)) +
        (a += data.charCodeAt(i + 1)) +
        (a += data.charCodeAt(i + 2)) +
        (a += data.charCodeAt(i + 3))
      );
    }
    a %= MOD;
    b %= MOD;
  }
  for (; i < l; i++) {
    b += (a += data.charCodeAt(i));
  }
  a %= MOD;
  b %= MOD;
  return a | (b << 16);
};
/* eslint-enable d */


module.exports = {
  toDashCase,
  htmlStringEscape,
  hasOwn,
  concatAll,
  adler32
};
