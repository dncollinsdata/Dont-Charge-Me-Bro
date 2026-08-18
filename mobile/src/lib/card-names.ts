import type { PlannedRoast } from "./planner";

export const CARD_NAMES = ["heads-up", "one-day", "morning-of", "last-call"] as const;

export type CardName = (typeof CARD_NAMES)[number];

/** Which card a roast wears. Each rung looks like a different kind of emergency. */
export function cardName(roast: PlannedRoast): CardName {
  if (roast.tone === "lastCall") return "last-call";
  if (roast.tone === "morningOf") return "morning-of";
  return roast.days === 1 ? "one-day" : "heads-up";
}

/**
 * The file this roast's card copy lives in. Must be unique per roast: iOS moves
 * an attachment's file into its own store when the notification is scheduled,
 * so two roasts pointing at one path means the second one silently fails.
 *
 * Sub ids are generated, not typed, so they can carry anything — the key is
 * hex-encoded rather than character-substituted, because substitution collapses
 * distinct ids ("a:b" and "a-b") onto the same name.
 */
export function cardFileName(roast: PlannedRoast): string {
  let encoded = "";
  for (const char of roast.key) {
    encoded += char.charCodeAt(0).toString(16).padStart(2, "0");
  }
  return `${encoded}.png`;
}
