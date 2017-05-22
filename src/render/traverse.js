const { getChildContext, getContext } = require("./context");
const { syncSetState } = require("./state");
const htmlStringEscape = require("./escape-html");
const renderAttrs = require("./attrs");

const {
  REACT_EMPTY,
  REACT_ID,
  REACT_TEXT_START,
  REACT_TEXT_END
} = require("../symbols");

const omittedCloseTags = {
  "area": true,
  "base": true,
  "br": true,
  "col": true,
  "embed": true,
  "hr": true,
  "img": true,
  "input": true,
  "keygen": true,
  "link": true,
  "meta": true,
  "param": true,
  "source": true,
  "track": true,
  "wbr": true
};

function renderChildrenArray (seq, children, context) {
  for (let idx = 0; idx < children.length; idx++) {
    const child = children[idx];
    if (child instanceof Array) {
      renderChildrenArray(seq, child, context);
    } else {
      traverse({
        seq,
        node: child,
        context,
        numChildren: children.length
      });
    }
  }
}

function renderChildren (seq, children, context) {
  if (!children) { return; }

  if (children instanceof Array) {
    renderChildrenArray(seq, children, context);
  } else {
    traverse({
      seq,
      node: children,
      context
    });
  }
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
  seq.emit(() => omittedCloseTags[node.type] ? "/>" : ">");
  if (node.props.dangerouslySetInnerHTML) {
    seq.emit(() => node.props.dangerouslySetInnerHTML.__html || "");
  } else {
    seq.delegate(() => renderChildren(seq, node.props.children, context, node));
  }
  if (!omittedCloseTags[node.type]) {
    seq.emit(() => `</${node.type}>`);
  }
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
  const Component = node.type;

  const componentContext = getContext(Component, context);
  const instance = constructComponent(Component, node.props, componentContext);
  const renderedElement = renderComponentInstance(instance, node.props, componentContext);

  const childContext = getChildContext(Component, instance, context);
  traverse({
    seq,
    node: renderedElement,
    context: childContext
  });
}

function constructComponent (Component, props, context) {
  if (!(Component.prototype && Component.prototype.isReactComponent)) {
    // eslint-disable-next-line new-cap
    return Component(props, context);
  } else {
    return new Component(props, context);
  }
}

function renderComponentInstance (instance, props, context) {
  let renderedElement;
  // Stateless functional components return rendered element directly rather than component instance
  if (instance === null || typeof instance.render !== "function") {
    renderedElement = instance;
  } else {
    instance.props = props;
    instance.context = context;
    if (typeof instance.componentWillMount === "function") {
      instance.setState = syncSetState;
      instance.componentWillMount();
    }
    renderedElement = instance.render();
  }
  return renderedElement;
}

function evalSegment (seq, segment, context) {
  if (typeof segment === "string") {
    seq.emit(() => segment);
  } else if (segment === REACT_ID) {
    seq.emit(() => REACT_ID);
  } else if (segment.__prerendered__ === "attr") {
    seq.emit(() => renderAttrs(segment.attrObj));
  } else if (segment.__prerendered__ === "expression") {
    if (typeof segment.expression === "string") {
      seq.emit(() => htmlStringEscape(segment.expression));
    } else if (segment.expression instanceof Array) {
      segment.expression.forEach(subsegment => traverse({
        seq,
        node: subsegment,
        context
      }));
    } else {
      traverse({
        seq,
        node: segment.expression,
        context
      });
    }
  } else {
    traverse({
      seq,
      node: segment,
      context
    });
  }
}

function evalPreRendered (seq, node, context) {
  const prerenderType = node.__prerendered__;
  if (prerenderType === "dom") {
    node.segments.forEach(segment => {
      if (segment instanceof Array) {
        segment.forEach(subsegment => evalSegment(seq, subsegment, context));
      } else {
        evalSegment(seq, segment, context);
      }
    });
  } else if (prerenderType === "attr") {
    const { name, value } = node;
    if (value) { seq.emit(() => ` ${name}="${value}"`); }
  } else if (prerenderType === "component") {
    evalComponent(seq, node, context);
  }
}

function emitEmpty (seq) {
  seq.emit(() => REACT_EMPTY);
}

function emitText (seq, text, numChildren) {
  const hasSiblings = numChildren > 1;

  if (hasSiblings) {
    seq.emit(() => REACT_TEXT_START);
  }

  seq.emit(() => text);

  if (hasSiblings) {
    seq.emit(() => REACT_TEXT_END);
  }
}

function shouldEmitByType (seq, node) {
  if (node === undefined) {
    return false;
  }

  // A Component's render function might return `null`.
  if (node === null) {
    emitEmpty(seq);
    return false;
  }

  if (node === false) {
    return false;
  }

  return true;
}

/**
 * This function will recursively traverse the VDOM tree, emitting HTML segments
 * to the provided sequence.
 *
 * @param      {Sequence}  seq          Sequence that receives HTML segments.
 * @param      {VDOM}      node         Root VDOM node.
 * @param      {Object}    context      React context.
 * @param      {Number}    numChildren  number of children the parent node has
 *
 * @return     {undefined}          No return value.
 */
function traverse ({ seq, node, context, numChildren }) {
  if (!shouldEmitByType(seq, node)) {
    return;
  }

  switch (typeof node) {
  case "string": {

    // Text node.
    emitText(seq, htmlStringEscape(node), numChildren);

    return;
  }
  case "number": {
    emitText(seq, node.toString(), numChildren);

    return;
  }
  case "object": {
    if (node.__prerendered__) {
      evalPreRendered(seq, node, context);
      return;
    } else if (typeof node.type === "string") {
      // Plain-jane DOM element, not a React component.
      seq.delegateCached(node, (_seq, _node) => renderNode(_seq, _node, context));
      return;
    } else if (node.$$typeof) {
      // React component.
      seq.delegateCached(node, (_seq, _node) => evalComponent(_seq, _node, context));
      return;
    }
  }
  }

  throw new TypeError(`Unknown node of type: ${node.type}`);
}


module.exports = traverse;
