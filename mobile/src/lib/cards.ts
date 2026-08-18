import { Asset } from "expo-asset";
import type { PlannedRoast } from "./planner";

/**
 * The image attached to a roast. One card per rung of the ladder — the shade is
 * not the place for a subtle distinction, so each rung looks like a different
 * kind of emergency.
 */
const CARDS = {
  "heads-up": require("../../assets/roast-cards/heads-up.png"),
  "one-day": require("../../assets/roast-cards/one-day.png"),
  "morning-of": require("../../assets/roast-cards/morning-of.png"),
  "last-call": require("../../assets/roast-cards/last-call.png"),
} as const;

type CardName = keyof typeof CARDS;

function cardName(roast: PlannedRoast): CardName {
  if (roast.tone === "lastCall") return "last-call";
  if (roast.tone === "morningOf") return "morning-of";
  return roast.days === 1 ? "one-day" : "heads-up";
}

const resolved = new Map<CardName, string>();

/**
 * A local file URL for the roast's card, or null. Every failure path returns
 * null on purpose: a roast with no picture is a degraded notification, a roast
 * that threw while resolving one is a bill nobody warned about.
 */
export async function cardFor(roast: PlannedRoast): Promise<string | null> {
  const name = cardName(roast);
  const hit = resolved.get(name);
  if (hit) return hit;

  try {
    const asset = Asset.fromModule(CARDS[name]);
    await asset.downloadAsync();
    if (!asset.localUri) return null;
    resolved.set(name, asset.localUri);
    return asset.localUri;
  } catch {
    return null;
  }
}
