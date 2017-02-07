const { assign, omit } = require("lodash");
const { values } = require("lodash");


const cache = Object.create(null);


class GeneratorCache {
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
    return {
      [Symbol.iterator]: () => ({ next: this.getNext.bind(this, forkIdx) })
    };
  }

  forkCompressed () {
    let sentCompressed = false;
    return {
      [Symbol.iterator]: () => ({
        next: () => sentCompressed ?
          { value: null, done: true } :
          (sentCompressed = true, { value: this.compressedBuffer, done: false })
      })
    };
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

    if (next.done) { this.compress(); }

    return next;
  }

  compress () {
    const readyToCompress = values(this.forkCursors).reduce(
      (memo, cursor) => memo && cursor === this.sourceCursor,
      true
    );

    if (readyToCompress) {
      this.compressedBuffer = this.buffer.map(event => event.value).join("");
      this.buffer = null;
      this.source = null;
      this.sourceCursor = null;
      this.forks = null;
      this.forkCursors = null;
    }
  }
}


function getCachedGenerator (node, generatorFactory) {
  const cacheKey = node.props && node.props.cacheKey;
  if (!cacheKey) {
    return generatorFactory(node);
  }

  let cacheEntry = cache[cacheKey];

  if (!cacheEntry) {
    const _node = assign({}, node, {
      props: omit(node.props, ["cacheKey"])
    });

    cacheEntry = cache[cacheKey] = new GeneratorCache(generatorFactory(_node));
  }

  return cacheEntry.fork();
}

module.exports = getCachedGenerator;
