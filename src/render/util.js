const { encode } = require("he");
const { kebabCase } = require("lodash");


const ENCODE_OPTS = { strict: true };


const htmlStringEscape = str => encode(str, ENCODE_OPTS);
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
/**
 * Takes a camelCase string and returns a hyphenated version. Adapted
 * from the hyphenateStyleName module available in the fbjs repo, used by React.
 * In addition to hyphenating the name it also replaces the "ms" prefix with
 * "-ms-" as recommended by Modernizr
 * @param {String} string style attribute name
 * @returns {String} hyphenate style attribute name
 * @see https://modernizr.com/docs/#prefixed
 * @see https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/hyphenateStyleName.js
 */
const hyphenateStyleName = (string) => kebabCase(string).replace(/^ms-/, "-ms-");

module.exports = {
  htmlStringEscape,
  hasOwn,
  hyphenateStyleName
};
