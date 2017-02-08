import { default as React } from "react";

import { template, render } from "../src";
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
  return <div />;
};

const getTemplateRenderer = componentRenderer => template`
  <html>
    <body>
      ${ getSomeState }
      ${ componentRenderer }
      ${ getSomeState }
    </body>
  </html>
`;

const componentRenderer = render(<MyComponent prop="stuff" />);
const htmlRenderer = getTemplateRenderer(componentRenderer);
htmlRenderer
  .toStream()
  .on("data", segment => process.stdout.write(alternateColor(segment)));
