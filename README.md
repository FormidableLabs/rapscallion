# Rapscallion

[![CircleCI](https://circleci.com/gh/FormidableLabs/rapscallion.svg?style=svg)](https://circleci.com/gh/FormidableLabs/rapscallion) [![Join the chat at https://gitter.im/FormidableLabs/rapscallion](https://badges.gitter.im/FormidableLabs/rapscallion.svg)](https://gitter.im/FormidableLabs/rapscallion?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Overview

Rapscallion is a React VirtualDOM renderer for the server.  Its notable features are as follows:

- Rendering is **asynchronous and non-blocking**.
- With no concurrent renders, Rapscallion is roughly the same speed as React's `renderToString`.
- With 10 **concurrent renders**, Rapscallion is roughly **twice the speed** of `renderToString`.
- It provides a streaming interface so that you can **start sending content to the client immediately**.
- It provides a templating feature, so that you can **wrap your component's HTML in boilerplate** without giving up benefits of streaming.
- It provides a **component caching** API to further speed-up your rendering.


## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [API](#api)
  - [`renderToString`](#rendertostring)
  - [`renderToStream`](#rendertostream)
  - [`toNodeStream`](#tonodestream)
  - [`streamTemplate`](#streamtemplate)
  - [`tuneAsynchronicity`](#tuneasynchronicity)
- [Caching](#caching)
- [Stream templates](#stream-templates)
- [Benchmarks](#benchmarks)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

Using npm:
```shell
$ npm install --save rapscallion
```

In Node.js:
```javascript
const {
  render,
  template
} = require("rapscallion");

// ...
```


## Top-level API


### `render`

`render(VirtualDomNode) -> Renderer`

This function returns a Renderer, an interface for rendering your VirtualDOM element.  Methods are enumerated below.

-----

### `Renderer#toPromise`

`renderer.toPromise() -> Promise<String>`

This function evaluates the React VirtualDOM Element originally provided to the renderer, and returns a Promise that resolves to the component's evaluated HTML string.

**Example:**

```javascript
render(<MyComponent {...props} />)
  .toPromise()
  .then(htmlString => console.log(htmlString));
```


-----

### `Renderer#toStream`

`renderer.toStream() -> NodeStream<StringSegment>`

This function evaluates a React VirtualDOM Element, and returns a Node stream.  This stream will emit string segments of HTML as the DOM tree is asynchronously traversed and evaluated.

**Example:**

```javascript
app.get('/example', function(req, res){
  render(<MyComponent prop="stuff" />)
    .toStream()
    .pipe(res);
});
```


-----

### `Renderer#tuneAsynchronicity`

`renderer.tuneAsynchronicity(PositiveInteger) -> undefined`

Rapscallion allows you to tune the asynchronicity of your renders.  By default, rapscallion batches events in your stream of HTML segments.  These batches are processed in a synchronous-like way.  This gives you the benefits of asynchronous rendering without losing too much synchronous rendering performance.

The default value is `100`, which means the Rapscallion will process one hundred segments of HTML text before giving control back to the event loop.

You may want to change this number if your server is under heavy load.  Possible values are the set of all positive integers.  Lower numbers will be "more asynchronous" (shorter periods between I/O processing) and higher numbers will be "more synchronous" (higher performance).


-----

### `template`

``template`TEMPLATE LITERAL` -> Renderer``

With React's default `renderToString`, it is a common pattern to define a function that takes the rendered output and inserts it into some HTML boilerplate; `<html>` tags and the like.

Rapscallion allows you to stream the rendered content of your components as they are generated.  However, this makes it somewhat less simple to wrap that component in your HTML boilerplate.

Fortunately, Rapscallion provides _streaming templates_.  They look very similar to normal template strings, with a couple of exceptions.

1. You add `template` as a [template-literal tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals).
2. Using template-literal expression interpolation, you can insert streams into the template.
3. You can also insert functions into the template that will be evaluated after the previous content has been streamed.

The return value is a Renderer.

That may not be clear in the abstract, so here's an example:

```javascript
import { render, template } from "rapscallion";

// ...

app.get('/example', function(req, res){
  // ...

  const store = createStore(/* ... */);
  const componentRenderer = render(<MyComponent store={store} />);

  const responseRenderer = streamTemplate`
    <html>
    <body>
      ${componentRenderer}
      <script>
        window._initialState = ${() => JSON.stringify(store.getState())};
      </script>
    </body>
    </html>
  `;

  responseRenderer.toStream().pipe(res);
});
```

Note that the template comprises a stream of HTML text (`componentRenderer`) and a function that evaluates to the store's state - something you'll often want to do with SSR.


## Caching

Caching is performed on a per-component level, is completely opt-in, and should be used judiciously.  The gist is this: you define a `cacheKey` prop on your component, and that component will only be rendered once for that particular key. `cacheKey` can be set on both React components and html React elements.

If you cache components that change often, this will result in slower performance.  But if you're careful to cache only those components for which 1) a `cacheKey` is easy to compute, and 2) will have a small set of keys (i.e. the props don't change often), you can see considerable performance improvements.

**Example:**

```javascript
const Child = ({ val }) => (
  <div>
    ComponentA
  </div>
);

const Parent = ({ toVal }) => (
  <div cacheKey={ `Parent:${toVal}` }>
    {
      _.range(toVal).map(val => (
        <Child cacheKey={ `Child:${val}` } key={val} />
      ))
    }
  </div>
);

Promise.resolve()
  // The first render will take the expected duration.
  .then(() => render(<Parent toVal={5} />).toPromise())
  // The second render will be much faster, due to multiple cache hits.
  .then(() => render(<Parent toVal={6} />).toPromise())
  // The third render will be near-instantaneous, due to a top-level cache hit.
  .then(() => render(<Parent toVal={6} />).toPromise());
```


## Benchmarks

The below benchmarks _do not_ represent a typical use-case.  Instead, they represent the absolute _best case scenario_ for component caching - up to 1,200x faster!

However, you'll note that even without caching, a concurrent workload will be processed 50% faster, without any of the blocking!

```
Starting benchmark for 10 concurrent render operations...
renderToString took 1.388883695 seconds
rapscallion, no caching took 0.962666792 seconds; ~1.44x faster
rapscallion, caching DIVs took 0.215825732 seconds; ~6.43x faster
rapscallion, caching DIVs (second time) took 0.003815807 seconds; ~363.98x faster
rapscallion, caching Components took 0.086096541 seconds; ~16.13x faster
rapscallion, caching Components (second time) took 0.001247051 seconds; ~1113.73x faster
```


## License

[MIT License](http://opensource.org/licenses/MIT)
