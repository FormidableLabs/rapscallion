const { Readable } = require("stream");


function toNodeStream (mostStream) {
  const s = new Readable();
  const push = s.push.bind(s);

  mostStream
    .observe(push)
    .then(() => push(null));

  return s;
}


module.exports = toNodeStream;
