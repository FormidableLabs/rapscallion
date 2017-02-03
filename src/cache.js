const most = require("most");
const { assign, omit } = require("lodash");


const cache = Object.create(null);


const compressCache = (cacheEntry) => {
  cacheEntry.buffer[0] = cacheEntry.buffer.join("");
  cacheEntry.buffer.length = 1;
};


function getCachedNodeStream (node, streamFactory) {
  const cacheKey = node.props && node.props.cacheKey;
  if (!cacheKey) {
    return streamFactory(node);
  }

  const _node = assign({}, node, {
    props: omit(node.props, ["cacheKey"])
  });

  const cacheEntry = cache[cacheKey];
  if (cacheEntry) {
    return most.concat(
      most.from(cacheEntry.buffer),
      cacheEntry.stream
    );
  } else {
    const buffer = [];
    const entry = { buffer };

    const stream = streamFactory(_node)
      .tap(segment => buffer.push(segment))
      .continueWith(() => {
        entry.stream = most.empty();
        compressCache(entry);
        return most.empty();
      })
      .multicast();
    entry.stream = stream;

    cache[cacheKey] = entry;
    return stream;
  }
}

module.exports = getCachedNodeStream;
