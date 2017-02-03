import { default as React, Component } from "react";

import { renderToString } from "../src";



describe("caching", () => {
  describe("for stateful components", () => {
    const staticDivKey = `div:static:${Math.random()}`;
    const staticChildKey = `child:static:${Math.random()}`;

    class Child extends Component {
      render () {
        const cacheKey = this.props.cacheChild ? staticDivKey : null;
        return (
          <div cacheKey={cacheKey}>{this.props.val}</div>
        );
      }
    }

    class Parent extends Component {
      render () {
        const cacheKey = this.props.cacheParent ? staticChildKey : null;
        return (
          <Child
            cacheKey={cacheKey}
            {...this.props}
          />
        );
      }
    }

    it("returns cached HTML for <div>", () => {
      return Promise.resolve()
        .then(() => renderToString(<Parent val="first" cacheChild />))
        .then(() => renderToString(<Parent val="second" cacheChild />))
        .then(html => {
          expect(html).to.equal("<div>first</div>");
        });
    });

    it("returns cached HTML for <Child>", () => {
      return Promise.resolve()
        .then(() => renderToString(<Parent val="first" cacheParent />))
        .then(() => renderToString(<Parent val="second" cacheParent />))
        .then(html => {
          expect(html).to.equal("<div>first</div>");
        });
    });
  });

  describe("for stateless functional components", () => {
    const staticDivKey = `div:static:${Math.random()}`;
    const staticChildKey = `child:static:${Math.random()}`;

    const Child = props => {
      const cacheKey = props.cacheChild ? staticDivKey : null;
      return (
        <div cacheKey={cacheKey}>{props.val}</div>
      );
    };

    const Parent = props => {
      const cacheKey = props.cacheParent ? staticChildKey : null;
      return (
        <Child
          cacheKey={cacheKey}
          {...props}
        />
      );
    };

    it("returns cached HTML for <div>", () => {
      return Promise.resolve()
        .then(() => renderToString(<Parent val="first" cacheChild />))
        .then(() => renderToString(<Parent val="second" cacheChild />))
        .then(html => {
          expect(html).to.equal("<div>first</div>");
        });
    });

    it("returns cached HTML for <Child>", () => {
      return Promise.resolve()
        .then(() => renderToString(<Parent val="first" cacheParent />))
        .then(() => renderToString(<Parent val="second" cacheParent />))
        .then(html => {
          expect(html).to.equal("<div>first</div>");
        });
    });
  });
});
