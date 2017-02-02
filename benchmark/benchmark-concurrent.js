import { default as React } from "react";
import { renderToString } from "react-dom/server";
import { range } from "lodash";

import ssrAsync from "../src";
import { time } from "./_util";


const CONCURRENCY = 4;
const DEPTH = 7;


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


console.log(`Starting benchmark for ${CONCURRENCY} concurrent render operations...`);

Promise.resolve()
  .then(() =>
    time(
      "renderToString",
      () => range(CONCURRENCY).forEach(() =>
        renderToString(
          <Component
            depth={DEPTH}
            leafText="hi there! © <"
          />
        )          
      )
    )
  )
  .then(processorKiller =>
    time(
      "react-ssr-async",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          ssrAsync.renterToString(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
            />
          )
        )
      )
    )
  );

