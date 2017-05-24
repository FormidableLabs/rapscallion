const { renderStyleAttribute } = require("./style");

const DOMProperty = require("react-dom/lib/DOMProperty");

function isStyleAttribute (attrKey, attrVal) {
  return attrKey === "style" && typeof attrVal === "object";
}

function shouldIgnoreValue (propertyInfo, value) {
  return (
		value === null ||
		(propertyInfo.hasBooleanValue && !value) ||
		(propertyInfo.hasNumericValue && isNaN(value)) ||
		(propertyInfo.hasPositiveNumericValue && value < 1) ||
		(propertyInfo.hasOverloadedBooleanValue && value === false)
	);
}

function stringifyAttr (attr, value) {
  if (!DOMProperty.properties.hasOwnProperty(attr)) {
    return "";
  }

  const info = DOMProperty.properties[attr];
  const finalAttr = info.attributeName;
  let finalValue = value;

  if (shouldIgnoreValue(info, value)) {
    return "";
  }

  if (
    !info.mustUseProperty &&
    info.hasBooleanValue ||
    (info.hasOverloadedBooleanValue && value === true)
  ) {
    finalValue = "";
  }

  return `${finalAttr}="${finalValue}"`;
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

  for (const attrKey in attrs) {
    let attrPairString;
    const attrVal = attrs[attrKey];

    if (isStyleAttribute(attrKey, attrVal)) {
      attrPairString = `style="${renderStyleAttribute(attrVal)}"`;
    } else {
      attrPairString = stringifyAttr(attrKey, attrs[attrKey]);
    }

    if (attrPairString.length) {
      attrString.push(` ${attrPairString}`);
    }
  }

  return attrString.join("");
}

module.exports = renderAttrs;
