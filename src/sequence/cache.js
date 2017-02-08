const { assign, omit, values } = require("lodash");

const {
  BaseSequence,
  sequence: makeNewSequence,
  EXHAUSTED
} = require("./sequence");


const cache = Object.create(null);


class ForkedSequence extends BaseSequence {
  constructor (next) {
    super();
    this.next = next;
  }
}

class SequenceCache {
  constructor (source) {
    this.source = source;
    this.sourceCursor = 0;
    this.buffer = [];
    this.compressedBuffer = null;

    this.forks = 0;
    this.forkCursors = Object.create(null);
  }

  fork () {
    if (this.compressedBuffer) {
      return this.forkCompressed();
    }

    const forkIdx = this.forks++;
    this.forkCursors[forkIdx] = 0;

    return new ForkedSequence(this.getNext.bind(this, forkIdx));
  }

  forkCompressed () {
    let sentCompressed = false;
    return new ForkedSequence(() => {
      if (sentCompressed) { return EXHAUSTED; }
      sentCompressed = true;
      return this.compressedBuffer;
    });
  }

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

  readyToCompress () {
    return values(this.forkCursors).reduce(
      (memo, cursor) => memo && cursor === this.sourceCursor,
      true
    );
  }

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
