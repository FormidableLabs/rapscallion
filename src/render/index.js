const traverse = require("./traverse");
const { getRootContext } = require("./context");


function render (seq, node, rootContext) {
  rootContext = rootContext || getRootContext();
  traverse({
    seq,
    node,
    context: rootContext
  });
  return seq;
}


module.exports = render;
