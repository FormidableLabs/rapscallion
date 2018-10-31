/* eslint-disable filenames/match-regex */
import { default as React } from "react";

import {
  renderToString as reactRenderToString,
  renderToStaticMarkup as reactRenderToStaticMarkup
} from "react-dom/server";

import { transform } from "babel-core";

import { render } from "../src";


const TAG_END = /\/?>/;

function resolveStreamOnDone (stream, cb) {
  return new Promise(resolve => {
    stream
      .on("data", cb)
      .on("end", resolve);
  });
}

export const checkParity = (Component, expectChecksum = true) => {
  describe("via React.createElement", () => {
    it("has parity with React#renderToString via Render#toPromise", () => {
      return render(<Component />)
        .toPromise()
        .then(htmlString => {
          expect(htmlString).to.equal(reactRenderToString(<Component />));
        });
    });
    it("has parity with React#renderToString via Render#toStream", () => {
      const renderer = render(<Component />);
      const stream = renderer.toStream();

      let output = "";
      return resolveStreamOnDone(stream, segment => output += segment)
        .then(() => {
          if (expectChecksum) {
            const checksum = renderer.checksum();
            output = output.replace(TAG_END, ` data-react-checksum="${checksum}"$&`);
          }

          expect(output).to.equal(reactRenderToString(<Component />));
        });
    });
    it("has parity with React#renderToStaticMarkup via Render#toPromise", () => {
      return render(<Component />)
        .includeDataReactAttrs(false)
        .toPromise()
        .then(htmlString => {
          expect(htmlString).to.equal(reactRenderToStaticMarkup(<Component />));
        });
    });
    it("has parity with React#renderToStaticMarkup via Render#toStream", () => {
      const stream = render(<Component />)
        .includeDataReactAttrs(false)
        .toStream();

      let output = "";
      return resolveStreamOnDone(stream, segment => output += segment)
        .then(() => {
          expect(output).to.equal(reactRenderToStaticMarkup(<Component />));
        });
    });
  });

  if (!Component.preVDOM) { return; }

  describe("via pre-rendered VDOM", () => {
    const prerenderedRootNode = {
      __prerendered__: "component",
      type: Component.preVDOM,
      children: []
    };
    it("has parity with React#renderToString via Render#toPromise", () => {
      return render(prerenderedRootNode)
        .toPromise()
        .then(htmlString => {
          expect(htmlString).to.equal(reactRenderToString(<Component />));
        });
    });
    it("has parity with React#renderToString via Render#toStream", () => {
      const renderer = render(prerenderedRootNode);
      const stream = renderer.toStream();

      let output = "";
      return resolveStreamOnDone(stream, segment => output += segment)
        .then(() => {
          if (expectChecksum) {
            const checksum = renderer.checksum();
            output = output.replace(TAG_END, ` data-react-checksum="${checksum}"$&`);
          }
          expect(output).to.equal(reactRenderToString(<Component />));
        });
    });
  });
};

export const checkElementParity = (element, expectChecksum) => {
  return checkParity(() => element, expectChecksum);
};

const serverPluginPath = require.resolve("../src/transform/server");

const getBabelConfig = forPrerendered => ({
  ast: false,
  babelrc: false,
  parserOpts: {
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true
  },
  plugins: [
    forPrerendered ? serverPluginPath : null,
    forPrerendered ? "transform-object-rest-spread" : null,
    !forPrerendered ? "transform-react-jsx" : null,
    "transform-es2015-modules-commonjs",
    "transform-es2015-arrow-functions"
  ].filter(x => x)
});
// eslint-disable-next-line no-new-func
const evalCode = code => (new Function("React", "require", code))(React, require);

export const getRootNode = code => {
  const createElementCode = transform(code, getBabelConfig(false)).code;
  const prerenderedCode = transform(code, getBabelConfig(true)).code;
  const el = evalCode(createElementCode);
  el.preVDOM = evalCode(prerenderedCode);
  return el;
};
