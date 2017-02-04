import { default as React } from "react";

import { renderToStream, streamTemplate } from "../src";


describe("stream templates", () => {
  it("renders string-only templates", () => {
    const tmpl = streamTemplate`this is my content`;

    let output = "";
    return tmpl.observe(segment => output += segment).then(() => {
      expect(output).to.equal("this is my content");
    });
  });

  it("renders component streams", () => {
    const A = () => (
      <div>
        component content
      </div>
    );

    const tmpl = streamTemplate`before${renderToStream(<A />)}after`;

    let output = "";
    let segmentCount = 0;

    return tmpl.observe(segment => {
      output += segment;
      segmentCount++;
    }).then(() => {
      expect(output).to.equal("before<div>component content</div>after");
      expect(segmentCount).to.be.above(1);
    });
  });

  it("renders function content", () => {
    const tmpl = streamTemplate`before${() => "-middle-"}after`;

    let output = "";
    let segmentCount = 0;

    return tmpl.observe(segment => {
      output += segment;
      segmentCount++;
    }).then(() => {
      expect(output).to.equal("before-middle-after");
      expect(segmentCount).to.be.above(1);
    });
  });

  it("renders functions after components have been evaluated", () => {
    let someState = "before";

    const A = () => {
      someState = "after";
      return <div />;
    };

    const tmpl = streamTemplate`${renderToStream(<A />)}${() => someState}`;

    let output = "";

    return tmpl.observe(segment => {
      output += segment;
    }).then(() => {
      expect(output).to.equal("<div></div>after");
    });
  });
});
