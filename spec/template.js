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

  it("renders template segments asynchronously in order", () => {
    let someState = "before";

    const A = () => {
      someState = "after";
      return <div />;
    };

    const B = () => {
      return (
        <div>
          <A />
        </div>
      );
    };

    const tmpl = streamTemplate`${() => someState}${renderToStream(<B />)}${() => someState}`;

    let output = "";

    return tmpl.observe(segment => {
      output += segment;
    }).then(() => {
      expect(output).to.equal("before<div><div></div></div>after");
    });
  });
});
