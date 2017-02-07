import { default as React } from "react";
import { renderToString as reactRenderToString } from "react-dom/server";

import { renderToString } from "../src";


describe("parity", () => {
  it("renderToString has parity with ReactDOMServer.renderToString", () => {

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

    return renderToString(<FooBar />)
      .then(htmlString => {
        expect(htmlString).to.equal(reactRenderToString(<FooBar />));
      });
  });
});
