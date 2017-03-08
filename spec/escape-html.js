import { checkParity, getRootNode } from "./_util";

const code = `
const FooBar = () => (
  <div>{"<script type='' src=\\"\\"></script>"}</div>
);

return FooBar;
`;

describe("escape/encode html parity", () => {
  const FooBar = getRootNode(code);
  checkParity(FooBar, {});
});
