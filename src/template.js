const most = require("most");
const {
  compose,
  filter,
  ident,
  flatten,
  zip
} = require("lodash/fp");

const { concatAll } = require("./util");

const zipTemplateSegments = compose(
  filter(ident),
  flatten,
  zip
);;


function streamTemplate(strings, ...values) {
  const templateSegments = zipTemplateSegments(strings, values);

  return most.from(templateSegments)
    .concatMap(segment => {
      const segmentType = typeof segment;

      switch (segmentType) {
        case "string": return most.just(segment);
        case "function": return most.just(segment());
        default: {
          if (segment instanceof most.Stream) { return segment; }
          throw new Error("Unknown value in stream template.", segment);
        }
      }
    });
};

module.exports = streamTemplate;
