import { default as React } from "react";

import { streamTemplate, renderToStream } from "../src";
import { alternateColor } from "./_util";


let someState = "STATE BEFORE RENDERING";
const getSomeState = () => someState;


const MyComponent = ({ prop }) => {
  return (
    <div stuff="hello" disabled>
      <span className={ prop } />
      <span>{ "other things" }</span>
      <Child />
    </div>
  );
};

const Child = () => {
  someState = "STATE AFTER RENDERING";
  return <div />
};

const getTemplatedStream = componentStream => streamTemplate`
  <html>
    <body>
      ${ getSomeState }
      ${ componentStream }
      ${ getSomeState }
    </body>
  </html>
`;

const componentStream = renderToStream(<MyComponent prop="stuff" />);
const htmlStream = getTemplatedStream(componentStream);
htmlStream.observe(segment => process.stdout.write(alternateColor(segment)));
