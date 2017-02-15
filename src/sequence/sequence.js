/* eslint-disable */

const Promise = require("bluebird");


const EXHAUSTED = Symbol.for("EXHAUSTED");


/**
 * A base class to be used by all classes conforming to the Sequence-next protocol.
 */
class BaseSequence {}

/**
 * A lazy tree iterator, inspired by how programs are executed.
 * 
 * At any point in executing a program, two pieces of state will be tracked:
 *
 *   1. A stack, where each element is a piece of state corresponding to an invocation, and
 *   2. An iterator over statements in the invoked function, tied to its state.
 *   
 * When the iterator encounters another invocation, it pushes another piece of state onto the
 * stack and only resumes the original interator once the pushed iterator completes.
 * 
 * A Sequence is conceptually similar.  Event-generating functions are pushed onto a FIFO
 * queue, and are evaluated (in order) one at a time whenever its parent Sequence's `next`
 * method is invoked.  If a normal value is returned from one of those functions, that value
 * is returned from the `next` invocation.
 * 
 * However, if another Sequence is returned from an event-generating function, the current
 * sequence delegates its event-generation to the child sequence until the child's events
 * have been exhausted.  The parent will then continue evaluating its own event-generation
 * queue until _it_ has been exhausted.
 * 
 * Sequences are consumed by instantiating, pushing event-generators onto the queue, and
 * calling `next` until the `EXHAUSTED` symbol is returned.
 */
class Sequence extends BaseSequence {
  constructor () {
    super();
    this.delegate = null;
    this.index = 0;
    this.eventGenQueue = [];
  }

  /**
   * Push an event-generator function onto the queue, to be evaluated later.
   *
   * @param      {Function}  fn      Event-generator function.
   */
  emit (fn) {
    this.eventGenQueue.push(fn);
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
    if (this.delegate) { return this.nextFromDelegate(); }

    const nextFn = this.eventGenQueue[this.index++];
    if (!nextFn) { return EXHAUSTED; }

    const next = nextFn();

    return next instanceof Promise ?
      next.then(_next => this.getNextValue(_next)) :
      this.getNextValue(next);
  }

  /**
   * Return the next value from the sequence or its delegate.
   *
   * @param      {Any|EXHAUSTED}  next    The next value (unresolved).
   *
   * @return     {Any|EXHAUSTED}          The next value (resolved);
   */
  getNextValue (next) {
    if (next instanceof BaseSequence) {
      this.delegate = next;
      return this.nextFromDelegate();
    }

    if (!next) {
      return this.next();
    }

    return next;
  }

  /**
   * Return a value from this instance's delegate sequence.  If the delegate
   * has exhausted its supply of events, return the next value from this
   * instance's queue.
   *
   * @return     {Any|EXHAUSTED}  Any value, or the EXHAUSTED symbol.
   */
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
