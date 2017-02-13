const { isFunction } = require("lodash/fp");
const { hasOwn } = require("../util");

const transformAttrKey = require("./transform-attr-key");
const { renderStyleAttribute } = require("./style");

const attrsNotToRender = {
  children: true,
  dangerouslySetInnerHTML: true
};

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

      if (!attrVal || isFunction(attrVal)) { continue; }

      attrKey = transformAttrKey(attrKey);

      if (attrVal === true) {
        attrVal = "";
      } else if (attrKey === "style" && typeof attrVal === "object") {
        attrVal = `="${renderStyleAttribute(attrVal)}"`;
      } else {
        attrVal = `="${attrVal}"`;
      }

      attrString.push(` ${attrKey}${attrVal}`);
    }
  }

  return attrString.join("");
}

module.exports = renderAttrs;
