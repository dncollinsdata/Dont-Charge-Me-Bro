import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { cardFileName, cardName, type CardName } from "./card-names";
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

const DIR = FileSystem.cacheDirectory ? `${FileSystem.cacheDirectory}roast-cards/` : null;

const source = new Map<CardName, string>();

async function sourceFor(name: CardName): Promise<string | null> {
  const hit = source.get(name);
  if (hit) return hit;
  const asset = Asset.fromModule(CARDS[name]);
  await asset.downloadAsync();
  if (!asset.localUri) return null;
  source.set(name, asset.localUri);
  return asset.localUri;
}

/**
 * Clear out the copies made for the previous schedule. Called once per sync,
 * right after the pending notifications are cancelled, so the cache holds one
 * schedule's worth of cards rather than growing forever.
 */
export async function resetCards() {
  if (!DIR) return;
  try {
    await FileSystem.deleteAsync(DIR, { idempotent: true });
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  } catch {
    // A cache we could not clear is not worth failing a sync over.
  }
}

/**
 * A local file URL for the roast's card, or null.
 *
 * Every roast gets its OWN copy of the card, because iOS *moves* an
 * attachment's file into its private store when the notification is scheduled.
 * Sharing one file across notifications means the first one consumes it and
 * every subsequent schedule fails with ERR_NOTIFICATIONS_FAILED_TO_SCHEDULE —
 * silently, since a roast that throws is caught and skipped.
 *
 * Every failure path returns null on purpose: a roast with no picture is a
 * degraded notification, a roast that threw while resolving one is a bill
 * nobody warned about.
 */
export async function cardFor(roast: PlannedRoast): Promise<string | null> {
  if (!DIR) return null;
  try {
    const from = await sourceFor(cardName(roast));
    if (!from) return null;
    const to = `${DIR}${cardFileName(roast)}`;
    await FileSystem.copyAsync({ from, to });
    return to;
  } catch {
    return null;
  }
}
