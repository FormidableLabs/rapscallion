import { default as React, Component, PropTypes } from "react";
import { render } from "../src";


class Grandparent extends Component {
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

class Parent extends Component {
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

const Child = (props, context) => {
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


render(<Grandparent />).toPromise()
  .then(html => console.log(html));
