# Rapscallion

[![CircleCI](https://circleci.com/gh/FormidableLabs/rapscallion.svg?style=svg)](https://circleci.com/gh/FormidableLabs/rapscallion) [![Join the chat at https://gitter.im/FormidableLabs/rapscallion](https://badges.gitter.im/FormidableLabs/rapscallion.svg)](https://gitter.im/FormidableLabs/rapscallion?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Overview

Rapscallion is a React VirtualDOM renderer for the server.  Its notable features are as follows:

- Rendering is **asynchronous and non-blocking**.
- With no concurrent renders, Rapscallion is roughly the same speed as React's `renderToString`.
- With 10 **concurrent renders**, Rapscallion is roughly **twice the speed** of `renderToString`.
- It provides a streaming interface so that you can **start sending content to the client immediately**.
- It provides a stream templating feature, so that you can **wrap your component's HTML in boilerplate** without giving up benefits of streaming.
- It provides a **component caching** API to further speed-up your rendering.

Big thanks to @briancavalier for his fantastic [Most.js](https://github.com/cujojs/most) library!


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
  renderToStream,
  renderToString,
  toNodeStream,
  streamTemplate,
  tuneAsynchronicity
} = require("rapscallion");

// ...
```


## API


### `renderToString`

`renderToString(VirtualDomNode) -> Promise<String>`

This function evaluates a React VirtualDOM Element, and returns a Promise that resolves to the component's evaluated HTML string.

**Example:**

```javascript
renderToString(<MyComponent {...props} />)
    .then(htmlString => console.log(htmlString));
```


-----

### `renderToStream`

`renderToStream(VirtualDomNode) -> MostStream<StringSegment>`

This function evalues a React VirtualDOM Element, and returns a [Most.js](https://github.com/cujojs/most) stream.  This stream will emit string segments of HTML as the DOM tree is asynchronously traversed and evaluated.

**Example:**

```javascript
const componentStream = renderToStream(<MyComponent prop="stuff" />);
componentStream.observe(segment => process.stdout.write(segment));
```


-----

### `toNodeStream`

`toNodeStream(MostStream<StringSegment>) -> NodeStream<StringSegment>`

This function translates [Most.js](https://github.com/cujojs/most) streams to Node streams.  You'll be able to pipe the output of these Node streams to an HTTP Response object or to disk.

**Example:**

```javascript
app.get('/example', function(req, res){
  const componentHtmlStream = renderToStream(<MyComponent />);
  toNodeStream(componentHtmlStream).pipe(res);
});
```


-----

### `streamTemplate`

``streamTemplate`TEMPLATE LITERAL` -> MostStream<StringSegment>``

See the [section below](#stream-templates) for usage instructions.


-----

### `tuneAsynchronicity`

`tuneAsynchronicity(PositiveInteger)`

Rapscallion allows you to tune the asynchronicity of your renders.  By default, rapscallion batches events in your stream of HTML segments.  These batches are processed in a synchronous-like way.  This gives you the benefits of asynchronous rendering without losing too much synchronous rendering performance.

The default value is `100` and equates to the approximate speed-performance of React's `renderToString`.  With this value, Rapscallion takes about the same amount of time as React to render a VirtualDOM tree.

However, you may want to change this number if your server is under heavy load.  Possible values are the set of all positive integers.  Lower numbers will be "more asynchronous" (shorter periods between I/O processing) and higher numbers will be "more synchronous" (higher performance).


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
  .then(() => renderToString(<Parent toVal={5} />))
  // The second render will be much faster, due to multiple cache hits.
  .then(() => renderToString(<Parent toVal={6} />))
  // The third render will be near-instantaneous, due to a top-level cache hit.
  .then(() => renderToString(<Parent toVal={6} />));
```


## Stream templates

With React's default `renderToString`, it is a common pattern to define a function that takes the rendered output and inserts it into some HTML boilerplate; `<html>` tags and the like.

Rapscallion allows you to stream the rendered content of your components as they are generated.  However, this makes it somewhat less simple to wrap that component in your HTML boilerplate.

Fortunately, Rapscallion provides _stream templates_.  They look very similar to normal template strings, with a couple of exceptions.

1. You add `streamTemplate` as a [template literal tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals).
2. Using template literals' expression interpolation, you can insert streams into the template.
3. You can also insert functions into the template that will be evaluated after the previous content has been streamed.

The return value is a [Most.js](https://github.com/cujojs/most) stream.

That may not be clear in the abstract, so here's an example:

```javascript
import { renderToStream, streamTemplate, toNodeStream } from "rapscallion";

// ...

app.get('/example', function(req, res){
  // ...

  const store = createStore(/* ... */);
  const componentHtmlStream = renderToStream(<MyComponent store={store} />);

  const responseStream = streamTemplate`
    <html>
    <body>
      ${componentHtmlStream}
      <script>
        window._initialState = ${() => JSON.stringify(store.getState())};
      </script>
    </body>
    </html>
  `;

  toNodeStream(responseStream).pipe(res);
});
```

Note that the template includes both a stream of HTML text (`componentHtmlStream`) and a function that evaluates to the store's state - something you'll often want to do with SSR.


## Benchmarks

The below benchmarks _do not_ represent a typical use-case.  Instead, they represent the absolute _best case scenario_ for component caching - up to 2,100x faster!

However, you'll note that even without caching, a concurrent workload will be processed in roughly half the time of React, without any of the blocking!

```
Starting benchmark for 10 concurrent render operations...
renderToString took 6.595226639 seconds.
rapscallion, no caching took 3.490436779 seconds.
rapscallion, caching DIVs took 0.814969248 seconds.
rapscallion, caching DIVs (second time) took 0.002369651 seconds.
rapscallion, caching Components took 0.123907298 seconds.
rapscallion, caching Components (second time) took 0.003139111 seconds.
```


## License

[MIT License](http://opensource.org/licenses/MIT)
