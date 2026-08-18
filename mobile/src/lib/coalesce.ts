type Waiter<R> = { resolve: (value: R) => void; reject: (error: unknown) => void };

/**
 * Wraps an async function so that at most one call runs at a time, and at most
 * one waits behind it. Calls that arrive while a run is in flight collapse into
 * a single follow-up using the most recent arguments.
 *
 * Serialising alone is not enough for rebuilding the roast schedule: adding
 * five subscriptions in a row would queue five full teardowns, each cancelling
 * every pending notification and re-copying sixty card files, when only the
 * last one describes the world as it now is. Coalescing turns that into one
 * rebuild, and the callers that were folded in still get its result.
 */
export function coalescing<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  let running = false;
  let pendingArgs: A | null = null;
  let waiters: Waiter<R>[] = [];

  function drain() {
    if (!pendingArgs) return;
    const args = pendingArgs;
    const handoff = waiters;
    pendingArgs = null;
    waiters = [];
    start(...args).then(
      (value) => handoff.forEach((w) => w.resolve(value)),
      (error) => handoff.forEach((w) => w.reject(error)),
    );
  }

  async function start(...args: A): Promise<R> {
    running = true;
    try {
      return await fn(...args);
    } finally {
      running = false;
      drain();
    }
  }

  return (...args: A): Promise<R> => {
    if (!running) return start(...args);
    // Only the newest arguments survive — an older queued rebuild describes a
    // world that has already moved on.
    pendingArgs = args;
    return new Promise<R>((resolve, reject) => {
      waiters.push({ resolve, reject });
    });
  };
}
