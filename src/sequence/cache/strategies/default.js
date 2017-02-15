const { assign, omit } = require("lodash");

const { sequence: makeNewSequence } = require("../../sequence");
const { SequenceCache } = require("../sequence-cache");


const cache = Object.create(null);


/**
 * Checks whether a node is cacheable.
 *
 * If it is not cachable, return the sequence that would've been created without
 * caching being involved.
 *
 * If the node _is_ cacheable, return either a fork of a previously-cached
 * sequence (with the same key), or a new fork if an identical node was not
 * previously cached.
 *
 * @param      {Sequence}   sequence         The non-cached sequence.
 * @param      {VDOM}       node             VDOM node to render and/or cache.
 * @param      {Function}   sequenceFactory  Function that returns a sequence for the node.
 *
 * @return     {Sequence}    The non-cached or cached sequence.
 */
function getCachedSequence (sequence, node, sequenceFactory) {
  const cacheKey = node.props && node.props.cacheKey;
  if (!cacheKey) { return sequenceFactory(sequence, node); }

  let cacheEntry = cache[cacheKey];

  if (!cacheEntry) {
    const _node = assign({}, node, {
      props: omit(node.props, ["cacheKey"])
    });

    const sequenceToCache = makeNewSequence();
    sequenceFactory(sequenceToCache, _node);
    cacheEntry = cache[cacheKey] = new SequenceCache(sequenceToCache);
  }

  return cacheEntry.fork();
}


module.exports = () => getCachedSequence;
