import { checkParity, getRootNode } from "./_util";


const code = `

const Bizz = () => (
  <span>BIZZZZZZ</span>
);

const Foo = ({ children }) => (
  <div>
    <h1 id="foobar">Hello, world</h1>
    { children }
  </div>
);

const Bar = () => (
  <div>
    <Foo>
      <Bizz />
    </Foo>
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

return FooBar;
`;

describe("a hierarchy three levels deep", () => {
  const FooBar = getRootNode(code);
  checkParity(FooBar, {});
});
