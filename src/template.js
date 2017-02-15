const {
  compose,
  filter,
  ident,
  flatten,
  zip
} = require("lodash/fp");

const { sequence, BaseSequence } = require("./sequence");
const Renderer = require("./renderer");


const interlaceTemplateSegments = compose(
  filter(ident),
  flatten,
  zip
);

function getSequenceEvent (segment) {
  const segmentType = typeof segment;

  if (segmentType === "string") { return segment; }
  if (segmentType === "function") { return segment(); }
  if (segment instanceof BaseSequence) { return segment; }
  if (segment instanceof Renderer) { return segment.sequence; }

  throw new Error("Unknown value in stream template.", segment);
}

function template (strings, ...values) {
  const seq = sequence();
  const templateSegments = interlaceTemplateSegments(strings, values);
  templateSegments.forEach(segment => seq.emit(() => getSequenceEvent(segment)));
  return new Renderer(null, seq);
}

module.exports = template;
