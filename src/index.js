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

function renderNode(tag) {
  return concatAll([
    most.just(`<${tag.type}`),
    most.generate(renderAttrs, tag.props),
    most.just(">"),
    renderChildren(tag.props.children),
    most.just(`<${tag.type}/>`)
  ]);
}

function evalComponent(node, state) {
  const instance = new node.type(node.props/*, context? */);

  return isFunction(instance.render) ?
    traverse(instance.render()) :
    traverse(instance);
}

function traverse(node, state) {
  if (!node) {
    return most.empty();
  }
  if (isString(node)) {
    return most.just(htmlStringEscape(node));
  }
  if (isString(node.type)) {
    return renderNode(node);
  }
  if (hasOwn(node, "$$typeof")) {
    return evalComponent(node, state);
  }
  throw new TypeError(`Unknown node of type: ${node.type}`);
}


function asStream(node, synchronous) {
  return synchronous ?
    traverse(node) :
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
