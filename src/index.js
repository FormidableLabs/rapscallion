const most = require("most");

const {
  isArray,
  isFunction,
  isInteger,
  isString,
  assign
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
  BATCH_EVERY = num;
};


function *renderAttrs (attrs) {
  for (const attrKey in attrs) {
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

function renderChildren (children, context) {
  if (!children) {
    return most.empty();
  }

  return isArray(children) ?
    most.from(children).concatMap(child => traverse(child, context)) :
    // This was:
    //
    //   traverse(children, context);
    //
    // However, for a JSX tree where each node had only one child, this
    // resulted in synchronous evaluation of the entire tree.  In order
    // to circumvent this, we create a new stream of a single value that
    // is flat-mapped into the traversal that we want.
    //
    // This doesn't cost us anything performance-wise, and it gives
    // better guarantees with regard to asychronicity of tree evaluation.
    most.just(null).flatMap(() => traverse(children, context));
}

function renderNode (node, context) {
  return concatAll([
    most.just(`<${node.type}`),
    most.generate(renderAttrs, node.props),
    most.just(">"),
    renderChildren(node.props.children, context),
    most.just(`</${node.type}>`)
  ]);
}

/* eslint-disable no-invalid-this */
function syncSetState (newState, cb) {
  // Mutation is faster and should be safe here.
  this.state = assign(
    this.state,
    isFunction(newState) ?
      newState(this.state, this.props) :
      newState
  );
  if (cb) { cb.call(this); }
}
/* eslint-enable no-invalid-this */

function evalComponent (node, context) {
  const componentContext = getContext(node.type, context);
  // eslint-disable-next-line new-cap
  const instance = new node.type(node.props, componentContext);

  if (isFunction(instance.componentWillMount)) {
    instance.setState = syncSetState;
    instance.componentWillMount();
  }

  const childContext = getChildContext(node.type, instance, context);

  if (isFunction(instance.render)) {
    return traverse(instance.render(), childContext);
  }

  /*
    The following check looks really strange... why _wouldn't_ `instance`
    be an instance of `node.type`?  The answer has to do with JavaScript's
    behavior when values are returned from a constructor invoked with `new`.
    If an object is returned from the constructor, the function is treated
    as if it had been invoked without `new`.

    This behavior is defined in section 9.2.2 step 13a of the ECMAScript
    Language Specification, 7th Edition, here:
    http://www.ecma-international.org/ecma-262/7.0/index.html#sec-ecmascript-function-objects-construct-argumentslist-newtarget

    Specifically relevant is section 9.2.2 step 13a.

    However, in the circumstance of object construction, a `null` return value
    is treated the same as `undefined` and an empty object with prototype
    Constructor will be returned.

    Here it is demonstrated in code:

      const NotNullComponent = () => <div />;
      const notNullComponentNode = <NotNullComponent />;
      const notNullComponentNodeTypeInstance = new notNullComponentNode.type;
      notNullComponentNodeTypeInstance instanceof notNullComponentNode.type;
      // false
      notNullComponentNodeTypeInstance;
      // { '$$typeof': Symbol(react.element),
      //   type: 'div',
      //   key: null,
      //   ref: null,
      //   props: {},
      //   _owner: null,
      //   _store: {} }

      const NullComponent = () => null;
      const nullComponentNode = <NullComponent />;
      const nullComponentNodeTypeInstance = new nullComponentNode.type;
      nullComponentNodeTypeInstance
      // NullComponent {}
      nullComponentNodeTypeInstance instanceof nullComponentNode.type
      // true
  */
  if (instance instanceof node.type) {
    return most.empty();
  }

  return traverse(instance, childContext);
}

function traverse (node, context) {
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
    return getCachedNodeStream(node, (_node) => renderNode(_node, context));
  }
  // React component.
  if (hasOwn(node, "$$typeof")) {
    return getCachedNodeStream(node, (_node) => evalComponent(_node, context));
  }

  throw new TypeError(`Unknown node of type: ${node.type}`);
}

function renderToStream (node) {
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
