import * as StoreReview from "expo-store-review";

/**
 * Ask for an App Store review. Returns whether we actually asked, so the
 * caller only records having done so when it happened.
 *
 * StoreKit reports nothing about the outcome and may show no sheet at all —
 * it rate-limits to three prompts per user per year at its own discretion.
 * Treat a `true` here as "we asked the system", never as "bro saw a dialog".
 */
export async function askForReview(): Promise<boolean> {
  try {
    if (!(await StoreReview.isAvailableAsync())) return false;
    await StoreReview.requestReview();
    return true;
  } catch {
    return false;
  }
}
