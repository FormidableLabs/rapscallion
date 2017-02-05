import { default as React } from "react";

import { renderToString } from "../src";


describe("special cases", () => {
  it("renders components that return null", () => {
    const NullComponent = () => null;
    const Parent = () => <div><NullComponent /></div>;

    return renderToString(<Parent />).then(html => {
      expect(html).to.equal("<div></div>");
    });
  });
});
