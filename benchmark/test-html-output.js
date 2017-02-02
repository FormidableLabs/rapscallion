import { default as React } from "react";
import ssrAsync from "../src";


const A = ({ prop }) => {
  return (
    <div stuff="hello" disabled>
      <B a={ prop } />
    </div>
  );
};

const B = ({ a }) => {
  return (
    <span onClick="things">
      { a }
      <C a={a}>
        hi there! ©
        { "stuff <" }
      </C>
    </span>
  );
};

const C = ({ a, children }) => {
  return (
    <div>
      <span stuff things="hi" also={ "stuff" }>{a}</span>
      <span>{ children }</span>
    </div>
  );
}

ssrAsync.asPromise(<A prop="stuff" />)
  .then(html => console.log(html));
