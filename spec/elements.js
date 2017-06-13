import { default as React } from "react";

import { checkElementParity } from "./_util";

describe("elements with implicit namespaces", () => {
  describe("an svg element", () => {
    checkElementParity(<svg />);
  });

  describe("svg element with an xlink", () => {
    checkElementParity(<svg><image xlinkHref="http://i.imgur.com/w7GCRPb.png" /></svg>);
  });

  describe("a math element", () => {
    checkElementParity(<math />);
  });
});

// specially wrapped components
// (see the big switch near the beginning ofReactDOMComponent.mountComponent)
describe("an img", () => {
  checkElementParity(<img />);
});

describe("newline-eating elements", () => {
  describe("a newline-eating tag with content not starting with \\n", () => {
    checkElementParity(<pre>Hello</pre>);
  });
  describe("a newline-eating tag with content starting with \\n", () => {
    checkElementParity(<pre>{'\nHello'}</pre>);
  });
  describe("a newline-eating tag with content starting with \\n", () => {
    checkElementParity(<pre>{'\nHello'}</pre>);
  });
  describe("a normal tag with content starting with \\n", () => {
    checkElementParity(<div>{'\nHello'}</div>);
  });
});

describe("different component implementations", () => {
  describe("stateless components", () => {
    const StatelessComponent = () => <div>foo</div>;
    checkElementParity(<StatelessComponent />);
  });

  describe("React.createClass components", () => {
    const RccComponent = React.createClass({ // eslint-disable-line react/prefer-es6-class
      render () {
        return <div>foo</div>;
      }
    });
    checkElementParity(<RccComponent />);
  });

  describe("ES6 class components", () => {
    class ClassComponent extends React.Component {
      render () {
        return <div>foo</div>;
      }
    }
    checkElementParity(<ClassComponent />);
  });

  describe("factory components", () => {
    const FactoryComponent = () => {
      return {
        render () {
          return <div>foo</div>;
        }
      };
    };
    checkElementParity(<FactoryComponent />);
  });
});
