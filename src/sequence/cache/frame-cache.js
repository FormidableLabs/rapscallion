const { EXHAUSTED } = require("../common");

const compress = require("../compress");


class FrameCache {
  constructor (onComplete, seq) {
    this.onComplete = onComplete;
    this.buffer = [];
    this.seq = seq;
  }

  fork () {
    return new FrameCacheIterator(this, this.getNextFn());
  }

  compress () {
    // compress the buffer (all sub-promises should be filtered out, so its serializable)
    // invoke the callback to set the value onCompress
    this.onComplete(compress(this.buffer));
  }

  getNextFn () {
    // Close over reference so that FrameCacheIterators can refer to the buffer after
    // it has been compressed, but still allow it to be garbage collected once all
    // consumers have finished with it.
    const buffer = this.buffer;

    const getNextVal = val => {
      const nextVal = val || this.seq.next();

      if (nextVal instanceof Promise) {
        return nextVal.then(getNextVal);
      }
      buffer.push(nextVal);
      // Once the FrameCache's sequence has been exhausted, it is safe to compress
      // the buffer and set the value via the specified cache strategy.  Other
      // iterators will still have access to the uncompressed buffer via a closure.
      if (nextVal === EXHAUSTED) { this.compress(); }

      return nextVal;
    };

    return idx => idx === buffer.length ?
      getNextVal() :
      this.buffer[idx];
  }
}

class FrameCacheIterator {
  constructor (frameCache, nextFn) {
    this.idx = 0;
    this.next = () => nextFn(this.idx++);
  }

  // Patch the Sequence's `next` method to iterate over the FrameCache's sequence.
  // Once all sequence events have been consumed, restore the original method.
  patch (seq) {
    const oldNext = seq.next;

    seq.next = () => {
      const nextVal = this.next();

      if (nextVal === EXHAUSTED) {
        seq.next = oldNext;
        return seq.popFrame() || EXHAUSTED;
      }

      return nextVal;
    };
  }
}

module.exports = {
  FrameCache,
  FrameCacheIterator
};
