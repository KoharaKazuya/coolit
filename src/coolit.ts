const global = (0, eval)("this");

/* Coolit Engine */

interface ICoolitOption {
  /** how to _cool_ process (give the instance created by xxxMind API) */
  mind?: AsyncIterator<void>;
}
/**
 * Endless generator throttled by `requestIdleCallback`
 */
export function coolit(): AsyncIterableIterator<void>;
/**
 * create new generator throttles consumption of the given generator
 * @param hot Iterable or AsyncIterable should be consumed slowly
 */
export function coolit<T>(
  hot: Iterable<T> | AsyncIterable<T>,
  option?: ICoolitOption
): AsyncIterableIterator<T>;
export function coolit<T>(
  hot: Iterable<T> | AsyncIterable<T> = endless() as any,
  { mind = idleMind() }: ICoolitOption = {}
): AsyncIterableIterator<T> {
  let iter: Iterator<T> | AsyncIterator<T>;

  return asyncIterablize({
    async next(): Promise<IteratorResult<T>> {
      if (iter) {
        await mind.next();
      } else {
        iter = isAsyncIterableIterator(hot)
          ? hot[Symbol.asyncIterator]()
          : hot[Symbol.iterator]();
      }
      return await iter.next();
    }
  });
}

/**
 * Endless IterableIterator
 */
export function* endless(): IterableIterator<void> {
  for (;;) {
    yield;
  }
}

/* Coolit Mind */

/**
 * Coolit Mind by `requestIdleCallback`
 */
export function idleMind(): AsyncIterableIterator<void> {
  const rIC =
    global.requestIdleCallback || ((r: () => void) => setTimeout(r, 50));
  const waitForIdle = () => new Promise(r => rIC(r));

  return asyncIterablize({
    async next(): Promise<IteratorResult<void>> {
      await waitForIdle();
      return { value: undefined, done: false };
    }
  });
}

/**
 * Coolit Mind by `requestAnimationFrame`
 */
export function animationFrameMind(): AsyncIterableIterator<void> {
  const rAF =
    global.requestAnimationFrame || ((r: () => void) => setTimeout(r, 16));
  const waitForNextFrame = () => new Promise(r => rAF(r));

  return asyncIterablize({
    async next(): Promise<IteratorResult<void>> {
      await waitForNextFrame();
      return { value: undefined, done: false };
    }
  });
}

/**
 * Coolit Mind by constant interval
 *
 * task execution time doesn't affect delay
 *
 * @param msec interval delay (in milli second)
 */
export function intervalMind(msec: number): AsyncIterableIterator<void> {
  return asyncIterablize({
    async next(): Promise<IteratorResult<void>> {
      await new Promise(r => setTimeout(r, msec));
      return { value: undefined, done: false };
    }
  });
}

/**
 * Coolit Mind by throttling
 *
 * task execution time affects delay
 *
 * @param msec interval delay (in milli second)
 */
export function throttleMind(msec: number): AsyncIterableIterator<void> {
  let prev: number;

  return asyncIterablize({
    async next(): Promise<IteratorResult<void>> {
      if (!prev) {
        prev = Date.now();
      }
      await new Promise(r =>
        setTimeout(r, Math.max(0, msec - (Date.now() - prev)))
      );
      prev = Date.now();
      return { value: undefined, done: false };
    }
  });
}

/* Utils */

function isAsyncIterableIterator<T>(x: unknown): x is AsyncIterable<T> {
  return typeof x === "object" && x !== null && Symbol.asyncIterator in x;
}

function asyncIterablize<T>(
  iterator: AsyncIterator<T>
): AsyncIterableIterator<T> {
  const ret = {
    ...iterator,
    [Symbol.asyncIterator]: () => ret
  };
  return ret;
}
