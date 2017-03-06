import { default as React } from "react";
import { range } from "lodash";


const CACHE_DIVS = "CACHE_DIVS";
const CACHE_COMPONENT = "CACHE_COMPONENT";


const Component = module.exports = ({ depth, leafText, cacheMe }) => {
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
