import { default as React } from "react";

import { render } from "../../src";
import { Grandparent, Parent } from "./helper-classes";


describe("react context", () => {
  it("renders context one level deep", () => {
    return render(<Parent />).toPromise().then(html => {
      expect(html).to.equal("<div><div><span></span><span>parent</span></div></div>");
    });
  });

  it("renders context two levels deep", () => {
    return render(<Grandparent />).toPromise().then(html => {
      expect(html).to.equal("<div><div><span>grandparent</span><span>parent</span></div></div>");
    });
  });
});
