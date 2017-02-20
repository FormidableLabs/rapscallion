const {
  compose,
  filter,
  ident,
  flatten,
  zip
} = require("lodash/fp");

const render = require("./render");
const Renderer = require("./renderer");


const interlaceTemplateSegments = compose(
  filter(ident),
  flatten,
  zip
);

function getSequenceEvent (seq, segment) {
  const segmentType = typeof segment;

  if (segmentType === "string") {
    seq.emit(() => segment);
  } else if (segmentType === "object" && typeof segment.type === "function") {
    render(seq, segment);
  } else if (segmentType === "function") {
    seq.delegate(() => getSequenceEvent(seq, segment()));
  } else if (segment instanceof Renderer) {
    segment._render(seq);
  } else {
    throw new Error(`Unknown value in template of type ${typeof segment}: ${segment}`);
  }
}

function template (strings, ...values) {
  const templateSegments = interlaceTemplateSegments(strings, values);
  const renderer = new Renderer();
  renderer._render = function (seq) {
    seq = seq || this.sequence;
    templateSegments.forEach(segment => getSequenceEvent(seq, segment));
  };
  return renderer;
}

module.exports = template;
