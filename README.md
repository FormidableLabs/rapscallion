## Overview

Rapscallion is a library for asynchronously rendering React components on the server.  It's notable features are as follows:

- It provides synchronous and asyncronous modes.
- It's synchronous mode is ~20% faster than React's `renderToString`.
- It's asynchronous mode is non-blocking.
- It's asynchronous mode is ~2x slower than React's `renderToString`, but...
- As soon as concurrency reaches 4 simultaneous renders, the async mode is faster than React's `renderToString`.
- It provides a streaming interface so that you can start sending content to the user immediately.
- It provides a stream templating feature, so that you can wrap your component's HTML in boilerplate without giving up benefits of streaming.
- It provides a component caching API to further speed-up your rendering.

## Getting Started

TODO

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

### Example

TODO
