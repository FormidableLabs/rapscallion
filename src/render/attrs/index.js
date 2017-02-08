const { map, isFunction } = require("lodash/fp");
const { hasOwn } = require("../util");

const transformAttrKey = require("./transform-attr-key");


const mapWithKey = map.convert({ cap: false });

function renderAttrs (attrs) {
  const attrString = [];

  for (let attrKey in attrs) {
    if (
      hasOwn(attrs, attrKey) &&
      attrKey !== "children"
    ) {
      let attrVal = attrs[attrKey];

      if (!attrVal || isFunction(attrVal)) { continue; }

      attrKey = transformAttrKey(attrKey);

      if (attrVal === true) {
        attrVal = "";
      } else if (attrKey === "style" && typeof attrVal === "object") {
        attrVal = `="${styleObjToString(attrVal)}"`;
      } else {
        attrVal = `="${attrVal}"`;
      }

      attrString.push(` ${attrKey}${attrVal}`);
    }
  }

  return attrString.join("");
}

const mapPairToString = mapWithKey((val, key) => `${key}:${val}`);
function styleObjToString (obj) {
  return mapPairToString(obj).join(";");
}


module.exports = renderAttrs;
