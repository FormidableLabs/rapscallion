import { readdirSync, statSync } from "fs";
import path from "path";

import { default as React } from "react";
import { renderToString as reactRenderToString } from "react-dom/server";

import { render } from "../../src";


const TAG_END = /\/?>/;
const IS_INDEX = /index\.js$/;


function getFiles (srcpath) {
  return readdirSync(srcpath)
    .map(filename => path.join(srcpath, filename))
    .filter(fullPath =>
      statSync(fullPath).isFile() &&
      !IS_INDEX.test(fullPath)
    );
}

function resolveStreamOnDone (stream, cb) {
  return new Promise(resolve => {
    stream
      .on("data", cb)
      .on("end", resolve);
  });
}


describe("when compared to ReactDOMServer.renderToString", () => {
  // eslint-disable-next-line no-undef
  getFiles(__dirname).map(require).forEach(({ description, props, Component }) => {
    describe(description, () => {
      it("has parity with Render#toPromise", () => {
        return render(<Component {...props} />)
          .toPromise()
          .then(htmlString => {
            expect(htmlString).to.equal(reactRenderToString(<Component {...props} />));
          });
      });
      it("has parity with Render#toStream", () => {
        const stream = render(<Component {...props} />).toStream();

        let output = "";
        return resolveStreamOnDone(stream, segment => output += segment)
          .then(() => {
            const checksum = stream.checksum();
            output = output.replace(TAG_END, ` data-react-checksum="${checksum}"$&`);

            expect(output).to.equal(reactRenderToString(<Component {...props} />));
          });
      });
    });
  });
});
