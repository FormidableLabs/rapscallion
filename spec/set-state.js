import { checkParity, getRootNode } from "./_util";

describe("setState", () => {
  const code = `
  class FooBar extends React.Component {
    componentWillMount() {
      this.setState({x: 'bar'});
    }

    render() {
      return <div>{this.state.x}</div>;
    }
  }

  return FooBar;
  `;

  const FooBar = getRootNode(code);
  checkParity(FooBar, {});
});

describe("setState with callback", () => {
  const code = `
  class FooBar extends React.Component {
    componentWillMount() {
      this.setState({x: 'bar'}, function() {
        this.setState({x: 'foo'});
      });
    }

    render() {
      return <div>{this.state.x}</div>;
    }
  }

  return FooBar;
  `;

  const FooBar = getRootNode(code);
  checkParity(FooBar, {});
});
