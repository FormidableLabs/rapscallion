const { assign, omit, values } = require("lodash");

const {
  BaseSequence,
  sequence: makeNewSequence,
  EXHAUSTED
} = require("./sequence");


const cache = Object.create(null);


/**
 * An object that looks like a Sequence, but when asked for its next value,
 * returns a value from the `next` function it was originally provided.
 */
class ForkedSequence extends BaseSequence {
  constructor (next) {
    super();
    this.next = next;
  }
}

/**
 * An object that forks an input source sequence into multiple output sequences.
 */
class SequenceCache {
  constructor (source) {
    this.source = source;
    this.sourceCursor = 0;
    this.buffer = [];
    this.compressedBuffer = null;

    this.forks = 0;
    this.forkCursors = Object.create(null);
  }

  /**
   * Return a new fork of the original source sequence.
   *
   * @return     {Sequence}    The forked sequence.
   */
  fork () {
    if (this.compressedBuffer) {
      return this.forkCompressed();
    }

    const forkIdx = this.forks++;
    this.forkCursors[forkIdx] = 0;

    return new ForkedSequence(this.getNext.bind(this, forkIdx));
  }

  /**
   * Return a new sequence that consists of a reduction of the original source
   * sequence's events.  Only one event will be provided before the returned
   * sequence is exhausted.
   *
   * @return     {Sequence}     The forked, compressed sequence.
   */
  forkCompressed () {
    let sentCompressed = false;
    return new ForkedSequence(() => {
      if (sentCompressed) { return EXHAUSTED; }
      sentCompressed = true;
      return this.compressedBuffer;
    });
  }

  /**
   * Gets the next value for the indicated fork, specified by its index.  If
   * the fork is caught up with the source sequence, the source sequence will
   * be asked for its next value.  If the fork is not caught up, a cached
   * value will be returned.
   *
   * When the source sequence is exhausted, compress the cache into a single
   * event that can be replayed for any subsequently generated forks.
   *
   * @param      {Integer}        forkIdx    The index of the fork.
   *
   * @return     {Any|EXHAUSTED}              Any value, or the EXHAUSTED symbol.
   */
  getNext (forkIdx) {
    const forkCursor = this.forkCursors[forkIdx];
    let next;

    if (forkCursor === this.sourceCursor) {
      // Fork is ahead of all other forks.
      next = this.source.next();
      this.buffer.push(next);

      this.forkCursors[forkIdx] = forkCursor + 1;
      this.sourceCursor = this.sourceCursor + 1;
    } else {
      // This fork is lagging behind some other fork.
      const nextForkCursor = forkCursor + 1;
      this.forkCursors[forkIdx] = nextForkCursor;
      next = this.buffer[forkCursor];
    }

    if (next === EXHAUSTED && this.readyToCompress()) {
      this.compress();
    }

    return next;
  }

  /**
   * Checks whether all forks have completed pulling for the original
   * source.  If so, the cache is considered ready to compress.
   *
   * @return     {Boolean}     Whether the cache is ready to be compressed.
   */
  readyToCompress () {
    return values(this.forkCursors).reduce(
      (memo, cursor) => memo && cursor === this.sourceCursor,
      true
    );
  }

  /**
   * Transform the buffer array of events into a single value, and null
   * everything out that could be garbage collected.
   *
   * @return     {undefined}   No return value.
   */
  compress () {
    // Cannot join strings to Symbol(EXHAUSTED).
    this.buffer.pop();
    this.compressedBuffer = this.buffer.map(value => value).join("");
    this.buffer = null;
    this.source = null;
    this.sourceCursor = null;
    this.forks = null;
    this.forkCursors = null;
  }
}

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
  if (!cacheKey) {
    return sequenceFactory(sequence, node);
  }

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


module.exports = getCachedSequence;
