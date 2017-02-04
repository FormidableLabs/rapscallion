import { default as React } from "react";

import { renderToString } from "../../src";
import {
  Grandparent,
  Parent
} from "./helper-classes";


describe("react context", () => {
  it("renders context one level deep", () => {
    return renderToString(<Parent />).then(html => {
      expect(html).to.equal("<div><span></span><span>parent</span></div>");
    });
  });

  it("renders context two levels deep", () => {
    return renderToString(<Grandparent />).then(html => {
      expect(html).to.equal("<div><span>grandparent</span><span>parent</span></div>");
    });
  });
});
