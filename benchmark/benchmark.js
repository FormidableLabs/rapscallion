import { default as React } from "react";
import { renderToString } from "react-dom/server";
import { range } from "lodash";

import { render } from "..";
import { time } from "./_util";
import PrerenderedComponent from "./prerendered-component";

// Accessing process.env.NODE_ENV is expensive.
// Replace process.env to equivalent plain JS objects.
process.env = Object.assign({}, process.env);

// Make sure React is in production mode.
process.env.NODE_ENV = "production";


const CONCURRENCY = 10;
const DEPTH = 8;
const CACHE_DIVS = "CACHE_DIVS";
const CACHE_COMPONENT = "CACHE_COMPONENT";


const Component = ({ depth, leafText, cacheMe }) => {
  if (depth === 1) {
    return (
      <div>
        <span>This is static leaf content.</span>
        <div>
          {leafText}
        </div>
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
      <span>This is static sibling content.</span>
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

let baseTime;
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
      ),
      _baseTime => baseTime = _baseTime
    )
  )
  .then(() =>
    time(
      "rapscallion, no caching",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          render(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
            />
          ).toPromise()
        )
      ),
      baseTime
    )
  )
  .then(() =>
    time(
      "rapscallion, caching DIVs",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          render(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
              cacheMe={CACHE_DIVS}
            />
          ).toPromise()
        )
      ),
      baseTime
    )
  )
  .then(() =>
    time(
      "rapscallion, caching DIVs (second time)",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          render(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
              cacheMe={CACHE_DIVS}
            />
          ).toPromise()
        )
      ),
      baseTime
    )
  )
  .then(() =>
    time(
      "rapscallion, caching Components",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          render(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
              cacheMe={CACHE_COMPONENT}
            />
          ).toPromise()
        )
      ),
      baseTime
    )
  )
  .then(() =>
    time(
      "rapscallion, caching Components (second time)",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          render(
            <Component
              depth={DEPTH}
              leafText="hi there! © <"
              cacheMe={CACHE_COMPONENT}
            />
          ).toPromise()
        )
      ),
      baseTime
    )
  )
  .then(() =>
    time(
      "rapscallion, pre-rendered",
      () => Promise.all(
        range(CONCURRENCY).map(() =>
          render(
            <PrerenderedComponent
              depth={DEPTH}
              leafText="hi there! © <"
            />
          ).toPromise()
        )
      ),
      baseTime
    )
  );
