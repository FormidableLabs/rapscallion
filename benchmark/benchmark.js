import { default as React } from "react";
import { renderToString as renderToStringReact } from "react-dom/server";
import { range } from "lodash";

import { renderToString } from "../src";
import { time } from "./_util";


const CONCURRENCY = 10;
const DEPTH = 7;
const CACHE_DIVS = "CACHE_DIVS";
const CACHE_COMPONENT = "CACHE_COMPONENT";


const Component = ({ depth, leafText, cacheMe }) => {
  if (depth === 1) {
    return (
      <div>
        {leafText}
      </div>
    );
  }

  const newDepth = depth - 1;
  return (
    <div
      cacheKey={
        cacheMe === CACHE_DIVS ?
          `Div:${depth}` :
          null
      }
    >
      {
        range(depth).map(idx => (
          <Component
            depth={newDepth}
            leafText={leafText}
            key={idx}
            cacheKey={
              cacheMe === CACHE_COMPONENT ?
                `Component:${depth}` :
                null
            }
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
        renderToStringReact(
          <Component
            depth={DEPTH}
            leafText="hi there! © <"
          />
        )
      )
    )
  )
  .then(() =>
    time(
      "rapscallion, no caching",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          renderToString(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
            />
          )
        )
      )
    )
  )
  .then(() =>
    time(
      "rapscallion, caching DIVs",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          renderToString(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
              cacheMe={CACHE_DIVS}
            />
          )
        )
      )
    )
  )
  .then(() =>
    time(
      "rapscallion, caching DIVs (second time)",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          renderToString(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
              cacheMe={CACHE_DIVS}
            />
          )
        )
      )
    )
  )
  .then(() =>
    time(
      "rapscallion, caching Components",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          renderToString(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
              cacheMe={CACHE_COMPONENT}
            />
          )
        )
      )
    )
  )
  .then(() =>
    time(
      "rapscallion, caching Components (second time)",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          renderToString(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
              cacheMe={CACHE_COMPONENT}
            />
          )
        )
      )
    )
  );
