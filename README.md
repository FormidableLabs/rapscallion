## Overview

Rapscallion is a React virtual-dom renderer for the server.It's notable features are as follows:

- Rendering is **asynchronous and non-blocking**.
- With no concurrent renders, Rapscallion is the same speed as React's `renderToString`.
- With 10 **concurrent renders**, Rapscallion is roughly **twice the speed** as `renderToString`.
- It provides a streaming interface so that you can start sending content to the user immediately.
- It provides a stream templating feature, so that you can wrap your component's HTML in boilerplate without giving up benefits of streaming.
- It provides a component caching API to further speed-up your rendering (stats on that [below](#caching)).


## Getting Started

TODO


## Caching

Component render caching is opt-in, and should be used judiciously.  The gist is this: you define a `cacheKey` prop on your component inside your application, and that component will only be rendered once for that particular key.

If you cache components that change often, this will result in slower performance.  But if you're careful to cache only those component for which 1) a `cacheKey` is easy to compute, and 2) will have a small set of keys (i.e. the props don't change often)

```
Starting benchmark for 4 concurrent render operations...
renderToString took 2.943021643 seconds.
rapscallion, no caching took 2.951309105 seconds.
rapscallion, caching DIVs took 2.113534856 seconds.
rapscallion, caching DIVs (second time) took 0.001992798 seconds.
rapscallion, caching Components took 0.282408187 seconds.
rapscallion, caching Components (second time) took 0.003854510 seconds.
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


### Example

TODO
