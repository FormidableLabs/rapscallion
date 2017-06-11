const MOD = 65521;

/* eslint-disable max-statements, no-bitwise, no-magic-numbers */

function adler32 (data, seed) {
  let a = 1;
  let b = 0;
  let i = 0;
  const l = data.length;
  const m = l & ~0x3;

  if (typeof seed === "number") {
    a = seed & 0xFFFF;
    b = seed >>> 16;
  }

  while (i < m) {
    const n = Math.min(i + 4096, m);
    for (; i < n; i += 4) {
      b += (a += data.charCodeAt(i)) +
        (a += data.charCodeAt(i + 1)) +
        (a += data.charCodeAt(i + 2)) +
        (a += data.charCodeAt(i + 3));
    }
    a %= MOD;
    b %= MOD;
  }
  for (; i < l; i++) {
    b += a += data.charCodeAt(i);
  }
  a %= MOD;
  b %= MOD;
  return a | b << 16;
}

module.exports = adler32;
