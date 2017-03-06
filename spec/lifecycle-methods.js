import { default as React, Component } from "react";

import { render } from "../src";

import { checkElementParity } from "./_util";

class C extends Component {
  constructor (...args) {
    super(...args);

    this.state = { val: "not-set" };
  }

  componentWillMount () {
    if (this.props.cb) { this.props.cb(this); }
  }

  render () {
    return (
      <div>
        {this.state.val}
      </div>
    );
  }
}


describe("lifecycle methods", () => {
  it("calls componentWillMount on stateful components", () => {
    const cb = sinon.spy();
    return render(<C cb={cb} />).includeDataReactAttrs(false).toPromise().then(() => {
      expect(cb).to.have.been.calledOnce;
    });
  });

  it("allows state to be set", () => {
    const cb = instance => instance.setState({ val: "set" });

    return render(<C cb={cb} />).includeDataReactAttrs(false).toPromise().then(html => {
      expect(html).to.equal("<div>set</div>");
    });
  });

  it("allows atomic state updates, with prevState and props", () => {
    const cb = instance =>
      instance.setState((prevState, props) => {
        return {
          val: `was ${prevState.val}, now is set, can get at ${props.myProp}`
        };
      });

    return render(<C cb={cb} myProp="myProp" />)
      .includeDataReactAttrs(false)
      .toPromise().then(html => {
        expect(html).to.equal("<div>was not-set, now is set, can get at myProp</div>");
      });
  });

  it("invokes provided setState callbacks", () => {
    const setStateCb = sinon.spy();

    let _instance;
    const cb = instance => {
      _instance = instance;
      instance.setState({}, setStateCb);
    };

    return render(<C cb={cb} />).includeDataReactAttrs(false).toPromise().then(() => {
      expect(setStateCb)
        .to.have.been.calledOnce.and
        .to.have.been.calledOn(_instance);
    });
  });

  it("supports recursive setState invocations", () => {
    const cb = instance =>
      instance.setState({ val: "set" }, function () {
        // eslint-disable-next-line no-invalid-this
        this.setState({ val: "set-again" });
      });

    return render(<C cb={cb} />).includeDataReactAttrs(false).toPromise().then(html => {
      expect(html).to.equal("<div>set-again</div>");
    });
  });

  describe("with a getInitialState call for createClass components", () => {
    const InitalStateComponent = React.createClass({ // eslint-disable-line react/prefer-es6-class
      getInitialState () {
        return { text: "foo" };
      },
      render () {
        return <div>{this.state.text}</div>;
      }
    });
    checkElementParity(<InitalStateComponent />);
  });

});
