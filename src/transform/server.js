const t = require("babel-types");

const { htmlStringEscape } = require("../render/util");
const { REACT_ID } = require("../symbols");


const _isVanillaDomTag = /^[a-z][a-z0-9\-]*$/;
const isVanillaDomTag = tag => _isVanillaDomTag.test(tag);


module.exports = () => ({
  manipulateOptions: (opts, parserOpts) => parserOpts.plugins.push("jsx"),
  visitor: {
    JSXElement: path => {
      const { node } = path;
      path.replaceWith(
        isVanillaDomTag(node.openingElement.name.name) ?
          prerenderDom(node) :
          prerenderComponent(node)
      );
    }
  }
});

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
    __prerendered__: t.stringLiteral("component"),
    type: t.identifier(node.openingElement.name.name),
    props: t.objectExpression(getComponentProps(node.openingElement.attributes)),
    children: t.arrayExpression(children)
  });
};

// <div />
const prerenderDom = node => {
  let segments = [];
  pushVanillaVdom(segments, node);

  segments = compress(segments);
  segments = expressionifyStringSegments(segments);

  return buildObjectExpression({
    __prerendered__: t.stringLiteral("dom"),
    segments: t.arrayExpression(segments)
  });
};

const getComponentProps = attributes =>
  attributes.map(attr => {
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
  });

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

const compress = segments => {
  return segments.reduce((memo, segment) => {
    const prevIdx = memo.length - 1;
    const prev = memo[prevIdx];

    if (typeof segment === "string" && typeof prev === "string") {
      memo[prevIdx] += segment;
    } else {
      memo.push(segment);
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
