import { default as React } from "react";

import { render } from "../src";

import { checkElementParity } from "./_util";

describe("special cases", () => {
  it("renders components that return null", () => {
    const NullComponent = () => null;
    const Parent = () => <div><NullComponent /></div>;

    return render(<Parent />).includeDataReactAttrs(false).toPromise().then(html => {
      expect(html).to.equal("<div></div>");
    });
  });

  describe("a false component as empty", () => {
    const FalseComponent = () => false;
    checkElementParity(<FalseComponent />);
  });

  describe("a null component as empty", () => {
    const NullComponent = () => null;
    checkElementParity(<NullComponent />);
  });

});
