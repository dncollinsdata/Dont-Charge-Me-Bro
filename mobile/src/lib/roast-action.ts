import type { Row } from "./trials";

export const ACTION_YEET = "yeet";
export const ACTION_ALLOW = "allow";

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
