const { isArray, isFunction, isString } = require("lodash");

const { getChildContext, getContext } = require("./context");
const { syncSetState } = require("./state");
const { getCachedSequence, sequence } = require("../sequence");
const { htmlStringEscape, hasOwn } = require("./util");
const renderAttrs = require("./attrs");


/**
 * Evaluates the children of a plain-jane VDOM node (like a <div>).
 * These children may be of any valid output type: Component instances,
 * VDOM, or text nodes.  Traversal is recursive, involving the
 * `traverse` function below.
 *
 * @param      {Array|VDOM}    children  One or more VDOM nodes to be evaluated.
 * @param      {Object}        context   Context for the node's children.
 *
 * @return     {Sequence}                The sub-sequence for the provided children.
 */
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

/**
 * Evaluates a plain-jane VDOM node (like a <div>).
 *
 * @param      {Sequence}  seq      Sequence that receives HTML segments.
 * @param      {VDOM}      node     VDOM node to be rendered.
 * @param      {Object}    context  Context for the node's children.
 *
 * @return     {undefined}          No return value.
 */
function renderNode (seq, node, context) {
  seq.emit(() => `<${node.type}${renderAttrs(node.props)}>`);
  seq.emit(() => renderChildren(node.props.children, context));
  seq.emit(() => `</${node.type}>`);
}

/**
 * Evaluates a component instance for constructors with prototype of
 * React.Component.
 *
 * @param      {Sequence}   seq           Sequence that receives HTML segments.
 * @param      {Component}  instance      An instance of a React.Component subclass.
 * @param      {Object}     childContext  Context for the component's children.
 *
 * @return     {undefined}                No return value.
 */
function evalClassComponent (seq, instance, childContext) {
  const newSequence = sequence();
  traverse(newSequence, instance.render(), childContext);
  seq.emit(() => newSequence);
}

/**
 * Determines if the instance's constructor is an SFC that returns null.
 *
 * The following check looks really strange... why _wouldn't_ `instance`
 * be an instance of `node.type`?  The answer has to do with JavaScript's
 * behavior when values are returned from a constructor invoked with `new`.
 * If an object is returned from the constructor, the function is treated
 * as if it had been invoked without `new`.
 *
 * This behavior is defined in section 9.2.2 step 13a of the ECMAScript
 * Language Specification, 7th Edition, here:
 * http://www.ecma-international.org/ecma-262/7.0/index.html#sec-ecmascript-function-objects-construct-argumentslist-newtarget
 *
 * However, in the circumstance of object construction, a `null` return value
 * is treated the same as `undefined` and an empty object with prototype
 * Constructor will be returned.
 *
 * Here it is demonstrated in code:
 *
 *   const NotNullComponent = () => <div />;
 *   const notNullComponentNode = <NotNullComponent />;
 *   const notNullComponentNodeTypeInstance = new notNullComponentNode.type;
 *   notNullComponentNodeTypeInstance instanceof notNullComponentNode.type;
 *   // false
 *   notNullComponentNodeTypeInstance;
 *   // { '$$typeof': Symbol(react.element),
 *   //   type: 'div',
 *   //   key: null,
 *   //   ref: null,
 *   //   props: {},
 *   //   _owner: null,
 *   //   _store: {} }
 *
 *   const NullComponent = () => null;
 *   const nullComponentNode = <NullComponent />;
 *   const nullComponentNodeTypeInstance = new nullComponentNode.type;
 *   nullComponentNodeTypeInstance
 *   // NullComponent {}
 *   nullComponentNodeTypeInstance instanceof nullComponentNode.type
 *   // true
 *
 * @param      {VDOM?}   instance  Something that may or may not be VDOM.
 * @param      {VDOM}    node      The node that was used to construct the instance.
 *
 * @return     {boolean}  True if null component, False otherwise.
 */
function isNullComponent (instance, node) {
  return instance instanceof node.type;
}

/**
 * Evaluate a stateless functional component and continue traversing its
 * rendered VDOM.
 *
 * @param      {Sequence}  seq           Sequence that receives HTML segments.
 * @param      {VDOM}      node          The output of invoking a React SFC.
 * @param      {Object}    childContext  React context for the SFC's children.
 *
 * @return     {undefined}               No return value.
 */
function evalStatelessComponent (seq, node, childContext) {
  const newSequence = sequence();
  traverse(newSequence, node, childContext);
  seq.emit(() => newSequence);
}

/**
 * Prior to being rendered, React components are represented in the same
 * way as true HTML DOM elements.  This function evaluates the component
 * and traverses through its rendered elements.
 *
 * @param      {Sequence}  seq      Sequence that receives HTML segments.
 * @param      {VDOM}      node     VOM node (of a component).
 * @param      {Object}    context  React context.
 *
 * @return     {undefined}          No return value.
 */
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

/**
 * This function will recursively traverse the VDOM tree, emitting HTML segments
 * to the provided sequence.
 *
 * @param      {Sequence}  seq      Sequence that receives HTML segments.
 * @param      {VDOM}      node     Root VDOM node.
 * @param      {Object}    context  React context.
 *
 * @return     {undefined}          No return value.
 */
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
