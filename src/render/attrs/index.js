// `react-dom` expects that certain of its subcomponents are loaded in a particular
// order.  Because of this, requiring the `react-dom/*` submodules below results in
// the following error:
//
//    You're trying to inject DOM property 'aria-current' which has
//    already been injected.
//
// Requiring `react-dom` early resolves this issue.
require("react-dom");

const { isFunction } = require("lodash/fp");
const DOMProperty = require("react-dom/lib/DOMProperty");
const ARIADOMPropertyConfig = require("react-dom/lib/ARIADOMPropertyConfig");
const HTMLDOMPropertyConfig = require("react-dom/lib/HTMLDOMPropertyConfig");
const SVGDOMPropertyConfig = require("react-dom/lib/SVGDOMPropertyConfig");

const { renderStyleAttribute } = require("./style");
const escapeHtml = require("../escape-html");

if (Object.keys(DOMProperty.properties).length === 0) {
  DOMProperty.injection.injectDOMPropertyConfig(ARIADOMPropertyConfig);
  DOMProperty.injection.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  DOMProperty.injection.injectDOMPropertyConfig(SVGDOMPropertyConfig);
}

const attrsNotToRender = {
  children: true,
  dangerouslySetInnerHTML: true
};

function isStyleAttribute (attrKey) {
  return attrKey === "style";
}

function toStringWithValue (name, value) {
  return `${name}="${value}"`;
}

function stringifyCustom (attr, value) {
  let val;

  if (
    !isFunction(value) &&
    !attrsNotToRender[attr]
  ) {
    val = toStringWithValue(attr, value);
  }

  return val;
}

function stringifyBoolean ({ attributeName: name, mustUseProperty }, value) {
  let val;

  if (mustUseProperty) {
    val = toStringWithValue(name, value);
  } else if (value) {
    val = name;
  }

  return val;
}

function stringifyOverloadedBoolean (name, value) {
  let val;

  if (value === true) {
    val = toStringWithValue(name, "");
  } else if (value !== undefined && value !== null && value !== false) {
    val = toStringWithValue(name, value);
  }

  return val;
}

function stringifyNumeric ({ attributeName: name, hasPositiveNumericValue }, value) {
  let val;

  if (!isNaN(value)) {
    if (hasPositiveNumericValue) {
      if (value > 0) {
        val = toStringWithValue(name, value);
      }
    } else {
      val = toStringWithValue(name, value);
    }
  }

  return val;
}

function stringifyStyle (name, value) {
  let val;

  if (value && typeof value === "object" && Object.keys(value).length) {
    val = toStringWithValue(name, renderStyleAttribute(value));
  }

  return val;
}

function stringifyAttr (attr, value) {
  let val;

  if (value !== undefined && value !== null) {
    if (!DOMProperty.properties.hasOwnProperty(attr)) {
      val = stringifyCustom(attr, value);
    } else {
      const info = DOMProperty.properties[attr];
      const name = info.attributeName;

      if (info.hasBooleanValue) {
        val = stringifyBoolean(info, value);
      } else if (info.hasNumericValue) {
        val = stringifyNumeric(info, value);
      } else if (isStyleAttribute(attr)) {
        val = stringifyStyle(name, value);
      } else if (info.hasOverloadedBooleanValue) {
        val = stringifyOverloadedBoolean(name, value);
      } else {
        val = toStringWithValue(name, escapeHtml(value));
      }
    }
  }

  return val || "";
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
    const attrPairString = stringifyAttr(attrKey, attrs[attrKey]);

    if (attrPairString.length) {
      attrString.push(` ${attrPairString}`);
    }
  }

  return attrString.join("");
}

module.exports = renderAttrs;
