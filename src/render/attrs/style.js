const { hasOwn } = require("../util");
const { map } = require("lodash/fp");
const { isNumber } = require("lodash");
const isUnitlessNumber = require("./is-unitless-number");

const mapWithKey = map.convert({ cap: false });

const mapToParsedStyles = mapWithKey(parseStyle);

/**
 * Maps and transforms the object passed as the
 * style prop to a stringified style list.
 * @param {Object} styles style properties
 * @returns {String} parsed and stringified style
 */
function renderStyleAttribute (styles) {
  return mapToParsedStyles(styles).join("");
}

/**
 * Parses the style value and returns a stringified
 * @param {String} value style attribute parsedValue
 * @param {String} name style attribute name
 * @return {String} parsed style key/pair value
 */
function parseStyle (value, name) {
  const parsedValue = parseStyleValue(name, value);
  return `${name}:${parsedValue};`;
}

/**
 * Adapted from React core's dangerousStyleValue module.
 * @param {String} name style attribute name
 * @param {String} value style attribute value
 * @returns {String} parsed style value
 * @see https://github.com/facebook/react/blob/32f5b034ed229d048f76ae74e18d270edc801dbf/src/renderers/dom/shared/dangerousStyleValue.js
 */
function parseStyleValue (name, value) {
  // Use loose equality check to catch undefined as well.
  // eslint-disable-next-line eqeqeq
  if (value == null || typeof value === "boolean" || value === "") {
    return "";
  }
  // All numeric properties that are not registered as
  // unitless numbers will received a "px" suffix.
  if (
    isNumber(value) && value !== 0
    && !(hasOwn(isUnitlessNumber, name) && isUnitlessNumber[name])
  ) {
    return `${value}px`;
  }
  return `${value}`.trim();
}

module.exports = {
  renderStyleAttribute
};


