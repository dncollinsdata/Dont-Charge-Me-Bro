import type { Prefs } from "./trials";

/** Wins earned before we are willing to ask bro for five stars. */
const WINS_BEFORE_ASKING = 3;

/**
 * Whether this is the moment to ask for an App Store review.
 *
 * Pure, so the one rule that matters — ask a happy user once, never a
 * frustrated one — is tested rather than trusted. The StoreKit call itself
 * returns nothing and can be silently suppressed by the system, so "did we
 * ask" is the only fact we are ever able to record.
 */
export function shouldAskForReview(prefs: Prefs): boolean {
  if (prefs.reviewAskedAt !== null) return false;
  return prefs.wins >= WINS_BEFORE_ASKING;
}
