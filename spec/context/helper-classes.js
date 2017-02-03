import { default as React, Component, PropTypes } from "react";


export class Grandparent extends Component {
  getChildContext () {
    return { grandparent: "grandparent" };
  }

  render () {
    return <Parent />;
  }
}

Grandparent.childContextTypes = {
  grandparent: PropTypes.string
};

export class Parent extends Component {
  getChildContext () {
    return { parent: "parent" };
  }

  render () {
    return <Child />;
  }
}

Parent.childContextTypes = {
  parent: PropTypes.string
};

export const Child = (props, context) => {
  return (
    <div>
      <span>{context.grandparent}</span>
      <span>{context.parent}</span>
    </div>
  );
};

Child.contextTypes = {
  grandparent: PropTypes.string,
  parent: PropTypes.string
};
