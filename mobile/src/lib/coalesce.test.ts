import { expect, it, vi } from "vitest";
import { coalescing } from "./coalesce";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

it("starts straight away when nothing is running", () => {
  const seen: number[] = [];
  const run = coalescing(async (n: number) => {
    seen.push(n);
    return n;
  });

  run(1);

  expect(seen).toEqual([1]);
});

it("does not start a second run while one is in flight", () => {
  const seen: number[] = [];
  const gate = deferred<number>();
  const run = coalescing((n: number) => {
    seen.push(n);
    return gate.promise;
  });

  run(1);
  run(2);

  expect(seen).toEqual([1]);
});

it("collapses everything that queued up into one run, with the latest arguments", async () => {
  const seen: number[] = [];
  const gates = [deferred<number>(), deferred<number>()];
  const run = coalescing((n: number) => {
    seen.push(n);
    return gates[seen.length - 1].promise;
  });

  run(1);
  // Three subscriptions added in a row while the first rebuild is still going.
  run(2);
  run(3);
  run(4);
  gates[0].resolve(1);
  await flush();

  expect(seen).toEqual([1, 4]);
});

it("hands every coalesced caller the result of the run made on their behalf", async () => {
  const gates = [deferred<string>(), deferred<string>()];
  let call = 0;
  const run = coalescing(() => gates[call++].promise);

  const first = run();
  const a = run();
  const b = run();
  gates[0].resolve("first");
  await flush();
  gates[1].resolve("second");

  expect(await first).toBe("first");
  expect(await a).toBe("second");
  expect(await b).toBe("second");
});

it("keeps running after a run rejects", async () => {
  const seen: number[] = [];
  const run = coalescing(async (n: number) => {
    seen.push(n);
    if (n === 1) throw new Error("boom");
    return n;
  });

  await expect(run(1)).rejects.toThrow("boom");
  await run(2);

  expect(seen).toEqual([1, 2]);
});

it("passes a rejection on to the callers waiting for that run", async () => {
  const gates = [deferred<number>(), deferred<number>()];
  let call = 0;
  const run = coalescing(() => gates[call++].promise);

  const first = run();
  const queued = run();
  gates[0].resolve(1);
  await flush();
  gates[1].reject(new Error("second failed"));

  await expect(first).resolves.toBe(1);
  await expect(queued).rejects.toThrow("second failed");
});
