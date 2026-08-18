import { expect, it } from "vitest";
import { shameShareText, winShareText } from "./share-text";

it("brags with the charge dodged and the running total", () => {
  expect(winShareText("Netflix", 12.99, 214.87)).toBe(
    "just cancelled Netflix before it charged me $12.99. $215 kept from companies I forgot about 🏆 Don't Charge Me Bro",
  );
});

it("keeps cents on the single charge but rounds the lifetime figure", () => {
  // The dodged amount is a real number off a real invoice; the total is a brag.
  const text = winShareText("Adobe CC", 263.88, 1499.5);

  expect(text).toContain("$263.88");
  expect(text).toContain("$1,500");
});

it("names the sub even when it has punctuation in it", () => {
  expect(winShareText("Bob's Gym", 40, 40)).toContain("Bob's Gym");
});

it("confesses the lifetime damage in the shame share", () => {
  expect(shameShareText(180.44)).toBe(
    "I have donated $180 to companies I forgot about. Don't Charge Me Bro 🧾",
  );
});
