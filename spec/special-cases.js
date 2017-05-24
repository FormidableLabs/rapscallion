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

    return render(<NullComponent />)
      .toPromise()
      .then(html => expect(html).to.equal("<!-- react-empty: 1 -->"));
  });
  it("does not render text comments for children without siblings", () => {
    const TextComponent = () => "some text";

    return render(<TextComponent />).toPromise()
      .then(html => expect(html).to.equal("some text"));
  });
  it("renders text comments for children with siblings", () => {
    const TextWithSiblingsComponent = () => <div id="root"><div>child 1</div>child 2</div>;

    const expected =
      "<div data-reactid=\"2\">child 1</div><!-- react-text: 3 -->child 2<!-- /react-text -->";

    return render(<TextWithSiblingsComponent />)
      .toPromise()
      .then(cheerio.load)
      .then($ => $("#root").html())
      .then(html => expect(html).to.equal(expected));
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
