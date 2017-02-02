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

function evalComponent(node) {
  // TODO: Add support for React context.
  //       https://github.com/divmain/react-ssr-async/issues/1
  const instance = new node.type(node.props);

  return isFunction(instance.render) ?
    traverse(instance.render()) :
    traverse(instance);
}

function traverse(node) {
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
    return renderNode(node);
  }
  // React component.
  if (hasOwn(node, "$$typeof")) {
    return evalComponent(node);
  }

  throw new TypeError(`Unknown node of type: ${node.type}`);
}


function asStream(node, synchronous) {
  return synchronous ?
    traverse(node) :
    // Force the stream's events to be consumed asynchronously.
    traverse(node).delay(1);
}

function asPromise (node, synchronous) {
  return asStream(node, synchronous)
    .reduce((memo, segment) => (memo.push(segment), memo), [])
    .then(segments => segments.join(""));
}

function asNodeStream (node) {
  return toNodeStream(asStream(node));
}

module.exports = {
  asStream,
  asPromise,
  asNodeStream
};
