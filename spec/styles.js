import { default as React } from "react";

import { checkParity } from "./_util";


const Foobar = () => (
  <div
    style={{
      padding: 10,
      margin: 15,
      opacity: 1,
      animationIterationCount: 1,
      animationName: "foobar",
      fontSize: 15
    }}
  />
);

describe("the style prop", () => {
  checkParity(Foobar, {});
});
