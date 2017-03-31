import { default as React, Component } from "react";

import { render } from "../src";


describe("special cases", () => {
  it("renders components that return null", () => {
    const NullComponent = () => null;
    const Parent = () => <div><NullComponent /></div>;

    return render(<Parent />).includeDataReactAttrs(false).toPromise().then(html => {
      expect(html).to.equal("<div></div>");
    });
  });
  it("renders components that don't pass constructor arguments to super", () => {
    class C extends Component {
      constructor () {
        super();
      }
      render () {
        return <div>{this.props.foo}</div>;
      }
    }
    return render(<C foo="bar"/>).includeDataReactAttrs(false).toPromise().then(html => {
      expect(html).to.equal("<div>bar</div>");
    });
  });
});
