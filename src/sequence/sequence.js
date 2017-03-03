const { assign, omit } = require("lodash");
const Promise = require("bluebird");

const { EXHAUSTED } = require("./common");
const { getFrameCache } = require("./cache");


class Sequence {
  constructor () {
    this.stack = [];

    this.next = this.next.bind(this);

    // Frame-specific state:
    this.eventGenQueue = [];
    this.delegates = Object.create(null);
    this.cursor = 0;
  }

  pushFrame (delegate) {
    // Save state attached to parent frame.
    this.stack.push({
      eventGenQueue: this.eventGenQueue,
      delegates: this.delegates,
      cursor: this.cursor
    });

    // Initialize the new frame.
    this.eventGenQueue = [];
    this.delegates = Object.create(null);
    this.cursor = 0;

    // Let the delegate do its thing...
    delegate();
  }

  popFrame () {
    const parentFrame = this.stack.pop();
    if (parentFrame) {
      const { eventGenQueue, delegates, cursor } = parentFrame;
      this.eventGenQueue = eventGenQueue;
      this.delegates = delegates;
      this.cursor = cursor;

      return this.next();
    }
    return null;
  }

  emit (fn) {
    this.eventGenQueue.push(fn);
  }

  delegate (delegateFn) {
    this.delegates[this.eventGenQueue.length] = true;
    this.eventGenQueue.push(delegateFn);
  }

  delegateCached (node, delegateFn) {
    const cacheKey =
      node.props && node.props.cacheKey ||
      node.attrObj && node.attrObj.cacheKey;

    if (!cacheKey) {
      this.delegate(() => delegateFn(this, node));
      return;
    }

    this.delegates[this.eventGenQueue.length] = true;

    const _node = assign({}, node, {
      props: omit(node.props, ["cacheKey"])
    });

    const frameIterator = getFrameCache(_node, cacheKey, delegateFn, Sequence);

    // The callback will be invoked by `pushFrame`, followed by a call to `next`..
    this.eventGenQueue.push(() => {
      return frameIterator instanceof Promise ?
        frameIterator.then(_frameIterator => _frameIterator.patch(this)) :
        frameIterator.patch(this);
    });
  }

  /**
   * Return a value from this instance's event queue.  If the instance
   * is currently delegating its event generation, return the next
   * value from the delegate.  If the event-generator returns a new
   * Sequence, delegate event-generation to that sequence until it has
   * been exhausted.
   *
   * @return     {Any|EXHAUSTED}  Any value, or the EXHAUSTED symbol.
   */
  next () {
    const nextIsDelegate = this.delegates[this.cursor];
    const nextFn = this.eventGenQueue[this.cursor++];
    if (!nextFn) { return this.popFrame() || EXHAUSTED; }

    if (nextIsDelegate) {
      this.pushFrame(nextFn);
      return this.next();
    }

    return nextFn();
  }
}

module.exports = {
  Sequence,
  sequence: () => new Sequence()
};
