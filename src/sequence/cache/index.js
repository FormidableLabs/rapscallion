const { isFunction } = require("lodash");

const defaultStrategy = require("./strategies/default");
const asyncStrategy = require("./strategies/async");


let cacheStrategy = defaultStrategy();

// eslint-disable-next-line max-params
const getFrameCache = (node, cacheKey, delegateFn, Sequence) => {
  return cacheStrategy(node, cacheKey, delegateFn, Sequence);
};


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
  getFrameCache,
  setCacheStrategy,
  useDefaultCacheStrategy
};
