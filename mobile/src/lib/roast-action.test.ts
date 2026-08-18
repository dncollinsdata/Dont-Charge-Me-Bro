import { expect, it } from "vitest";
import { roastAction } from "./roast-action";
import type { Row } from "./trials";

const netflix: Row = {
  sub: { id: "n", name: "Netflix", amount: 12.99, cycle: "monthly", date: "2026-08-27" },
  date: "2026-08-27",
  days: 3,
};

it("sends a plain tap to that sub's panic screen", () => {
  expect(roastAction({ subId: "n" }, "default", [netflix])).toEqual({
    kind: "panic",
    row: netflix,
  });
});

it("sends the yeet button to panic too, so the W is claimed in the app", () => {
  expect(roastAction({ subId: "n" }, "yeet", [netflix])).toEqual({
    kind: "panic",
    row: netflix,
  });
});

it("records the L straight away for the allow button", () => {
  expect(roastAction({ subId: "n" }, "allow", [netflix])).toEqual({
    kind: "allow",
    row: netflix,
  });
});

it("ignores a roast whose sub was already yeeted", () => {
  expect(roastAction({ subId: "gone" }, "default", [netflix])).toEqual({ kind: "ignore" });
});

it("ignores a notification carrying no sub, like the keepalive", () => {
  expect(roastAction({}, "default", [netflix])).toEqual({ kind: "ignore" });
});
