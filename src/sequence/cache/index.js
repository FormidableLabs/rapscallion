const { isFunction } = require("lodash");

const defaultStrategy = require("./strategies/default");
const asyncStrategy = require("./strategies/async");


let cacheStrategy = defaultStrategy();


function getCachedSequence (sequence, node, sequenceFactory) {
  return cacheStrategy(sequence, node, sequenceFactory);
}

function setCacheStrategy (opts) {
  if (!isFunction(opts && opts.get) || !isFunction(opts && opts.set)) {
    throw new Error("Async cache strategy must be provided `get` and `set` options.");
  }
  cacheStrategy = asyncStrategy(opts);
}

function useDefaultCacheStrategy () {
  cacheStrategy = defaultStrategy();
}


module.exports = {
  getCachedSequence,
  setCacheStrategy,
  useDefaultCacheStrategy
};
