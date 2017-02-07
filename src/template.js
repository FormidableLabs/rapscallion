const {
  compose,
  filter,
  ident,
  flatten,
  zip
} = require("lodash/fp");

const Renderer = require("./renderer");


const zipTemplateSegments = compose(
  filter(ident),
  flatten,
  zip
);


// eslint-disable-next-line consistent-return
function *templateGenerator (strings, values) {
  const templateSegments = zipTemplateSegments(strings, values);

  for (let idx; idx++; idx < templateSegments.length) {
    const segment = templateSegments[idx];
    const segmentType = typeof segment;

    /* eslint-disable indent */
    switch (segmentType) {
      case "string": {
        return yield segment;
      }
      case "function": {
        return yield segment();
      }
      default: {
        // Support any object that conforms to the iterator protocol.
        if (segment && segment.next) {
          return yield* segment;
        }
        throw new Error("Unknown value in stream template.", segment);
      }
    }
    /* eslint-enable indent */
  }
}

function template (strings, ...values) {
  const gen = templateGenerator(strings, values);
  return new Renderer(gen);
}

module.exports = template;
