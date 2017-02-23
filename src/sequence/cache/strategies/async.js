const { FrameCache } = require("../frame-cache");


function getCachedFrameFactory ({ get, set }) {
  const intermediateCache = Object.create(null);

  // eslint-disable-next-line max-params
  return function getCachedFrame (node, cacheKey, delegateFn, Sequence) {
    const cacheEntry = intermediateCache[cacheKey];
    if (cacheEntry) { return cacheEntry.fork(); }

    const createIntermediateEntry = () => {
      const onCompress = buffer => {
        set(cacheKey, buffer).then(() => {
          intermediateCache[cacheKey] = null;
        });
      };

      const seq = new Sequence();
      delegateFn(seq, node);

      const newCacheEntry = intermediateCache[cacheKey] = new FrameCache(onCompress, seq);
      return newCacheEntry.fork();
    };

    return get(cacheKey).then(segments => {
      if (!segments) { return createIntermediateEntry(); }

      return {
        patch: originalSequence => {
          segments.forEach(segment => originalSequence.emit(() => segment));
        }
      };
    });

  };
}

module.exports = getCachedFrameFactory;
