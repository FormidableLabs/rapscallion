const {
  assign,
  keys
} = require("lodash");


const EMPTY_CONTEXT = Object.freeze({});


function getChildContext (componentPrototype, instance, context) {
  if (componentPrototype.childContextTypes) {
    return assign(Object.create(null), context, instance.getChildContext());
  }
  return context;
}

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

function getRootContext () {
  return Object.create(null);
}

module.exports = {
  getChildContext,
  getContext,
  getRootContext
};
