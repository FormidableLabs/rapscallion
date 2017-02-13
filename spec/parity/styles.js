import { default as React } from "react";


const Component = () => (
  <div
    style={{
      padding: 10,
      margin: 15,
      opacity: 1,
      animationIterationCount: 1,
      animationName: "foobar",
      fontSize: 15
    }}
  />
);


const description = "style prop";

export {
  description,
  Component
};
