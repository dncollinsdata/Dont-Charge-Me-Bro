import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { advance, nextDate, panicWhen, type Sub } from "./trials";

function sub(over: Partial<Sub> = {}): Sub {
  return { id: "n", name: "Netflix", amount: 12.99, cycle: "monthly", date: "2026-01-31", ...over };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("rolls a charge into a short month instead of past it", () => {
  vi.setSystemTime(new Date("2026-02-10T12:00:00"));

  // Naive setMonth turns Jan 31 into Mar 3, skipping February's charge entirely.
  expect(nextDate(sub())).toBe("2026-02-28");
});

it("advances a month-end charge without skipping a month", () => {
  vi.setSystemTime(new Date("2026-08-17T12:00:00"));

  expect(advance(sub({ date: "2026-08-31" })).date).toBe("2026-09-30");
});

it("shouts the countdown for the panic screen's display title", () => {
  expect(panicWhen(0)).toBe("TODAY 💀");
  expect(panicWhen(1)).toBe("TOMORROW 😬");
  expect(panicWhen(3)).toBe("IN 3 DAYS");
  expect(panicWhen(-2)).toBe("TODAY 💀");
});
