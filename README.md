# Rapscallion

## Overview

Rapscallion is a React virtual-dom renderer for the server.  Its notable features are as follows:

- Rendering is **asynchronous and non-blocking**.
- With no concurrent renders, Rapscallion is roughly the same speed as React's `renderToString`.
- With 10 **concurrent renders**, Rapscallion is roughly **twice the speed** as `renderToString`.
- It provides a streaming interface so that you can start sending content to the client immediately.
- It provides a stream templating feature, so that you can wrap your component's HTML in boilerplate without giving up benefits of streaming.
- It provides a component caching API to further speed-up your rendering (stats on that [below](#caching)).


## Getting Started

TODO


## Caching

Caching is performed on a per-component level, is completely opt-in, and should be used judiciously.  The gist is this: you define a `cacheKey` prop on your component, and that component will only be rendered once for that particular key.

If you cache components that change often, this will result in slower performance.  But if you're careful to cache only those components for which 1) a `cacheKey` is easy to compute, and 2) will have a small set of keys (i.e. the props don't change often), you can see considerable performance improvements.

The below benchmarks _do not_ represent a typical use-case.  Instead, they represent the absolute _best case scenario_ for component caching - up to 2,100x faster!

```
Starting benchmark for 10 concurrent render operations...
renderToString took 6.595226639 seconds.
rapscallion, no caching took 3.490436779 seconds.
rapscallion, caching DIVs took 0.814969248 seconds.
rapscallion, caching DIVs (second time) took 0.002369651 seconds.
rapscallion, caching Components took 0.123907298 seconds.
rapscallion, caching Components (second time) took 0.003139111 seconds.
```

## API

TODO

### `renderToString`

`renderToString(VirtualDomNode) -> Promise<String>`

### `renderToStream`

`renderToStream(VirtualDomNode) -> MostStream<StringSegment>`

### `toNodeStream`

`toNodeStream(MostStream<StringSegment>) -> NodeStream<StringSegment>`

### `streamTemplate`

``streamTemplate`TEMPLATE LITERAL` -> MostStream<StringSegment>``

### `tuneAsynchronicity`

`tuneAsynchronicity(PositiveInteger)`

Rapscallion allows you to tune the asynchronicity of your renders.  By default, rapscallion batches events in your stream of HTML segments.  These batches are processed in a synchronous-like way.  This gives you the benefits of asynchronous rendering without losing too much synchronous rendering performance.

The default value is `100` and equates to the approximate speed-performance of React's `renderToString`, i.e. rapscallion takes about the same amount of time as React.

However, you may want to tune this number if your server is under heavy load.  Possible values are all positive integers.  Lower numbers will be "more asynchronous" and higher numbers will be "more synchronous".


## Example

TODO


## License

[MIT License](http://opensource.org/licenses/MIT)
