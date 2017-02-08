const {
  assign,
  keys
} = require("lodash");


const EMPTY_CONTEXT = Object.freeze({});


/**
 * Using a component prototype's `childContextTypes`, generate an
 * object that will merged into the master traversal context for
 * that component's subtree.
 *
 * @param      {Component}  componentPrototype  The component prototype.
 * @param      {component}  instance            Component instance.
 * @param      {Object}     context             The master context propagating through
 *                                              the traversal.
 *
 * @return     {Object}                         Child context merged into master context.
 */
function getChildContext (componentPrototype, instance, context) {
  if (componentPrototype.childContextTypes) {
    return assign(Object.create(null), context, instance.getChildContext());
  }
  return context;
}

/**
 * Using a component prototype's `contextTypes`, generate an object that
 * will be used as React context for a component instance.
 *
 * @param      {Component}  componentPrototype  The component prototype.
 * @param      {Object}     context             The master context propagating through
 *                                              traversal.
 *
 * @return     {Object}                         The generated context object.
 */
function getContext (componentPrototype, context) {
  if (componentPrototype.contextTypes) {
    const contextTypes = componentPrototype.contextTypes;
    return keys(context).reduce(
      (memo, contextKey) => {
        if (contextKey in contextTypes) {
          memo[contextKey] = context[contextKey];
        }
        return memo;
      },
      Object.create(null)
    );
  }
  return EMPTY_CONTEXT;
}

/**
 * Create an empty context object to be pased into the root of a component's
 * evaluation traversal.
 *
 * @return     {Object}       The root context.
 */
function getRootContext () {
  return Object.create(null);
}

module.exports = {
  getChildContext,
  getContext,
  getRootContext
};
