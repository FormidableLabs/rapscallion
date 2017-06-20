import { default as React, Component } from "react";

import { render } from "../src";


describe("special cases", () => {
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

    // eslint-disable-next-line max-len
    const expected = "<div id=\"root\" data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"-1855509454\"><div data-reactid=\"2\">child 1</div><!-- react-text: 3 -->child 2<!-- /react-text --></div>";

    return render(<TextWithSiblingsComponent />)
      .toPromise()
      .then(html => expect(html).to.equal(expected));
  });
  it("renders text comments for empty text with siblings", () => {
    const EmptyTextComponent = () => <div>{""}<div>foo</div></div>;

    // eslint-disable-next-line max-len
    const expected = "<div data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"-442161767\"><!-- react-text: 2 --><!-- /react-text --><div data-reactid=\"3\">foo</div></div>";

    return render(<EmptyTextComponent />).toPromise().then(html => {
      expect(html).to.equal(expected);
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
