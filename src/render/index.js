const traverse = require("./traverse");
const { getRootContext } = require("./context");
const { sequence } = require("../sequence");


function render (node, rootContext) {
  const seq = sequence();
  rootContext = rootContext || getRootContext();
  traverse(seq, node, rootContext);
  return seq;
}


module.exports = render;
