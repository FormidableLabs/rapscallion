const { adler32 } = require("./util");

const TAG_END = /\/?>/;
const COMMENT_START = /^<\!\-\-/;

module.exports = function addChecksumToMarkup (markup) {
  const checksum = adler32(markup);
  if (COMMENT_START.test(markup)) {
    return markup;
  } else {
    return markup.replace(
      TAG_END,
      ` data-react-checksum="${checksum}"$&`
    );
  }
};
