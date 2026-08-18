import { expect, it } from "vitest";
import { shouldAskForReview } from "./review";
import { defaultPrefs, type Prefs } from "./trials";

function prefs(over: Partial<Prefs> = {}): Prefs {
  return { ...defaultPrefs(), ...over };
}

it("does not ask before bro has actually won anything", () => {
  expect(shouldAskForReview(prefs({ wins: 0 }))).toBe(false);
});

it("does not ask on the first couple of wins", () => {
  expect(shouldAskForReview(prefs({ wins: 1 }))).toBe(false);
  expect(shouldAskForReview(prefs({ wins: 2 }))).toBe(false);
});

it("asks once bro has yeeted three leeches", () => {
  expect(shouldAskForReview(prefs({ wins: 3 }))).toBe(true);
});

it("never asks a second time", () => {
  // StoreKit tells us nothing about the outcome, so "we asked" is the only
  // thing we can honestly track — and one ask is all it earns.
  expect(shouldAskForReview(prefs({ wins: 9, reviewAskedAt: "2026-08-18" }))).toBe(false);
});

it("still asks a long-time user who passed the threshold before we tracked it", () => {
  expect(shouldAskForReview(prefs({ wins: 40, reviewAskedAt: null }))).toBe(true);
});
