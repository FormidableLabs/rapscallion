import { default as React } from "react";
import { checkParity, checkElementParity, getRootNode } from "./_util";

const code = `
import { range } from "lodash";

const Foo = () => (
  <div>
    <h1 id="foobar">Hello, world</h1>
  </div>
);

const Bar = () => (
  <div>
    <div id="sibling" />
    {
      // eslint-disable-next-line no-magic-numbers
      range(5).map(idx =>
        <Foo key={idx} />
      )
    }
  </div>
);

return Bar;
`;

describe("children", () => {
  describe("specified as an array", () => {
    const Bar = getRootNode(code);
    checkParity(Bar);
  });
});

// eslint-disable-next-line max-statements
describe("elements with text children", () => {
  describe("a div with text", () => {
    checkElementParity(<div>Text</div>);
  });

  describe("a div with text with flanking whitespace", () => {
    checkElementParity(<div>  Text </div>);
  });

  describe("a div with text", () => {
    checkElementParity(<div>{"Text"}</div>);
  });

  describe("a div with blank text child", () => {
    checkElementParity(<div>{""}</div>);
  });

  describe("renders a div with blank text children", () => {
    checkElementParity(<div>{""}{""}{""}</div>);
  });

  describe("a div with whitespace children", () => {
    checkElementParity(<div>{" "}{" "}{" "}</div>);
  });

  describe("a div with text sibling to a node", () => {
    checkElementParity(<div>Text<span>More Text</span></div>);
  });

  describe("a non-standard element with text", () => {
    checkElementParity(<nonstandard>Text</nonstandard>);
  });

  describe("a custom element with text", () => {
    checkElementParity(<custom-element>Text</custom-element>);
  });

  describe("leading blank children with comments when there are multiple children", () => {
    checkElementParity(<div>{""}foo</div>);
  });

  describe("trailing blank children with comments when there are multiple children", () => {
    checkElementParity(<div>foo{""}</div>);
  });

  describe("an element with just one text child without comments", () => {
    checkElementParity(<div>foo</div>);
  });

  describe("an element with two text children with comments", () => {
    checkElementParity(<div>{"foo"}{"bar"}</div>);
  });

  describe("a div with multiple children elements separated by whitespace", () => {
    checkElementParity(<div id="parent"><div id="child1" /> <div id="child2" /></div>);
  });

  describe("a div with a child element surrounded by whitespace", () => {
    // eslint-disable-next-line no-multi-spaces
    checkElementParity(<div id="parent">  <div id="child" />   </div>);
  });

  describe("inside array", () => {
    checkElementParity(<div>{["Text"]}</div>);
  });
});

describe("elements with number children", () => {
  describe("a number as single child", () => {
    checkElementParity(<div>{3}</div>);
  });

  // zero is falsey, so it could look like no children if the code isn't careful.
  describe("zero as single child", () => {
    checkElementParity(<div>{0}</div>);
  });

  describe("an element with number and text children with comments", () => {
    checkElementParity(<div>{"foo"}{40}</div>);
  });
});

describe("boolean, null, and undefined children", () => {
  describe("null single child as blank", () => {
    checkElementParity(<div>{null}</div>);
  });

  describe("true single child as blank", () => {
    checkElementParity(<div>{true}</div>);
  });

  describe("false single child as blank", () => {
    checkElementParity(<div>{false}</div>);
  });

  describe("undefined single child as blank", () => {
    checkElementParity(<div>{undefined}</div>);
  });

  describe("a null component children as empty", () => {
    const NullComponent = () => null;
    checkElementParity(<div><NullComponent /></div>);
  });

  describe("a false component children as empty", () => {
    const FalseComponent = () => false;
    checkElementParity(<div><FalseComponent /></div>);
  });

  describe("null children as blank", () => {
    checkElementParity(<div>{null}foo</div>);
  });

  describe("false children as blank", () => {
    checkElementParity(<div>{false}foo</div>);
  });

  describe("null and false children together as blank", () => {
    checkElementParity(<div>{false}{null}foo{null}{false}</div>);
  });

  describe("only null and false children as blank", () => {
    checkElementParity(<div>{false}{null}{null}{false}</div>);
  });
});

describe("array children", () => {
  describe("array of divs", () => {
    checkElementParity(<div>{[<div key="0" />, <div key="1" />]}</div>);
  });

  describe("array with null element", () => {
    checkElementParity(<div>{[<div key="0" />, null]}</div>);
  });

  describe("array with false element", () => {
    checkElementParity(<div>{[<div key="0" />, false]}</div>);
  });

  describe("array with undefined element", () => {
    checkElementParity(<div>{[<div key="0" />, undefined]}</div>);
  });

  describe("array with all empty elements", () => {
    checkElementParity(<div>{[null, false, undefined]}</div>);
  });
});

describe("escaping >, <, and & in children", () => {
  describe(">,<, and & in a single child", () => {
    checkElementParity(<div>{"<span>Text&quot;</span>"}</div>);
  });

  describe(">,<, and & in multiple children", () => {
    checkElementParity(<div>{"<span>Text1&quot;</span>"}{"<span>Text2&quot;</span>"}</div>);
  });
});
