/* eslint-disable filenames/match-regex */
import { default as React } from "react";
import { renderToString as reactRenderToString } from "react-dom/server";

import { render } from "../src";


const TAG_END = /\/?>/;

function resolveStreamOnDone (stream, cb) {
  return new Promise(resolve => {
    stream
      .on("data", cb)
      .on("end", resolve);
  });
}


export const checkParity = (Component, props) => {
  it("has parity with React#renderToString via Render#toPromise", () => {
    return render(<Component {...props} />)
      .toPromise()
      .then(htmlString => {
        expect(htmlString).to.equal(reactRenderToString(<Component {...props} />));
      });
  });
  it("has parity with React#renderToString via Render#toStream", () => {
    const stream = render(<Component {...props} />).toStream();

    let output = "";
    return resolveStreamOnDone(stream, segment => output += segment)
      .then(() => {
        const checksum = stream.checksum();
        output = output.replace(TAG_END, ` data-react-checksum="${checksum}"$&`);

        expect(output).to.equal(reactRenderToString(<Component {...props} />));
      });
  });
};
