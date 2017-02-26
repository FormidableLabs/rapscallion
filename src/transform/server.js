const t = require("babel-types");
const { htmlStringEscape } = require("../render/util");


const _isVanillaDomTag = /^[a-z][a-z\-]*$/;
const isVanillaDomTag = tag => _isVanillaDomTag.test(tag);


module.exports = () => ({
  manipulateOptions: (opts, parserOpts) => parserOpts.plugins.push("jsx"),
  visitor: {
    JSXElement: path => {
      const { node } = path;

      if (isVanillaDomTag(node.openingElement.name.name)) {
        let segments = [];
        pushVanillaVdom(segments, node);

        segments = compress(segments);
        segments = expressionifyStringSegments(segments);

        path.replaceWith(
          t.objectExpression([
            t.objectProperty(
              t.identifier("__prerendered__"),
              t.stringLiteral("dom")
            ),
            t.objectProperty(
              t.identifier("segments"),
              t.arrayExpression(segments)
            )
          ])
        );
        return;
      }

      // It is a <Component> reference.
      const children = node.children
        .map(child => {
          if (t.isJSXText(child)) {
            return child.value.trim();
          } else if (t.isJSXExpressionContainer(child)) {
            return child.expression;
          }
          return child;
        })
        .filter(x => x);

      path.replaceWith(
        t.objectExpression([
          t.objectProperty(
            t.identifier("__prerendered__"),
            t.stringLiteral("component")
          ),
          t.objectProperty(
            t.identifier("type"),
            t.identifier(node.openingElement.name.name)
          ),
          t.objectProperty(
            t.identifier("props"),
            t.objectExpression(getComponentProps(node.openingElement.attributes))
          ),
          t.objectProperty(
            t.identifier("children"),
            t.arrayExpression(children)
          )
        ])
      );
    }
  }
});

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
    segments.push("/>");
    return;
  }

  segments.push(">");

  children.forEach(child => {
    if (t.isJSXText(child)) {
      const trimmed = child.value.trim();
      if (trimmed) { segments.push(htmlStringEscape(trimmed)); }
    } else if (t.isJSXExpressionContainer(child)) {
      segments.push(
        t.objectExpression([
          t.objectProperty(t.identifier("__prerendered__"), t.stringLiteral("expression")),
          t.objectProperty(t.identifier("expression"), child.expression)
        ])
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
        t.objectExpression([
          t.objectProperty(t.identifier("__prerendered__"), t.stringLiteral("attr")),
          t.objectProperty(t.identifier("name"), t.stringLiteral(name)),
          t.objectProperty(t.identifier("value"), value.expression)
        ])
      );
    }
  });
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
