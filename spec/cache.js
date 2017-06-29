import { default as React, Component } from "react";

import { render, setCacheStrategy, Promise as Bluebird } from "../src";
import { useDefaultCacheStrategy } from "../src/sequence/cache";


const getParentKey = () => `div:static:${Math.random()}`;
const getChildKey = () => `child:static:${Math.random()}`;


const runAllTests = () => {
  describe("for stateful components", () => {
    class Child extends Component {
      render () {
        return (
          <div cacheKey={this.props.childKey}>{this.props.val}</div>
        );
      }
    }

    class Parent extends Component {
      render () {
        return (
          <Child
            cacheKey={this.props.parentKey}
            {...this.props}
          />
        );
      }
    }

    it("returns HTML on cache miss for <div>", () => {
      const childKey = getChildKey();
      return Bluebird.resolve()
        .then(() => render(<Parent val="firstA" childKey={childKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>firstA</div>");
        });
    });

    it("returns cached HTML for <div>", () => {
      const childKey = getChildKey();
      return Bluebird.resolve()
        .then(() => render(<Parent val="firstA" childKey={childKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(() => render(<Parent val="secondA" childKey={childKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>firstA</div>");
        });
    });

    it("returns HTML on cache miss for <Child>", () => {
      const parentKey = getParentKey();
      return Bluebird.resolve()
        .then(() => render(<Parent val="firstB" parentKey={parentKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>firstB</div>");
        });
    });

    it("returns cached HTML for <Child>", () => {
      const parentKey = getParentKey();
      return Bluebird.resolve()
        .then(() => render(<Parent val="firstB" parentKey={parentKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(() => render(<Parent val="secondB" parentKey={parentKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>firstB</div>");
        });
    });
  });

  describe("for stateless functional components", () => {
    const Child = props => {
      return (
        <div cacheKey={props.childKey}>{props.val}</div>
      );
    };

    const Parent = props => {
      return (
        <Child
          cacheKey={props.parentKey}
          {...props}
        />
      );
    };

    it("returns cached HTML for <div>", () => {
      const childKey = getChildKey();
      return Bluebird.resolve()
        .then(() => render(<Parent val="firstC" childKey={childKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(() => render(<Parent val="secondC" childKey={childKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>firstC</div>");
        });
    });

    it("returns cached HTML for <Child>", () => {
      const parentKey = getParentKey();
      return Bluebird.resolve()
        .then(() => render(<Parent val="firstD" parentKey={parentKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(() => render(<Parent val="secondD" parentKey={parentKey} />)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>firstD</div>");
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
      get: key => Bluebird.resolve(asyncCache[key] && JSON.parse(asyncCache[key]) || null),
      set: (key, val) => {
        asyncCache[key] = JSON.stringify(val);
        return Bluebird.resolve();
      }
    });
  });

  afterEach(() => {
    useDefaultCacheStrategy();
  });

  runAllTests();
});

describe("cache strategy promise support", () => {
  it("supports native promises", () => {
    const asyncCache = Object.create(null);
    setCacheStrategy({
      get: key => Promise.resolve(asyncCache[key] && JSON.parse(asyncCache[key]) || null),
      set: (key, val) => {
        asyncCache[key] = JSON.stringify(val);
        return Promise.resolve();
      }
    });

    return Promise.resolve()
        .then(() => render(<div cacheKey="key">test</div>)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(() => render(<div cacheKey="key">cached</div>)
          .includeDataReactAttrs(false)
          .toPromise()
        )
        .then(html => {
          expect(html).to.equal("<div>test</div>");
        });
  });
});
