const { values, noop } = require("lodash");

const { EXHAUSTED, BaseSequence } = require("../sequence");
const compress = require("../compress");


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
  constructor (source, onCompress) {
    this.source = source;
    this.sourceCursor = 0;
    this.buffer = [];
    this.compressedBuffer = null;
    this.onCompress = onCompress || noop;

    this.forks = 0;
    this.forkCursors = Object.create(null);
  }

  /**
   * Return a new fork of the original source sequence.
   *
   * @return     {Sequence}    The forked sequence.
   */
  fork () {
    if (this.compressedBuffer) { return this.forkCompressed(); }

    const forkIdx = this.forks++;
    this.forkCursors[forkIdx] = 0;

    return new ForkedSequence(this.getNext.bind(this, forkIdx));
  }

  /**
   * Emit elements from the compressed buffer, followed by the EXHAUSTED symbol.
   *
   * @return     {Sequence}     The forked, compressed sequence.
   */
  forkCompressed () {
    let segmentIdx = 0;
    return new ForkedSequence(() => {
      return segmentIdx < this.compressedBuffer.length ?
        this.compressedBuffer[segmentIdx++] :
        EXHAUSTED;
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
   * Checks whether all forks have completed pulling from the original
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
   * Compress all adjacent string segments in the buffer into single elements,
   * and null everything out that could be garbage collected.  The compressedBuffer
   * will contain the minimalist cache-friendly buffer.
   *
   * @return     {undefined}   No return value.
   */
  compress () {
    // Cannot join strings to Symbol(EXHAUSTED).
    this.buffer.pop();
    this.compressedBuffer = compress(this.buffer);
    this.buffer = null;
    this.source = null;
    this.sourceCursor = null;
    this.forks = null;
    this.forkCursors = null;
    this.onCompress(this);
  }
}


module.exports = {
  SequenceCache,
  ForkedSequence
};
