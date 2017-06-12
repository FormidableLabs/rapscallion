import { default as React } from "react";

import { render } from "../src";

const renderError = new Error("render error");

function ErrorComponent () {
  const throwError = () => {
    throw renderError;
  };

  return <div>{throwError()}</div>;
}

describe("should catch render errors", () => {
  it("toPromise", () => {
    const thenSpy = sinon.spy();
    const catchSpy = sinon.spy();
    return render(<ErrorComponent />).toPromise()
      .catch(catchSpy).then(() => {
        expect(thenSpy).to.not.have.been.called;
        expect(catchSpy).to.have.been.calledWith(renderError);
      });
  });
  it("toStream", () => {
    const dataSpy = sinon.spy();
    const errorSpy = sinon.spy();
    return new Promise(resolve => {
      render(<ErrorComponent />).toStream()
        .on("data", () => {
          dataSpy();
          resolve();
        })
        .on("error", err => {
          errorSpy(err);
          resolve();
        });
    }).then(() => {
      expect(dataSpy).to.not.have.been.called;
      expect(errorSpy).to.have.been.calledWith(renderError);
    });
  });
});
