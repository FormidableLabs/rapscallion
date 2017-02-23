const { FrameCache } = require("../frame-cache");

const cache = Object.create(null);


// eslint-disable-next-line max-params
function getCachedFrame (node, cacheKey, delegateFn, Sequence) {
  let cacheEntry = cache[cacheKey];

  if (cacheEntry && cacheEntry.compressed) {
    // Once a cache entry has been completely evaluated and compressed, it is no longer
    // necessary to patch the original sequence.  Instead, simply emit the cached
    // segments onto the original sequence.
    return {
      patch: originalSequence => {
        cacheEntry.segments.forEach(segment => originalSequence.emit(() => segment));
      }
    };
  }

  if (!cacheEntry) {
    const onCompress = buffer => {
      cache[cacheKey] = {
        compressed: true,
        // Remove the EXHAUSTED symbol from the end;
        segments: buffer.slice(0, -1)
      };
    };

    const seq = new Sequence();
    delegateFn(seq, node);

    cacheEntry = cache[cacheKey] = new FrameCache(onCompress, seq);
  }

  return cacheEntry.fork();
}

module.exports = () => getCachedFrame;
