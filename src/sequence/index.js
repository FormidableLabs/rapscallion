const {
  BaseSequence,
  Sequence,
  sequence,
  EXHAUSTED
} = require("./sequence");

const {
  getCachedSequence,
  setCacheStrategy
} = require("./cache");

module.exports = {
  BaseSequence,
  Sequence,
  sequence,
  EXHAUSTED,
  getCachedSequence,
  setCacheStrategy
};
