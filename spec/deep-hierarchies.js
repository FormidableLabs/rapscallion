import { default as React } from "react";

import { checkParity } from "./_util";


const Foo = () => (
  <div>
    <h1 id="foobar">Hello, world</h1>
  </div>
);

const Bar = () => (
  <div>
    <Foo />
    <ul>
      <li>first</li>
      <li>second</li>
    </ul>
  </div>
);

class FooBar extends React.Component {
  render () {
    return (
      <div>
        <h1>Foobar</h1>
        <Bar />
      </div>
    );
  }
}

describe("a hierarchy three levels deep", () => {
  checkParity(FooBar, {});
});
