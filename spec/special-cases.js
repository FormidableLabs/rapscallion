import { default as React } from "react";
import { checkParity, getRootNode } from "./_util";
import { render } from "../src";


describe("special cases", () => {
  it("can handle [] in __html", () => {
    checkParity(getRootNode(`
      return () => <script dangerouslySetInnerHTML={{__html:[] }} type="text/javascript" />
    `), {});
  });

  it("renders components that return null", () => {
    const NullComponent = () => null;
    const Parent = () => <div><NullComponent /></div>;

    return render(<Parent />).includeDataReactAttrs(false).toPromise().then(html => {
      expect(html).to.equal("<div></div>");
    });
  });
});
