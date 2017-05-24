const { isFunction } = require("lodash/fp");
const DOMProperty = require("react-dom/lib/DOMProperty");
const ARIADOMPropertyConfig = require("react-dom/lib/ARIADOMPropertyConfig");
const HTMLDOMPropertyConfig = require("react-dom/lib/HTMLDOMPropertyConfig");
const SVGDOMPropertyConfig = require("react-dom/lib/SVGDOMPropertyConfig");

const { renderStyleAttribute } = require("./style");
const escapeHtml = require("../escape-html");

DOMProperty.injection.injectDOMPropertyConfig(ARIADOMPropertyConfig);
DOMProperty.injection.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
DOMProperty.injection.injectDOMPropertyConfig(SVGDOMPropertyConfig);

const attrsNotToRender = {
  children: true,
  dangerouslySetInnerHTML: true
};

function isStyleAttribute (attrKey) {
  return attrKey === "style";
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

function toStringWithValue (name, value) {
  return `${name}="${value}"`;
}

function stringifyAttr (attr, value) {
  // if (attr === 'className') console.log(attr, value);
  if (value !== undefined && value !== null) {
    if (!DOMProperty.properties.hasOwnProperty(attr)) {
      if (
        !isFunction(value) &&
        !attrsNotToRender[attr]
      ) {
        return toStringWithValue(attr, value);
      }
    } else {
      const info = DOMProperty.properties[attr];
      const name = info.attributeName;

      if (info.hasBooleanValue) {
        if (value) {
          return name;
        }
      } else if (isStyleAttribute(attr)) {
        if (value && typeof value === "object" && Object.keys(value).length) {
          return toStringWithValue(name, renderStyleAttribute(value));
        }
      } else {
        return toStringWithValue(name, value);
      }
    }
  }

  return "";
}

// function stringifyAttr (attr, value) {
  // if (!DOMProperty.properties.hasOwnProperty(attr)) {
  //   if (isFunction(value)) {
  //     return "";
  //   }
  //
  //   if (!value) {
  //     return "";
  //   }
  //
  //   if (attrsNotToRender[attr]) {
  //     return "";
  //   }
  //
  //   return `${attr}="${escapeHtml(value)}"`;
  // }





  // if (!DOMProperty.properties.hasOwnProperty(attr)) {
  //   if (
  //     attrsNotToRender[attr]
  //     || isFunction(value)
  //     || !value
  //   ) {
  //     return "";
  //   } else {
  //     return `${attr}="${escapeHtml(value)}"`;
  //   }
  // }
  //
  // const info = DOMProperty.properties[attr];
  // const finalAttr = info.attributeName;
  // let finalValue = value;
  //
  // if (shouldIgnoreValue(info, value)) {
  //   return "";
  // }
  //
  // if (isStyleAttribute(attr)) {
  //   if (!value || !Object.keys(value).length) {
  //     return "";
  //   } else {
  //     finalValue = `="${renderStyleAttribute(value)}"`;
  //   }
  // } else if (!value) {
  //   if (
  //     info.mustUseProperty ||
  //     (info.hasBooleanValue && value === false) ||
  //     (info.hasOverloadedBooleanValue && value === true)
  //   ) {
  //     finalValue = "";
  //   } else if (typeof value === "string") {
  //     finalValue = "=\"\"";
  //   } else {
  //     return "";
  //   }
  // } else {
  //   finalValue = `="${escapeHtml(finalValue)}"`;
  // }
  //
  // return `${finalAttr}${finalValue}`;
// }

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
    const attrPairString = stringifyAttr(attrKey, attrs[attrKey]);

    if (attrPairString.length) {
      attrString.push(` ${attrPairString}`);
    }
  }

  return attrString.join("");
}

module.exports = renderAttrs;
