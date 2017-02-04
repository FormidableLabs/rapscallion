const { Stream, PropagateTask } = require("most");
const dispose = require("most/lib/disposable/dispose");


class Batch {
  constructor (afterEvery, source) {
    this.afterEvery = afterEvery;
    this.source = source;
  }

  run (sink, scheduler) {
    const delaySink = new Sink(this.afterEvery, sink, scheduler);
    return dispose.all([ delaySink, this.source.run(delaySink, scheduler) ]);
  }
}

class Sink {
  constructor (afterEvery, sink, scheduler) {
    this.afterEvery = afterEvery;
    this.sink = sink;
    this.scheduler = scheduler;
    this._iterator = 0;
  }

  shouldWait () {
    if (this._iterator++ === this.afterEvery) {
      this._iterator = 0;
      return true;
    }
    return false;
  }

  dispose () {
    this.scheduler.cancelAll(task => task.sink = this.sink);
  }

  event (t, x) {
    // eslint-disable-next-line no-unused-expressions
    this.shouldWait() ?
      this.scheduler.delay(1, PropagateTask.event(x, this.sink)) :
      this.scheduler.asap(PropagateTask.event(x, this.sink));
  }

  end (t, x) {
    this.scheduler.delay(1, PropagateTask.end(x, this.sink));
  }

  error (t, e) {
    return this.sink.error(t, e);
  }
}


module.exports = afterEvery => stream => new Stream(new Batch(afterEvery, stream.source));
