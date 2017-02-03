const { Readable } = require("stream");


function toNodeStream (mostStream) {
  // TODO: Determine how to handle backpressure.
  //       https://github.com/divmain/rapscallion/issues/7
  const nodeStream = new Readable({ read: () => {} });
  const push = nodeStream.push.bind(nodeStream);

  mostStream
    .observe(push)
    .then(() => push(null));

  return nodeStream;
}


module.exports = toNodeStream;
