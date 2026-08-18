import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { newStickers, STICKERS, unlockedStickers } from "./stickers";
import { defaultPrefs, type Prefs } from "./trials";

function prefs(over: Partial<Prefs> = {}): Prefs {
  return { ...defaultPrefs(), ...over };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-18T12:00:00"));
});
afterEach(() => vi.useRealTimers());

it("starts bro with an empty sticker book", () => {
  expect(unlockedStickers(prefs())).toEqual([]);
});

it("unlocks first blood on the very first win", () => {
  expect(unlockedStickers(prefs({ wins: 1 }))).toContain("first-blood");
});

it("unlocks serial yeeter at ten wins, not nine", () => {
  expect(unlockedStickers(prefs({ wins: 9 }))).not.toContain("serial-yeeter");
  expect(unlockedStickers(prefs({ wins: 10 }))).toContain("serial-yeeter");
});

it("unlocks close call only for a cancel on the day it would have charged", () => {
  expect(unlockedStickers(prefs({ wins: 1, closestCall: 2 }))).not.toContain("close-call");
  expect(unlockedStickers(prefs({ wins: 1, closestCall: 0 }))).toContain("close-call");
});

it("unlocks a flawless month once the streak reaches thirty days", () => {
  expect(unlockedStickers(prefs({ streakSince: "2026-07-27" }))).not.toContain("flawless-month");
  expect(unlockedStickers(prefs({ streakSince: "2026-07-19" }))).toContain("flawless-month");
});

it("reports only the stickers that just flipped", () => {
  const before = prefs({ wins: 9 });
  const after = prefs({ wins: 10 });

  expect(newStickers(before, after).map((s) => s.id)).toEqual(["serial-yeeter"]);
});

it("reports nothing when a win unlocks nothing new", () => {
  expect(newStickers(prefs({ wins: 4 }), prefs({ wins: 5 }))).toEqual([]);
});

it("gives every sticker a stable id", () => {
  expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
});
