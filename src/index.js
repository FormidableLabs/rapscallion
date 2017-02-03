const most = require("most");

const {
  isArray,
  isFunction,
  isString
} = require("lodash");

const toNodeStream = require("./to-node-stream");
const {
  toDashCase,
  htmlStringEscape,
  hasOwn,
  concatAll
} = require("./util");
const {
  getChildContext,
  getContext,
  getRootContext
} = require("./context");
const streamTemplate = require("./template");
const getCachedNodeStream = require("./cache");


function* renderAttrs (attrs) {
  for (attrKey in attrs) {
    if (
      hasOwn(attrs, attrKey) &&
      attrKey !== "children"
    ) {
      const attrVal = attrs[attrKey];

      if (!attrVal || isFunction(attrVal)) { continue; }

      yield ` ${toDashCase(attrKey)}`;
      if (attrVal !== true) { yield `="${attrVal}"`; }
    }
  }
}

function renderChildren (children) {
  if (!children) {
    return most.empty();
  }

  return isArray(children) ?
    most.from(children).concatMap(child => traverse(child)) :
    traverse(children);
}

function renderNode(node) {
  return concatAll([
    most.just(`<${node.type}`),
    most.generate(renderAttrs, node.props),
    most.just(">"),
    renderChildren(node.props.children),
    most.just(`<${node.type}/>`)
  ]);
}

function evalComponent(node, context) {
  const componentContext = getContext(node.type, context);
  const instance = new node.type(node.props, componentContext);

  const childContext = getChildContext(node.type, instance, context);

  return isFunction(instance.render) ?
    traverse(instance.render(), childContext) :
    traverse(instance, childContext);
}

function traverse(node, context) {
  // A render function might return `null`.
  if (!node) {
    return most.empty();
  }
  // Text node.
  if (isString(node)) {
    return most.just(htmlStringEscape(node));
  }

  // Plain-jane DOM element, not a React component.
  if (isString(node.type)) {
    return getCachedNodeStream(node, () => renderNode(node));
  }
  // React component.
  if (hasOwn(node, "$$typeof")) {
    return getCachedNodeStream(node, () => evalComponent(node, context));
  }

  throw new TypeError(`Unknown node of type: ${node.type}`);
}


function renderToStream(node, synchronous) {
  const rootContext = getRootContext();

  return synchronous ?
    traverse(node, rootContext) :
    // Force the stream's events to be consumed asynchronously.
    traverse(node, rootContext).delay(1);
}

function renterToString (node, synchronous) {
  return renderToStream(node, synchronous)
    .reduce((memo, segment) => (memo.push(segment), memo), [])
    .then(segments => segments.join(""));
}

module.exports = {
  renderToStream,
  renterToString,
  toNodeStream,
  streamTemplate
};
