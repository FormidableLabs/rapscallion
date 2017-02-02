import { default as React } from "react";
import { range } from "lodash";

import ssrAsync from "../src";


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


const padLeft = str => `     ${str}`.slice(-6);

range(5).forEach(idx => {
  const bigComponent = (
    <Component
      depth={6}
      leafText={`leaf for ${idx}`}
    />
  );
  setTimeout(() => {
    ssrAsync.renderToStream(bigComponent)
      .observe(segment => console.log(`${padLeft(idx)} --> ${segment}`))
      .then(() => console.log(`${padLeft(idx)} --> DONE!`))    
  }, 1 * idx);
});
