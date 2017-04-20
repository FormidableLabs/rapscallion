const t = require("babel-types");
const { flatten } = require("lodash");

const htmlStringEscape = require("../render/escape-html");
const { REACT_ID } = require("../symbols");


const _isVanillaDomTag = /^[a-z][a-z0-9\-]*$/;
const isVanillaDomTag = tag => _isVanillaDomTag.test(tag);


module.exports = () => ({
  manipulateOptions: (opts, parserOpts) => parserOpts.plugins.push("jsx"),
  visitor: {
    JSXElement: {
      enter: path => {
        const { node } = path;
        path.replaceWith(
          isVanillaDomTag(node.openingElement.name.name) ?
            prerenderDom(node) :
            prerenderComponent(node)
        );
      }
    },
    ObjectExpression: {
      exit: (path, state) => {
        const obj = objectExpressionToObject(path.node);
        if (!obj.__prerendered__) { return; }
        // Mutating, since this is an exit visitor and it is way easier...
        flattenDomSegments(obj);
        if (path.node.__isHoistable__ && state.opts && state.opts.hoist) {
          path.hoist();
        }
      }
    }
  }
});

const flattenDomSegments = (obj) => {
  if (!obj.segments) { return; }
  obj.segments.elements = compress(flatten(obj.segments.elements.map(segment => {
    if (!t.isObjectExpression(segment)) { return segment; }
    const segmentObj = objectExpressionToObject(segment);
    if (!segmentObj.segments) { return segment; }
    // This will be an ArrayExpression
    return segmentObj.segments.elements;
  })));
};

// <Component />
const prerenderComponent = node => {
  const children = node.children
    .map(child => {
      if (t.isJSXText(child)) {
        const trimmed = child.value.trim();
        return trimmed && t.stringLiteral(trimmed);
      } else if (t.isJSXExpressionContainer(child)) {
        return child.expression;
      }
      return child;
    })
    .filter(x => x);

  return buildObjectExpression({
    // React.Children.only may be used in app code to validate inputs to a component.
    // We need to provide the right value here in order for it to be detected as a
    // valid React element.
    //
    //   https://github.com/facebook/react/blob/b1b4a2fb252f26fe10d29ba60d85ff89a85ff3ec/src/isomorphic/children/onlyChild.js#L32-L36
    //   https://github.com/facebook/react/blob/b1b4a2fb252f26fe10d29ba60d85ff89a85ff3ec/src/isomorphic/classic/element/ReactElement.js#L376-L380
    //   https://github.com/facebook/react/blob/b1b4a2fb252f26fe10d29ba60d85ff89a85ff3ec/src/shared/utils/ReactElementSymbol.js#L17-L20
    //
    $$typeof: t.callExpression(
      t.memberExpression(t.identifier("Symbol"), t.identifier("for")),
      [ t.stringLiteral("react.element") ]
    ),
    __prerendered__: t.stringLiteral("component"),
    type: t.identifier(node.openingElement.name.name),
    props: t.objectExpression(getComponentProps(node.openingElement.attributes, children))
  });
};

// <div />
const prerenderDom = node => {
  let segments = [];
  pushVanillaVdom(segments, node);

  segments = expressionifyStringSegments(segments);
  segments = compress(segments);

  const objExpr = buildObjectExpression({
    // React.Children.only may be used in app code to validate inputs to a component.
    // We need to provide the right value here in order for it to be detected as a
    // valid React element.
    //
    //   https://github.com/facebook/react/blob/b1b4a2fb252f26fe10d29ba60d85ff89a85ff3ec/src/isomorphic/children/onlyChild.js#L32-L36
    //   https://github.com/facebook/react/blob/b1b4a2fb252f26fe10d29ba60d85ff89a85ff3ec/src/isomorphic/classic/element/ReactElement.js#L376-L380
    //   https://github.com/facebook/react/blob/b1b4a2fb252f26fe10d29ba60d85ff89a85ff3ec/src/shared/utils/ReactElementSymbol.js#L17-L20
    //
    $$typeof: t.callExpression(
      t.memberExpression(t.identifier("Symbol"), t.identifier("for")),
      [ t.stringLiteral("react.element") ]
    ),
    __prerendered__: t.stringLiteral("dom"),
    segments: t.arrayExpression(segments)
  });

  objExpr.__isHoistable__ = isHoistable(segments);

  return objExpr;
};

const getComponentProps = (attributes, children) => attributes
  .map(attr => {
    if (t.isJSXSpreadAttribute(attr)) {
      return t.spreadProperty(attr.argument);
    }

    const { name, value } = attr;
    return t.objectProperty(
      t.identifier(name.name),
      t.isJSXExpressionContainer(value) ?
        value.expression :
        value
    );
  })
  .concat([
    t.objectProperty(
      t.identifier("children"),
      t.arrayExpression(children)
    )
  ]);

const pushVanillaVdom = (segments, node) => {
  const { openingElement, children, closingElement } = node;

  segments.push(`<${openingElement.name.name}`);
  pushAttributes(segments, openingElement.attributes);
  if (openingElement.selfClosing) {
    segments.push(`></${openingElement.name.name}>`);
    return;
  }

  segments.push(">");

  children.forEach(child => {
    if (t.isJSXText(child)) {
      const trimmed = child.value.trim();
      if (trimmed) { segments.push(htmlStringEscape(trimmed)); }
    } else if (t.isJSXExpressionContainer(child)) {
      segments.push(
        buildObjectExpression({
          __prerendered__: t.stringLiteral("expression"),
          expression: child.expression
        })
      );
    } else {
      segments.push(child);
    }
  });

  segments.push(`</${closingElement.name.name}>`);
};

const pushAttributes = (segments, attrs) => {
  attrs.forEach(attr => {
    const { name: { name }, value } = attr;

    if (!value) {
      // If no value is specified, this is a boolean HTML attribute that is set.
      segments.push(` ${name}`);
    } else if (t.isStringLiteral(value)) {
      // If the value is a string literal, it is pre-renderable.
      segments.push(` ${name}="${value.value}"`);
    } else {
      segments.push(
        buildObjectExpression({
          __prerendered__: t.stringLiteral("attr"),
          attrObj: buildObjectExpression({
            [name]: value.expression
          })
        })
      );
    }
  });
  segments.push(
    // This is used by the renderer to insert `data-react-id`s.
    t.numericLiteral(REACT_ID)
  );
};

const compress = elements => {
  return elements.reduce((memo, element) => {
    const prevIdx = memo.length - 1;
    const prev = memo[prevIdx];

    if (t.isStringLiteral(prev) && t.isStringLiteral(element)) {
      prev.value += element.value;
    } else {
      memo.push(element);
    }

    return memo;
  }, []);
};

const expressionifyStringSegments = segments => {
  return segments.map(segment =>
    typeof segment === "string" ?
      t.stringLiteral(segment) :
      segment
  );
};

const buildObjectExpression = obj => {
  return t.objectExpression(Object.keys(obj).map(key => {
    return t.objectProperty(
      t.identifier(key),
      obj[key]
    );
  }));
};

const objectExpressionToObject = objExpr => {
  const obj = Object.create(null);
  objExpr.properties.forEach(property => {
    obj[property.key.name || property.key.value] = property.value;
  });
  return obj;
};

const isHoistable = arrayElements => arrayElements.every(el =>
  t.isStringLiteral(el) ||
  t.isNumericLiteral(el) ||
  t.isObjectExpression(el) && el.__isHoistable__
);
