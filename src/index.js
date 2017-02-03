const most = require("most");

const {
  isArray,
  isFunction,
  isInteger,
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
const batch = require("./batch");


let BATCH_EVERY = 100;
const tuneAsynchronicity = num => {
  if (!isInteger(num) || num < 1) {
    throw new RangeError("Asynchronicity must be an integer greater than or equal to 1.");
  }
};


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
    most.just(`</${node.type}>`)
  ]);
}

function evalComponent(node, context) {
  const componentContext = getContext(node.type, context);
  const instance = new node.type(node.props, componentContext);

  const childContext = getChildContext(node.type, instance, context);

  // this.setState({ something: true }, () => console.log(this.state))
  // pass a fake callback, and defer the stream until the callback is invoked?

  if (isFunction(instance.render)) {
    if (isFunction(instance.componentWillMount)) {
      instance.componentWillMount();
    }
    return traverse(instance.render(), childContext);
  }
  return traverse(instance, childContext);
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
    return getCachedNodeStream(node, (_node) => renderNode(_node));
  }
  // React component.
  if (hasOwn(node, "$$typeof")) {
    return getCachedNodeStream(node, (_node) => evalComponent(_node, context));
  }

  throw new TypeError(`Unknown node of type: ${node.type}`);
}

function renderToStream(node) {
  const rootContext = getRootContext();
  return traverse(node, rootContext).thru(batch(BATCH_EVERY));
}

function renderToString (node) {
  return renderToStream(node)
    .reduce((memo, segment) => (memo.push(segment), memo), [])
    .then(segments => segments.join(""));
}


module.exports = {
  renderToStream,
  renderToString,
  toNodeStream,
  streamTemplate,
  tuneAsynchronicity
};
