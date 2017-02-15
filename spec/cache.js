import { default as React, Component } from "react";

import { render, setCacheStrategy, Promise } from "../src";
import { useDefaultCacheStrategy } from "../src/sequence/cache";


const runAllTests = () => {
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
        .then(() => render(<Parent val="first" cacheChild />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(() => render(<Parent val="second" cacheChild />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>first</div>");
        });
    });

    it("returns cached HTML for <Child>", () => {
      return Promise.resolve()
        .then(() => render(<Parent val="first" cacheParent />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(() => render(<Parent val="second" cacheParent />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
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
        .then(() => render(<Parent val="first" cacheChild />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(() => render(<Parent val="second" cacheChild />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>first</div>");
        });
    });

    it("returns cached HTML for <Child>", () => {
      return Promise.resolve()
        .then(() => render(<Parent val="first" cacheParent />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(() => render(<Parent val="second" cacheParent />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>first</div>");
        });
    });
  });
};

describe("naive caching", () => {
  runAllTests();
});

describe("async caching", () => {
  beforeEach(() => {
    const asyncCache = Object.create(null);

    setCacheStrategy({
      get: key => Promise.resolve(asyncCache[key] && JSON.parse(asyncCache[key]) || null),
      set: (key, val) => {
        asyncCache[key] = JSON.stringify(val);
        return Promise.resolve();
      }
    });
  });

  afterEach(() => {
    useDefaultCacheStrategy();
  });

  runAllTests();
});
