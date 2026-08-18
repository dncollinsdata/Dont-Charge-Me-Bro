import { expect, it } from "vitest";
import { cardFileName, cardName } from "./card-names";
import { planRoasts } from "./planner";
import type { PlannedRoast } from "./planner";
import type { Sub } from "./trials";

function roast(over: Partial<PlannedRoast> = {}): PlannedRoast {
  return {
    key: "n:2026-08-27:3:9",
    subId: "n",
    name: "Netflix",
    amount: 12.99,
    chargeISO: "2026-08-27",
    fireAt: new Date("2026-08-24T09:00:00"),
    days: 3,
    tone: "headsUp",
    ...over,
  };
}

it("picks a card for each rung of the ladder", () => {
  expect(cardName(roast({ days: 3 }))).toBe("heads-up");
  expect(cardName(roast({ days: 14 }))).toBe("heads-up");
  expect(cardName(roast({ days: 1 }))).toBe("one-day");
  expect(cardName(roast({ days: 0, tone: "morningOf" }))).toBe("morning-of");
  expect(cardName(roast({ days: 0, tone: "lastCall" }))).toBe("last-call");
});

it("never gives two roasts the same file", () => {
  // iOS MOVES an attachment's file into its own store, so two notifications
  // sharing one path means the second fails to schedule — silently.
  const subs: Sub[] = [
    { id: "2026-a1", name: "Netflix", amount: 12.99, cycle: "monthly", date: "2026-09-02" },
    { id: "2026:a1", name: "Nebula", amount: 5, cycle: "yearly", date: "2026-09-02" },
    { id: "2026_a1", name: "Nord", amount: 9, cycle: "trial", date: "2026-09-03" },
  ];
  const plan = planRoasts(subs, { now: new Date("2026-08-17T12:00:00") });
  const names = plan.roasts.map(cardFileName);

  expect(new Set(names).size).toBe(plan.roasts.length);
});
