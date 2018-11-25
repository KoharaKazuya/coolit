# coolit.js

Reduce JavaScript CPU usage by asynchronous iteration.

Provides asynchronous iteration functions that have a **Promise based** interface and it can execute with low CPU usage.
Each iteration adds delay if the processing is heavy to maintain the CPU stability.
Iterate without delay if processing is fast.
Therefore, it will realize friendly processing for your machine.
It can execute JavaScript without "Warning: Unresponsive Script" alert in the browser.

You can use it in any JavaScript environment (Browser, Electron, Node.js).

coolit.js is inspired by [chillout.js](https://github.com/polygonplanet/chillout).

## Requirement

[ES2017 Async Functions support environments](http://kangax.github.io/compat-table/es2016plus/#test-async_functions)

or Polyfill + Transpiler

## Usage

### Install

```console
$ npm install coolit
```

### import

```js
// ESM
import { coolit } from "coolit";
// or CJS
const { coolit } = require("coolit");
```

### Bloking Style with ES2018 Async Iterators

[ES2018 Async Iterators support environments](http://kangax.github.io/compat-table/es2016plus/#test-Asynchronous_Iterators)

```js
(async () => {
  let sum = 0;
  for await (const i of coolit([1, 2, 3, 4, 5])) {
    // heavy task
    sum += i;
  }
  console.assert(sum === 15);
})();
```

### Bloking Style without ES2018 Async Iterators

```js
(async () => {
  let sum = 0;
  const iter = coolit([1, 2, 3, 4, 5]);
  for (;;) {
    const { value: i, done } = await iter.next();
    if (done) break;
    // heavy task
    sum += i;
  }
  console.assert(sum === 15);
})();
```

### Callback Style with ES2018 Async Iterators

```js
(async () => {
  let sum = 0;
  function* heavyTask() {
    for (const i of [1, 2, 3, 4, 5]) {
      yield;
      // heavy task
      sum += i;
    }
  }
  for await (const _ of coolit(heavyTask())) {
  }
  console.assert(sum === 15);
})();
```

## API

### Coolit Engine

```js
coolit();
```

Create endless generator throttled by `requestIdleCallback`.

```js
coolit(iterable, option);
```

Create new generator throttles consumption of the given generator.

- `iterable`: Iterable or AsyncIterable should be consumed slowly
- `option.mind`: \[Optional\] how to _cool_ process (give the instance created by xxxMind API)

```js
endless();
```

Create endless IterableIterator.

### Coolit Mind

```js
idleMind();
```

Coolit Mind by `requestIdleCallback`

```js
animationFrameMind();
```

Coolit Mind by `requestAnimationFrame`

```js
intervalMind(msec);
```

Coolit Mind by constant interval

task execution time doesn't affect delay

```js
throttleMind(msec);
```

Coolit Mind by throttling

task execution time affects delay
