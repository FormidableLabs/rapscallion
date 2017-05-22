const { isFunction } = require("lodash/fp");

const { hasOwn } = require("../util");
const htmlStringEscape = require("../escape-html");
const transformAttrKey = require("./transform-attr-key");
const { renderStyleAttribute } = require("./style");

const attrsNotToRender = {
  children: true,
  dangerouslySetInnerHTML: true
};

const attrsWithExplicitBoolValue = [
  "aria-expanded",
  "aria-haspopup"
];

function shouldSkipRender (attrVal, isExplicitBoolValue) {
  return (
    attrVal === undefined ||
    attrVal === null ||
    (
      attrVal === false &&
      !(isExplicitBoolValue)
    ) ||
    isFunction(attrVal) ||
    (
      typeof attrVal === "object" &&
      !(Object.keys(attrVal).length > 0)
    )
  );
}

function isValuelessAttribute (attrVal, isExplicitBoolValue) {
  return (
    (
      attrVal === true &&
      !(isExplicitBoolValue)
    ) ||
    attrVal === undefined ||
    attrVal === null
  );
}

function isStyleAttribute (attrKey, attrVal) {
  return attrKey === "style" && typeof attrVal === "object";
}

/**
 * Render an object of key/value pairs into their HTML attribute equivalent.
 *
 * @param      {Object}  attrs   Attributes in object form.
 *
 * @return     {String}          Generated HTML attribute output.
 */
function renderAttrs (attrs) {
  const attrString = [];

  for (let attrKey in attrs) {
    if (
      hasOwn(attrs, attrKey) &&
      !attrsNotToRender[attrKey]
    ) {
      let attrVal = attrs[attrKey];
      const isExplicitBoolValue = attrsWithExplicitBoolValue.includes(attrKey);

      if (shouldSkipRender(attrVal, isExplicitBoolValue)) {
        continue;
      }

      attrKey = transformAttrKey(attrKey);

      if (isValuelessAttribute(attrVal, isExplicitBoolValue)) {
        attrVal = "";
      } else if (isStyleAttribute(attrKey, attrVal)) {
        attrVal = `="${renderStyleAttribute(attrVal)}"`;
      } else if (typeof attrVal === "string") {
        attrVal = `="${htmlStringEscape(attrVal)}"`;
      } else {
        attrVal = `="${attrVal}"`;
      }

      attrString.push(` ${attrKey}${attrVal}`);
    }
  }

  return attrString.join("");
}

module.exports = renderAttrs;
