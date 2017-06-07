const { hasOwn } = require("../util");
const { map } = require("lodash/fp");
const { isNumber, omitBy } = require("lodash");
const { hyphenateStyleName } = require("../util");
const isUnitlessNumber = require("./is-unitless-number");

const mapWithKey = map.convert({ cap: false });

const mapToParsedStyles = mapWithKey((value, name) => (
  `${hyphenateStyleName(name)}:${parseStyleValue(name, value)};`
));

/**
 * Maps and transforms the object passed as the
 * style prop to a stringified style list.
 * @param {Object} styles style properties
 * @returns {String} parsed and stringified style
 */
function renderStyleAttribute (styles) {
  return mapToParsedStyles(omitBy(styles, value => {
    return value === null || value === undefined;
  })).join("");
}

/**
 * Adapted from React core's dangerousStyleValue module.
 * @param {String} name style attribute name
 * @param {String} value style attribute value
 * @returns {String} parsed style value
 * @see https://github.com/facebook/react/blob/master/src/renderers/dom/shared/dangerousStyleValue.js
 */
function parseStyleValue (name, value) {
  if (typeof value === "boolean" || value === "") {
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


