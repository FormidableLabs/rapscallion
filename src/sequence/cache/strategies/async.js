const { assign, omit } = require("lodash");

const { sequence: makeNewSequence, EXHAUSTED } = require("../../sequence");
const { SequenceCache, ForkedSequence } = require("../sequence-cache");


const intermediateCache = Object.create(null);


function getCachedSequenceFactory ({ get, set }) {
  /**
   * Constructs a function that accepts a cached value (either a real one, or
   * null), and returns a sequence.
   *
   * If there is no cached value, a new intermediate cache entry will be created
   * for the key.  Once the source sequence has been exhausted, the intermediate
   * cache entry will be converted to a permanent cache entry.
   *
   * If the is a cached value, the value is transformed into a sequence to be
   * consumed downstream.
   *
   * @param      {VDOM}        node              VDOM node to be rendered.
   * @param      {String}      cacheKey          Unique cache key.
   * @param      {Function}    sequenceFactory   Function that returns a sequence to
   *
   * @return     {Function}                      Function that returns a sequence.
   */
  const resolveToSequence = (node, cacheKey, sequenceFactory) => cachedValue => {
    if (cachedValue === null) {
      // A cache entry should be constructed.
      const _node = assign({}, node, {
        props: omit(node.props, ["cacheKey"])
      });

      const sequenceToCache = makeNewSequence();

      // Once the intermediate cache has been fully consumed and compressed, the
      // compressed buffer should be cached in Redis and the intermediate cache
      // entry deleted.
      const onCompress = sequenceCache => {
        set("cacheKey", sequenceCache.compressedBuffer).then(() => {
          intermediateCache[cacheKey] = null;
        });
      };

      sequenceFactory(sequenceToCache, _node);

      return intermediateCache[cacheKey] = new SequenceCache(sequenceToCache, onCompress);
    }

    // Convert the cached compressed buffer into a consumable sequence.
    let segmentIdx = 0;
    return new ForkedSequence(() => {
      return segmentIdx < cachedValue.length ?
        cachedValue[segmentIdx++] :
        EXHAUSTED;
    });
  };

  /**
   * Checks whether a node is cacheable.
   *
   * If it is not cachable, return the sequence that would've been created without
   * caching being involved.
   *
   * If the node _is_ cacheable, return one of:
   *
   *   - a sequence forked from a new intermediate cache entry,
   *   - a sequence forked from an in-progress intermediate cache entry, or
   *   - a sequence generated from the cached value corresponding with the
   *     cache key.
   *
   * @param      {Sequence}   sequence         The non-cached sequence.
   * @param      {VDOM}       node             VDOM node to render and/or cache.
   * @param      {Function}   sequenceFactory  Function that returns a sequence for the node.
   *
   * @return     {Sequence}    The non-cached or cached sequence.
   */
  return function getCachedSequence (sequence, node, sequenceFactory) {
    const cacheKey = node.props && node.props.cacheKey;

    // The node is not cacheable.
    if (!cacheKey) { return sequenceFactory(sequence, node); }

    // A cache entry is currently being constructed of this same cacheKey.
    const intermediateCacheEntry = intermediateCache[cacheKey];
    if (intermediateCacheEntry) { return intermediateCacheEntry.fork(); }

    // A cache entry should be fetched if present, or otherwise constructed.
    return get(cacheKey).then(resolveToSequence(node, cacheKey, sequenceFactory));
  };
}


module.exports = getCachedSequenceFactory;
