import { default as React } from "react";
import { range } from "lodash";

import { checkParity } from "./_util";


const Foo = () => (
  <div>
    <h1 id="foobar">Hello, world</h1>
  </div>
);

const Bar = () => (
  <div>
    <div id="sibling" />
    {
      range(5).map(idx =>
        <Foo key={idx} />
      )
    }
  </div>
);

describe("children", () => {
  describe("specified as an array", () => {
    checkParity(Bar, {});
  });
});
