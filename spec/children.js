import { checkParity, getRootNode } from "./_util";


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
    checkParity(Bar, {});
  });
});
