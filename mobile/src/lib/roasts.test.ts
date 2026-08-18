import { expect, it } from "vitest";
import { roastLine } from "./roasts";
import type { RoastLevel } from "./trials";

const LEVELS: RoastLevel[] = ["mild", "medium", "unhinged"];

it("leaves the existing roasts untouched when no tone is given", () => {
  expect(roastLine("medium", "Netflix", 1, 12.99)).toBe(
    "bro. Netflix. tomorrow. $12.99. we've talked about this 🤨",
  );
});

it("builds the last call around midnight rather than the day count", () => {
  for (const level of LEVELS) {
    const line = roastLine(level, "Netflix", 0, 12.99, "lastCall");

    expect(line.toLowerCase()).toContain("midnight");
    expect(line).toContain("$12.99");
    // "today" is what the 9am roast says; by 8pm that is no longer the point.
    expect(line.toLowerCase()).not.toContain("today");
  }
});

it("still names the sub in every last call", () => {
  for (const level of LEVELS) {
    expect(roastLine(level, "Hulu", 0, 8, "lastCall").toLowerCase()).toContain("hulu");
  }
});
