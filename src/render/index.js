const {
  isArray,
  isFunction,
  isString,
  assign
} = require("lodash");

const {
  getChildContext,
  getContext,
  getRootContext
} = require("./context");
const getCachedGenerator = require("./cache");
const {
  toDashCase,
  htmlStringEscape,
  hasOwn,
  queueGeneration
} = require("./util");


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

function *renderChildren (children, context) {
  if (!children) {
    return;
  }

  if (isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      yield* traverse(children[i], context);
    }
    return;
  }

  // This was:
  //
  //   yield* traverse(children, context);
  //
  // However, for a JSX tree where each node had only one child, this
  // resulted in synchronous evaluation of the entire tree.  In order
  // to circumvent this, we create a new stream of a single value that
  // is flat-mapped into the traversal that we want.
  //
  // This doesn't cost us anything performance-wise, and it gives
  // better guarantees with regard to asychronicity of tree evaluation.
  yield* queueGeneration(() => traverse(children, context));
}

function *renderNode (node, context) {
  yield `<${node.type}`;
  yield* renderAttrs(node.props);
  yield ">";
  yield* renderChildren(node.props.children, context);
  yield `</${node.type}>`;
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

function *evalComponent (node, context) {
  const componentContext = getContext(node.type, context);
  // eslint-disable-next-line new-cap
  const instance = new node.type(node.props, componentContext);

  if (isFunction(instance.componentWillMount)) {
    instance.setState = syncSetState;
    instance.componentWillMount();
  }

  const childContext = getChildContext(node.type, instance, context);

  if (isFunction(instance.render)) {
    yield* traverse(instance.render(), childContext);
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
    return;
  }

  yield* traverse(instance, childContext);
}

function *traverse (node, context) {
  // A Component's render function might return `null`.
  if (!node) {
    return;
  }

  // Text node.
  if (isString(node)) {
    yield htmlStringEscape(node);
    return;
  }

  // Plain-jane DOM element, not a React component.
  if (isString(node.type)) {
    yield* getCachedGenerator(node, (_node) => renderNode(_node, context));
    return;
  }

  // React component.
  if (hasOwn(node, "$$typeof")) {
    yield* getCachedGenerator(node, (_node) => evalComponent(_node, context));
    return;
  }

  throw new TypeError(`Unknown node of type: ${node.type}`);
}

function render (node, rootContext) {
  rootContext = rootContext || getRootContext();
  return traverse(node, rootContext);
}

module.exports = render;
