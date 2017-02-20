import { default as React } from "react";

import { render, template } from "../src";


function resolveStreamOnDone (stream, cb) {
  return new Promise(resolve => {
    stream
      .on("data", cb)
      .on("end", resolve);
  });
}


describe("stream templates", () => {
  it("renders string-only templates", () => {
    const tmpl = template`this is my content`;

    let output = "";
    return resolveStreamOnDone(
      tmpl.toStream(),
      segment => output += segment
    ).then(() => {
      expect(output).to.equal("this is my content");
    });
  });

  it("renders components", () => {
    const A = () => (
      <div>
        component content
      </div>
    );

    const tmpl = template`before${render(<A />)}after`;

    let output = "";
    let segmentCount = 0;

    return resolveStreamOnDone(
      tmpl.includeDataReactAttrs(false).toStream(),
      segment => {
        output += segment;
        segmentCount++;
      }
    ).then(() => {
      expect(output).to.equal("before<div>component content</div>after");
      expect(segmentCount).to.be.above(1);
    });
  });

  it("renders function content", () => {
    const tmpl = template`before${() => "-middle-"}after`;

    let output = "";
    let segmentCount = 0;

    return resolveStreamOnDone(
      tmpl.includeDataReactAttrs(false).toStream(),
      segment => {
        output += segment;
        segmentCount++;
      }
    ).then(() => {
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

    const tmpl = template`${() => someState}${render(<B />)}${() => someState}`;

    let output = "";

    return resolveStreamOnDone(
      tmpl.includeDataReactAttrs(false).toStream(),
      segment => output += segment
    ).then(() => {
      expect(output).to.equal("before<div><div></div></div>after");
    });
  });

  it("supports template composition", () => {
    const A = () => <div>A</div>;
    const B = () => <div>B</div>;
    const tmpl = template`${render(<A />)}-${render(<B />)}`;

    let output = "";
    return resolveStreamOnDone(
      tmpl.includeDataReactAttrs(false).toStream(),
      segment => output += segment
    ).then(() => {
      expect(output).to.equal("<div>A</div>-<div>B</div>");
    });

  });
});
