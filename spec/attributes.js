import { default as React } from "react";

import { checkElementParity } from "./_util";

describe("property to attribute mapping", () => {
  describe("string properties", () => {
    describe("simple numbers", () => {
      checkElementParity(<div width={30} />);
    });

    describe("simple strings", () => {
      checkElementParity(<div width={'30'} />);
    });

    // this seems like it might mask programmer error, but it's existing behavior.
    describe("string prop with true value", () => {
      checkElementParity(<a href={true} />); // eslint-disable-line react/jsx-boolean-value
    });

    // this seems like it might mask programmer error, but it's existing behavior.
    describe("string prop with false value", () => {
      checkElementParity(<a href={false} />);
    });

    // this seems like somewhat odd behavior, as it isn't how <a html> works
    // in HTML, but it's existing behavior.
    describe("string prop with true value", () => {
      checkElementParity(<a href />); // eslint-disable-line react/jsx-boolean-value
    });
  });

  describe("boolean properties", () => {
    describe("boolean prop with true value", () => {
      checkElementParity(<div hidden={true} />); // eslint-disable-line react/jsx-boolean-value
    });

    describe("boolean prop with false value", () => {
      checkElementParity(<div hidden={false} />);
    });

    describe("boolean prop with missing value", () => {
      checkElementParity(<div hidden />); // eslint-disable-line react/jsx-boolean-value
    });

    describe("boolean prop with self value", () => {
      checkElementParity(<div hidden="hidden" />);
    });

    // this does not seem like correct behavior, since hidden="" in HTML indicates
    // that the boolean property is present. however, it is how the current code
    // behaves, so the test is included here.
    describe("boolean prop with \"\" value", () => {
      checkElementParity(<div hidden="" />);
    });

    // this seems like it might mask programmer error, but it's existing behavior.
    describe("boolean prop with string value", () => {
      checkElementParity(<div hidden="foo" />);
    });

    // this seems like it might mask programmer error, but it's existing behavior.
    describe("boolean prop with array value", () => {
      checkElementParity(<div hidden={["foo", "bar"]} />);
    });

    // this seems like it might mask programmer error, but it's existing behavior.
    describe("boolean prop with object value", () => {
      checkElementParity(<div hidden={{ foo: "bar" }} />);
    });

    // this seems like it might mask programmer error, but it's existing behavior.
    describe("boolean prop with non-zero number value", () => {
      checkElementParity(<div hidden={10} />);
    });

    // this seems like it might mask programmer error, but it's existing behavior.
    describe("boolean prop with zero value", () => {
      checkElementParity(<div hidden={0} />);
    });
  });

  describe("download property (combined boolean/string attribute)", () => {
    describe("download prop with true value", () => {
      checkElementParity(<a download={true} />); // eslint-disable-line react/jsx-boolean-value
    });

    describe("download prop with false value", () => {
      checkElementParity(<a download={false} />);
    });

    describe("download prop with no value", () => {
      checkElementParity(<a download />);
    });

    describe("download prop with string value", () => {
      checkElementParity(<a download="myfile" />);
    });

    describe("download prop with string \"true\" value", () => {
      checkElementParity(<a download={'true'} />);
    });
  });

  describe("className property", () => {
    describe("className prop with string value", () => {
      checkElementParity(<div className="myClassName" />);
    });

    describe("className prop with empty string value", () => {
      checkElementParity(<div className="" />);
    });

    // this probably is just masking programmer error, but it is existing behavior.
    describe("className prop with true value", () => {
      checkElementParity(<div className={true} />); // eslint-disable-line react/jsx-boolean-value
    });

    // this probably is just masking programmer error, but it is existing behavior.
    describe("className prop with false value", () => {
      checkElementParity(<div className={false} />);
    });

    // this probably is just masking programmer error, but it is existing behavior.
    describe("className prop with false value", () => {
      checkElementParity(<div className />); // eslint-disable-line react/jsx-boolean-value
    });
  });

  describe("htmlFor property", () => {
    describe("htmlFor with string value", () => {
      checkElementParity(<div htmlFor="myFor" />);
    });

    describe("htmlFor with an empty string", () => {
      checkElementParity(<div htmlFor="" />);
    });

    // this probably is just masking programmer error, but it is existing behavior.
    describe("htmlFor prop with true value", () => {
      checkElementParity(<div htmlFor={true} />); // eslint-disable-line react/jsx-boolean-value
    });

    // this probably is just masking programmer error, but it is existing behavior.
    describe("htmlFor prop with false value", () => {
      checkElementParity(<div htmlFor={false} />);
    });

    // this probably is just masking programmer error, but it is existing behavior.
    describe("htmlFor prop with false value", () => {
      checkElementParity(<div htmlFor />);
    });

  });

  describe("props with special meaning in React", () => {
    describe("no ref attribute", () => {
      class RefComponent extends React.Component {
        render () {
          return <div ref="foo" />; // eslint-disable-line react/no-string-refs
        }
      }
      checkElementParity(<RefComponent />);
    });

    describe("no children attribute", () => {
      checkElementParity(React.createElement("div", {}, "foo"));
    });

    describe("no key attribute", () => {
      checkElementParity(<div key="foo" />);
    });

    describe("no dangerouslySetInnerHTML attribute", () => {
      checkElementParity(<div dangerouslySetInnerHTML={{ __html: "foo" }} />);
    });
  });

  describe("unknown attributes", () => {
    describe("no unknown attributes", () => {
      checkElementParity(<div foo="bar" />);
    });

    describe("unknown data- attributes", () => {
      checkElementParity(<div data-foo="bar" />);
    });

    describe("no unknown attributes for non-standard elements", () => {
      checkElementParity(<nonstandard foo="bar" />);
    });

    describe("unknown attributes for custom elements", () => {
      checkElementParity(<custom-element foo="bar" />);
    });

    describe("unknown attributes for custom elements using is", () => {
      checkElementParity(<div is="custom-element" foo="bar" />);
    });
  });

  describe("no HTML events", () => {
    checkElementParity(<div onClick={() => {}} />);
  });

  describe("non HTML events", () => {
    checkElementParity(<div onFoo={() => {}} />);
  });

  describe("input attributes", () => {
    describe("false multiple", () => {
      checkElementParity(<input multiple={false} />);
    });

    describe("order", () => {
      checkElementParity(
        <input
          accept="image/jpeg,image/png"
          step="1"
          type="file"
          min="0"
          max="100"
        />
      );
    });
  });

  describe("textarea", () => {
    describe("empty style", () => {
      checkElementParity(<div style={{ margin: null }} />);
    });

    describe("with value", () => {
      checkElementParity(<textarea value="foobar" />);
    });

    describe("without value", () => {
      checkElementParity(<textarea />);
    });

    describe("with empty value", () => {
      checkElementParity(<textarea value="" />);
    });
  });

  describe("style", () => {
    describe("empty", () => {
      checkElementParity(<div style={{}} />);
    });

    describe("with all null values", () => {
      checkElementParity(<div style={{ margin: null }} />);
    });
  });

  describe("old failed tests from attrs.js", () => {
    describe("true booleans", () => {
      checkElementParity(<div disabled={true} />); // eslint-disable-line react/jsx-boolean-value
    });

    describe("true checked attribute", () => {
      checkElementParity(<input checked={true} />); // eslint-disable-line react/jsx-boolean-value
    });

    describe("false checked attribute", () => {
      checkElementParity(<input checked={false} />);
    });

    describe("download with url", () => {
      checkElementParity(<div download="https://www.shutterstock.com?this=that&foo=bar" />);
    });
  });
});
