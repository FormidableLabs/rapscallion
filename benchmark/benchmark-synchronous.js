import { default as React } from "react";
import { renderToString } from "react-dom/server";
import { range } from "lodash";

import ssrAsync from "../src";
import { time } from "./_util";


const DEPTH = 8;


const Component = ({ depth, leafText }) => {
  if (depth === 1) {
    return (
      <div>
        {leafText}
      </div>
    );
  }

  const newDepth = depth - 1;
  return (
    <div>
      {
        range(depth).map(idx => (
          <Component
            depth={newDepth}
            leafText={leafText}
            key={idx}
          />
        ))
      }
    </div>
  );
};

console.log("Starting benchmark...");

Promise.resolve()
  .then(() =>
    time(
      "renderToString",
      () => renderToString(
        <Component
          depth={DEPTH}
          leafText="hi there! © <"
        />
      )
    )
  )
  .then(processorKiller =>
    time(
      "react-ssr-async",
      () => ssrAsync.renterToString(
        <Component
          depth={DEPTH}
          leafText="hi there! © <"
        />,
        true
      )
    )
  );
