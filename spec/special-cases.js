import { default as React, Component } from "react";
import cheerio from "cheerio";

import { render } from "../src";


describe("special cases", () => {
  it("renders components that return null", () => {
    const NullComponent = () => null;
    const Parent = () => <div><NullComponent /></div>;

    return render(<Parent />).includeDataReactAttrs(false).toPromise().then(html => {
      expect(html).to.equal("<div></div>");
    });
  });
  it("renders empty comments for components that return null", () => {
    const NullComponent = () => null;

    return render(<NullComponent />).toPromise().then(cheerio.load).then($ => {
      expect($.html()).to.equal("<!-- react-empty: 1 -->");
    });
  });
  it("does not renders text comments for single children", () => {
    const TextComponent = () => "some text";

    return render(<TextComponent />).toPromise().then(cheerio.load).then($ => {
      expect($.html()).to.equal("some text");
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
