const defaultStrategy = require("./strategies/default");


let cacheStrategy = defaultStrategy;


function getCachedSequence (sequence, node, sequenceFactory) {
  return cacheStrategy(sequence, node, sequenceFactory);
}

function setCacheStrategy (_cacheStrategy) {
  cacheStrategy = _cacheStrategy;
}


module.exports = {
  getCachedSequence,
  setCacheStrategy
};
