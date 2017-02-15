const { isArray, isFunction, isString, isNumber, flatten } = require("lodash");

const { getChildContext, getContext } = require("./context");
const { syncSetState } = require("./state");
const { getCachedSequence, sequence } = require("../sequence");
const { htmlStringEscape, hasOwn } = require("./util");
const renderAttrs = require("./attrs");

const { REACT_ID } = require("../symbols");


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
    flatten(children).forEach(child => {
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
  seq.emit(() => `<${node.type}`);
  seq.emit(() => renderAttrs(node.props, seq));
  seq.emit(() => REACT_ID);
  seq.emit(() => ">");
  if (node.props.dangerouslySetInnerHTML) {
    seq.emit(() => node.props.dangerouslySetInnerHTML.__html || "");
  } else {
    seq.emit(() => renderChildren(node.props.children, context));
  }
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

  if (!(node.type.prototype && node.type.prototype.isReactComponent)) {
    const instance = node.type(node.props, componentContext);
    const childContext = getChildContext(node.type, instance, context);
    return evalStatelessComponent(seq, instance, childContext);
  }

  // eslint-disable-next-line new-cap
  const instance = new node.type(node.props, componentContext);

  if (isFunction(instance.componentWillMount)) {
    instance.setState = syncSetState;
    instance.componentWillMount();
  }

  const childContext = getChildContext(node.type, instance, context);

  return evalClassComponent(seq, instance, childContext);
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
  } else if (isNumber(node)) {
    seq.emit(() => node.toString());
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
