/* eslint-disable */

const EXHAUSTED = Symbol.for("EXHAUSTED");


class BaseSequence {}


class Sequence extends BaseSequence {
  constructor () {
    super();
    this.delegate = null;
    this.index = 0;
    this.fns = [];
  }

  emit (fn) {
    this.fns.push(fn);
  }

  next () {
    if (this.delegate) { return this.nextFromDelegate(); }

    const nextFn = this.fns[this.index++];
    if (!nextFn) { return EXHAUSTED; }

    const next = nextFn();

    if (next instanceof BaseSequence) {
      this.delegate = next;
      return this.nextFromDelegate();
    }

    if (next === null) {
      return this.next();
    }

    return next;
  }

  nextFromDelegate () {
    const delegatedNext = this.delegate.next();

    if (delegatedNext === EXHAUSTED) {
      this.delegate = null
      return this.next();
    }

    return delegatedNext;
  }
}

module.exports = {
  BaseSequence,
  Sequence,
  sequence: () => new Sequence(),
  EXHAUSTED
};
