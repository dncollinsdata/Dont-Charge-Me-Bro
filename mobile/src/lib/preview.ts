import type { Prefs } from "./trials";

/**
 * Whether to fire the one-off demo roast.
 *
 * A brand new user adds their leeches and then waits — the first real roast can
 * be days away, so day one never shows what the app actually does. One preview,
 * seconds after the first leech lands, makes the product felt instead of
 * described.
 */
export function shouldSendPreview(prefs: Prefs, subCount: number): boolean {
  if (prefs.previewSent) return false;
  return subCount > 0;
}
