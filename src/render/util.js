const { encode } = require("he");
const { kebabCase } = require("lodash");


const ENCODE_OPTS = { strict: true };


const htmlStringEscape = str => encode(str, ENCODE_OPTS);
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
/**
 * Takes a camelCase string and returns a hyphenated version. Adapted
 * from the hypenateStyleName module available in the fbjs repo, used by React.
 * In addition to hyphenating the name it also replaces the "ms" prefix with
 * "-ms-" as recommended by Modernizr
 * @param {String} string style attribute name
 * @returns {String} hypenate style attribute name
 * @see https://modernizr.com/docs/#prefixed
 * @see https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/core/hyphenateStyleName.js
 */
const hypenateStyleName = (string) => kebabCase(string).replace(/^ms-/, "-ms-");

module.exports = {
  htmlStringEscape,
  hasOwn,
  hypenateStyleName
};
