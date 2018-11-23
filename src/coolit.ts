/* Coolit Engine */

interface ICoolitOption {
  mind?: AsyncIterator<void>;
}
/**
 * Endless generator throttled by `requestIdleCallback` or `requestAnmationFrame`
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
export async function* coolit<T>(
  hot: Iterable<T> | AsyncIterable<T> = endless() as any,
  { mind = idleMind() }: ICoolitOption = {}
): AsyncIterableIterator<T> {
  if (isAsyncIterableIterator(hot)) {
    for await (const n of hot) {
      yield n;
      await mind.next();
    }
  } else {
    for (const n of hot) {
      yield n;
      await mind.next();
    }
  }
}

export function* endless(): IterableIterator<void> {
  for (;;) {
    yield;
  }
}

/* Coolit Mind */

/**
 * Coolit Mind by `requestIdleCallback` or `requestAnimationFrame`
 */
export async function* idleMind(): AsyncIterableIterator<void> {
  const rIC = (window as any).requestIdleCallback || requestAnimationFrame;
  const waitForIdle = () => new Promise(r => rIC(r));
  for (;;) {
    await waitForIdle();
    yield;
  }
}

/**
 * Coolit Mind by constant interval
 *
 * task execution time doesn't affect delay
 *
 * @param msec interval delay (in milli second)
 */
export async function* intervalMind(msec: number): AsyncIterableIterator<void> {
  for (;;) {
    await new Promise(r => setTimeout(r, msec));
    yield;
  }
}

/**
 * Coolit Mind by throttling
 *
 * task execution time affects delay
 *
 * @param msec interval delay (in milli second)
 */
export async function* throttleMind(msec: number): AsyncIterableIterator<void> {
  let prev = Date.now();
  for (;;) {
    const curr = Date.now();
    await new Promise(r => setTimeout(r, Math.max(0, msec - (curr - prev))));
    prev = Date.now();
    yield;
  }
}

/* Utils */

function isAsyncIterableIterator<T>(x: unknown): x is AsyncIterable<T> {
  return typeof x === "object" && x !== null && Symbol.asyncIterator in x;
}
