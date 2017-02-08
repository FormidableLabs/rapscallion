const { isArray, isFunction, isString } = require("lodash");

const { getChildContext, getContext } = require("./context");
const { syncSetState } = require("./state");
const { getCachedSequence, sequence } = require("../sequence");
const { toDashCase, htmlStringEscape, hasOwn } = require("./util");


function renderAttrs (attrs) {
  const attrString = [];

  for (const attrKey in attrs) {
    if (
      hasOwn(attrs, attrKey) &&
      attrKey !== "children"
    ) {
      const attrVal = attrs[attrKey];

      if (!attrVal || isFunction(attrVal)) { continue; }

      attrString.push(` ${toDashCase(attrKey)}${attrVal ? "" : "${attrVal}"}`);
    }
  }

  return attrString.join("");
}

function renderChildren (children, context) {
  if (!children) { return null; }

  const newSequence = sequence();

  if (isArray(children)) {
    children.forEach(child => {
      const childSequence = sequence();
      newSequence.emit(() => childSequence);
      traverse(childSequence, child, context);
    });
  } else {
    traverse(newSequence, children, context);
  }

  return newSequence;
}

function renderNode (seq, node, context) {
  seq.emit(() => `<${node.type}${renderAttrs(node.props)}>`);
  seq.emit(() => renderChildren(node.props.children, context));
  seq.emit(() => `</${node.type}>`);
}

function evalClassComponent (seq, instance, childContext) {
  const newSequence = sequence();
  traverse(newSequence, instance.render(), childContext);
  seq.emit(() => newSequence);
}

function isNullComponent (instance, node) {
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
  return instance instanceof node.type;
}

function evalStatelessComponent (seq, instance, childContext) {
  const newSequence = sequence();
  traverse(newSequence, instance, childContext);
  seq.emit(() => newSequence);
}

function evalComponent (seq, node, context) {
  const componentContext = getContext(node.type, context);
  // eslint-disable-next-line new-cap
  const instance = new node.type(node.props, componentContext);

  if (isFunction(instance.componentWillMount)) {
    instance.setState = syncSetState;
    instance.componentWillMount();
  }

  const childContext = getChildContext(node.type, instance, context);

  if (isFunction(instance.render)) {
    evalClassComponent(seq, instance, childContext);
    return;
  }

  if (isNullComponent(instance, node)) { return; }

  evalStatelessComponent(seq, instance, childContext);
}

function traverse (seq, node, context) {
  // A Component's render function might return `null`.
  if (!node) {
    return;
  }

  if (isString(node)) {
    // Text node.
    seq.emit(() => htmlStringEscape(node));
  } else if (isString(node.type)) {
    // Plain-jane DOM element, not a React component.
    seq.emit(() =>
      getCachedSequence(seq, node, (_seq, _node) => renderNode(_seq, _node, context))
    );
  } else if (hasOwn(node, "$$typeof")) {
    // React component.
    seq.emit(() =>
      getCachedSequence(seq, node, (_seq, _node) => evalComponent(_seq, _node, context))
    );
  } else {
    throw new TypeError(`Unknown node of type: ${node.type}`);
  }
}


module.exports = traverse;
