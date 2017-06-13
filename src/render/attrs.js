// `react-dom` expects that certain of its subcomponents are loaded in a particular
// order.  Because of this, requiring the `react-dom/*` submodules below results in
// the following error:
//
//    You're trying to inject DOM property 'aria-current' which has
//    already been injected.
//
// Requiring `react-dom` early resolves this issue.
require("react-dom");

const assign = require("lodash/assign");
const isObject = require("lodash/isObject");
const isString = require("lodash/isString");
const mapValues = require("lodash/mapValues");
const DOMProperty = require("react-dom/lib/DOMProperty");
const ARIADOMPropertyConfig = require("react-dom/lib/ARIADOMPropertyConfig");
const HTMLDOMPropertyConfig = require("react-dom/lib/HTMLDOMPropertyConfig");
const SVGDOMPropertyConfig = require("react-dom/lib/SVGDOMPropertyConfig");
const DOMPropertyOperations = require("react-dom/lib/DOMPropertyOperations");
const CSSPropertyOperations = require("react-dom/lib/CSSPropertyOperations");

if (Object.keys(DOMProperty.properties).length === 0) {
  DOMProperty.injection.injectDOMPropertyConfig(ARIADOMPropertyConfig);
  DOMProperty.injection.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  DOMProperty.injection.injectDOMPropertyConfig(SVGDOMPropertyConfig);
}

const RESERVED_PROPS = {
  children: true,
  dangerouslySetInnerHTML: true,
  suppressContentEditableWarning: true
};

function isCustomNode (node) {
  return node.type.indexOf("-") >= 0 ||
    (node.props.is !== null && node.props.is !== undefined);
}

/**
 * Render an object of key/value pairs into their HTML attribute equivalent.
 *
 * @param      {Object}  attrs   Attributes in object form.
 * @param      {VDOM}    node    VDOM node.
 *
 * @return     {String}          Generated HTML attribute output.
 */
// eslint-disable-next-line max-statements
function renderAttrs (attrs, node) {
  let result = "";

  if (node && node.type === "input") {
    // from ReactDOMInput.getHostProps
    attrs = assign({
      type: undefined,
      step: undefined,
      min: undefined,
      max: undefined
    }, attrs);
  }

  for (const attrKey in attrs) {
    let attrValue = attrs[attrKey];

    if (attrKey === "style") {
      if (!isObject(attrValue)) {
        continue;
      }
      attrValue = CSSPropertyOperations.createMarkupForStyles(mapValues(attrValue, value => {
        if (isString(value)) {
          return value.trim();
        }
        return value;
      }));
    }

    let markup = null;
    if (DOMProperty.isCustomAttribute(attrKey) || node && isCustomNode(node)) {
      if (!RESERVED_PROPS[attrKey]) {
        markup = DOMPropertyOperations.createMarkupForCustomAttribute(attrKey, attrValue);
      }
    } else {
      markup = DOMPropertyOperations.createMarkupForProperty(attrKey, attrValue);
    }
    if (markup) {
      result += ` ${markup}`;
    }
  }

  return result;
}

module.exports = renderAttrs;
