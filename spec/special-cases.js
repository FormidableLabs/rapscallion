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
  it("does not render non-number falsy attributes", () => {
    const ComponentWithFalsyAttribute = () => (
      <div>
        <a disabled={false} />
        <a disabled={null} />
        <a disabled={undefined} />
      </div>
    );

    return render(<ComponentWithFalsyAttribute />)
      .includeDataReactAttrs(false)
      .toPromise()
      .then(html => expect(html).to.equal("<div><a></a><a></a><a></a></div>"));
  });
  it("renders zero attributes as a string", () => {
    const ComponentWithZeroAttribute = () => <a disabled={0} />;

    return render(<ComponentWithZeroAttribute />)
      .includeDataReactAttrs(false)
      .toPromise()
      .then(html => expect(html).to.equal("<a></a>"));
  });
  it("renders true attributes as valueless", () => {
    // eslint-disable-next-line react/jsx-boolean-value
    const ValuelessAttribute = () => <a disabled={true} />;

    return render(<ValuelessAttribute />)
      .includeDataReactAttrs(false)
      .toPromise()
      .then(html => expect(html).to.equal("<a disabled></a>"));
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
  it("renders true aria attributes", () => {
    // eslint-disable-next-line react/jsx-boolean-value
    const ComponentWithAriaAttribute = () => <a aria-expanded={true} />;

    return render(<ComponentWithAriaAttribute />)
      .includeDataReactAttrs(false)
      .toPromise()
      .then(html => expect(html).to.equal("<a aria-expanded=\"true\"></a>"));
  });
});
