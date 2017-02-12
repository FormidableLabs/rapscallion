function compress (buffer) {
  const compressedBuffer = [];
  let compressedSegment = "";

  for (let i = 0; i < buffer.length; i++) {
    const el = buffer[i];
    if (typeof el === "string") {
      compressedSegment += el;
      continue;
    }

    compressedBuffer.push(compressedSegment);
    compressedBuffer.push(el);
    compressedSegment = "";
  }

  if (compressedSegment.length) {
    compressedBuffer.push(compressedSegment);
  }

  return compressedBuffer;
}

module.exports = compress;
