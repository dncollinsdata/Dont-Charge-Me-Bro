import type { Row } from "./trials";

export const ACTION_YEET = "yeet";
export const ACTION_ALLOW = "allow";

/**
 * Responses already acted on. Module scope, deliberately: iOS keeps handing the
 * launching response back from getLastNotificationResponseAsync for the life of
 * the app session, so a claim stored in a component ref would be wiped by a
 * remount and the same tap would be replayed — running letItCharge twice, which
 * double-counts the hall of shame and advances the sub a cycle too far.
 */
const claimed = new Set<string>();

/** True the first time a response id is seen, false every time after. */
export function claimResponse(id: string): boolean {
  if (claimed.has(id)) return false;
  claimed.add(id);
  return true;
}

export type RoastAction =
  /** Open panic for this sub — a plain tap, or the YEET IT button. */
  | { kind: "panic"; row: Row }
  /** Bro admitted defeat from the lock screen; record it. */
  | { kind: "allow"; row: Row }
  /** Nothing to do: no sub attached, or the sub is already gone. */
  | { kind: "ignore" };

/**
 * What a tapped roast should do. Pure so the routing rules can be tested
 * without a simulator — the plumbing around it (cold starts, hydration) is
 * where the runtime lives, and it has none of the decisions.
 */
export function roastAction(
  data: { subId?: unknown },
  actionIdentifier: string,
  rows: Row[],
): RoastAction {
  const subId = data?.subId;
  if (typeof subId !== "string") return { kind: "ignore" };

  const row = rows.find((r) => r.sub.id === subId);
  if (!row) return { kind: "ignore" };

  if (actionIdentifier === ACTION_ALLOW) return { kind: "allow", row };
  return { kind: "panic", row };
}
