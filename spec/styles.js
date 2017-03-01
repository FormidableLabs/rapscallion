import { checkParity, getRootNode } from "./_util";

const code = `
const FooBar = () => (
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

return FooBar;
`;

describe("the style prop", () => {
  const FooBar = getRootNode(code);
  checkParity(FooBar, {});
});
