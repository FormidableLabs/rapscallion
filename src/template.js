const {
  compose,
  filter,
  ident,
  flatten,
  zip
} = require("lodash/fp");

const render = require("./render");
const Renderer = require("./renderer");
const { EXHAUSTED } = require("./sequence/common");


const interlaceTemplateSegments = compose(
  filter(ident),
  flatten,
  zip
);

function delegateToRenderer (seq, renderer) {
  const oldNext = seq.next;

  seq.delegate(() => {
    renderer._queueRootNode();

    // Patch the sequence's `next` method.
    seq.next = () => {
      const nextVal = renderer._next();

      if (nextVal === EXHAUSTED) {
        seq.next = oldNext;
        return seq.popFrame() || EXHAUSTED;
      }

      return nextVal;
    };
  });

}

function getSequenceEvent (seq, segment) {
  const segmentType = typeof segment;

  if (segmentType === "undefined") {
    seq.emit(() => "");
  } else if (segmentType === "string") {
    seq.emit(() => segment);
  } else if (segmentType === "object" && typeof segment.type === "function") {
    render(seq, segment);
  } else if (segmentType === "function") {
    seq.delegate(() => getSequenceEvent(seq, segment()));
  } else if (segment instanceof Renderer) {
    delegateToRenderer(seq, segment);
  } else {
    throw new Error(`Unknown value in template of type ${typeof segment}: ${segment}`);
  }
}

function template (strings, ...values) {
  const templateSegments = interlaceTemplateSegments(strings, values);
  const renderer = new Renderer();
  renderer._queueRootNode = function (seq) {
    seq = seq || this.sequence;
    templateSegments.forEach(segment => getSequenceEvent(seq, segment));
  };
  return renderer;
}

module.exports = template;
