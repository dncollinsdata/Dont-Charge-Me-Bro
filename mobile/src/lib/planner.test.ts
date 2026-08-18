import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { planRoasts } from "./planner";
import type { Sub } from "./trials";

/** Local wall-clock, which is the only clock notifications care about. */
function at(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function sub(over: Partial<Sub> = {}): Sub {
  return { id: "n", name: "Netflix", amount: 12.99, cycle: "monthly", date: "2026-08-27", ...over };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-17T12:00:00"));
});
afterEach(() => vi.useRealTimers());

describe("planRoasts", () => {
  it("gives a monthly charge the four-rung ladder", () => {
    const plan = planRoasts([sub()], { now: new Date("2026-08-17T12:00:00") });
    const first = plan.roasts.filter((r) => r.chargeISO === "2026-08-27");

    expect(first.map((r) => [at(r.fireAt), r.days, r.tone])).toEqual([
      ["2026-08-24 09:00", 3, "headsUp"],
      ["2026-08-26 09:00", 1, "headsUp"],
      ["2026-08-27 09:00", 0, "morningOf"],
      ["2026-08-27 20:00", 0, "lastCall"],
    ]);
  });

  it("keeps roasting after the first charge lands", () => {
    const plan = planRoasts([sub()], { now: new Date("2026-08-17T12:00:00") });
    const charges = [...new Set(plan.roasts.map((r) => r.chargeISO))];

    // The bug this whole feature exists to fix: one cycle of coverage, then silence.
    expect(charges.slice(0, 4)).toEqual([
      "2026-08-27",
      "2026-09-27",
      "2026-10-27",
      "2026-11-27",
    ]);
  });

  it("walks a yearly sub a year at a time, with its own longer ladder", () => {
    const plan = planRoasts([sub({ cycle: "yearly", amount: 180, date: "2026-10-01" })], {
      now: new Date("2026-08-17T12:00:00"),
    });
    const first = plan.roasts.filter((r) => r.chargeISO === "2026-10-01");

    expect(first.map((r) => [at(r.fireAt), r.days, r.tone])).toEqual([
      ["2026-09-17 09:00", 14, "headsUp"],
      ["2026-09-24 09:00", 7, "headsUp"],
      ["2026-09-30 09:00", 1, "headsUp"],
      ["2026-10-01 09:00", 0, "morningOf"],
      ["2026-10-01 20:00", 0, "lastCall"],
    ]);
    expect([...new Set(plan.roasts.map((r) => r.chargeISO))].slice(0, 2)).toEqual([
      "2026-10-01",
      "2027-10-01",
    ]);
  });

  it("still catches a sub added in the afternoon of its own charge day", () => {
    // Both 9am moments are already gone; the 8pm last call is the only thing
    // standing between bro and the charge. Today it schedules nothing at all.
    const plan = planRoasts([sub({ date: "2026-08-17" })], {
      now: new Date("2026-08-17T14:00:00"),
    });
    const today = plan.roasts.filter((r) => r.chargeISO === "2026-08-17");

    expect(today.map((r) => [at(r.fireAt), r.tone])).toEqual([
      ["2026-08-17 20:00", "lastCall"],
    ]);
  });

  it("puts a lead that crosses a month boundary in the previous month", () => {
    const plan = planRoasts([sub({ date: "2026-09-02" })], {
      now: new Date("2026-08-17T12:00:00"),
    });
    const first = plan.roasts.filter((r) => r.chargeISO === "2026-09-02");

    expect(at(first[0].fireAt)).toBe("2026-08-30 09:00");
  });

  it("orders roasts across subs by when they fire, not by sub", () => {
    const plan = planRoasts(
      [
        sub({ id: "a", name: "Adobe", date: "2026-09-10" }),
        sub({ id: "b", name: "Bumble", date: "2026-08-20" }),
      ],
      { now: new Date("2026-08-17T12:00:00") },
    );

    // Bumble's own second cycle lands after Adobe's first, so a correct plan
    // interleaves the two subs rather than emitting one sub then the other.
    expect(plan.roasts.slice(0, 8).map((r) => `${r.name} ${at(r.fireAt)}`)).toEqual([
      "Bumble 2026-08-19 09:00",
      "Bumble 2026-08-20 09:00",
      "Bumble 2026-08-20 20:00",
      "Adobe 2026-09-07 09:00",
      "Adobe 2026-09-09 09:00",
      "Adobe 2026-09-10 09:00",
      "Adobe 2026-09-10 20:00",
      "Bumble 2026-09-17 09:00",
    ]);
  });

  it("trims to the budget by keeping the soonest roasts", () => {
    const plan = planRoasts(
      [sub({ id: "a", name: "Adobe", date: "2026-09-10" }), sub({ id: "b", name: "Bumble", date: "2026-08-20" })],
      { now: new Date("2026-08-17T12:00:00"), budget: 4 },
    );

    expect(plan.roasts.map((r) => `${r.name} ${at(r.fireAt)}`)).toEqual([
      "Bumble 2026-08-19 09:00",
      "Bumble 2026-08-20 09:00",
      "Bumble 2026-08-20 20:00",
      "Adobe 2026-09-07 09:00",
    ]);
  });

  it("reports what the budget could not fit", () => {
    const plan = planRoasts([sub()], { now: new Date("2026-08-17T12:00:00"), cycles: 3, budget: 4 });

    // 3 cycles x 4 rungs = 12 candidates, 4 kept.
    expect(plan.dropped).toBe(8);
  });

  it("sets the horizon to the last roast that fit", () => {
    const plan = planRoasts([sub()], { now: new Date("2026-08-17T12:00:00"), budget: 4 });

    expect(at(plan.horizon!)).toBe("2026-08-27 20:00");
  });

  it("raises a keepalive a day before the horizon when it ran out of room", () => {
    const plan = planRoasts([sub()], { now: new Date("2026-08-17T12:00:00"), budget: 4 });

    expect(at(plan.keepalive!)).toBe("2026-08-26 20:00");
  });

  it("raises no keepalive when every roast fit", () => {
    const plan = planRoasts([sub()], { now: new Date("2026-08-17T12:00:00"), cycles: 2 });

    expect(plan.dropped).toBe(0);
    expect(plan.keepalive).toBeNull();
  });

  it("stays inside the 64 pending notifications iOS allows", () => {
    const many = Array.from({ length: 40 }, (_, i) =>
      sub({ id: `s${i}`, name: `Leech ${i}`, date: "2026-09-05" }),
    );
    const plan = planRoasts(many, { now: new Date("2026-08-17T12:00:00") });

    // Roasts plus the keepalive must clear the cap with room to spare.
    expect(plan.roasts.length + 1).toBeLessThanOrEqual(64);
    expect(plan.dropped).toBeGreaterThan(0);
  });

  it("holds a month-end charge on the anchor day across the whole walk", () => {
    const plan = planRoasts([sub({ date: "2026-08-31" })], {
      now: new Date("2026-08-17T12:00:00"),
      cycles: 5,
    });

    // Stepping one advance at a time ratchets 31 -> 30 -> 30; the anchor day has
    // to survive the short months, not be eroded by them.
    expect([...new Set(plan.roasts.map((r) => r.chargeISO))]).toEqual([
      "2026-08-31",
      "2026-09-30",
      "2026-10-31",
      "2026-11-30",
      "2026-12-31",
    ]);
  });

  it("speculates that a trial bro let bill is now a monthly", () => {
    const plan = planRoasts([sub({ cycle: "trial", date: "2026-08-25" })], {
      now: new Date("2026-08-17T12:00:00"),
      cycles: 3,
    });

    expect([...new Set(plan.roasts.map((r) => r.chargeISO))]).toEqual([
      "2026-08-25",
      "2026-09-25",
      "2026-10-25",
    ]);
  });
});
