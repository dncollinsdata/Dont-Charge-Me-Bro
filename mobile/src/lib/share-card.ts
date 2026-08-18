import type { RefObject } from "react";
import type { View } from "react-native";
import { captureRef } from "react-native-view-shot";

/**
 * Snapshot a card to a PNG and hand back a file URL for the share sheet.
 *
 * The trophy and the receipt are the only things in this app that look like
 * nothing else on someone's feed, and a text-only share left both of them
 * behind. Returns null on any failure so a broken capture costs the picture,
 * never the share itself.
 */
export async function captureCard(ref: RefObject<View | null>): Promise<string | null> {
  try {
    if (!ref.current) return null;
    const uri = await captureRef(ref, { format: "png", quality: 1, result: "tmpfile" });
    return uri.startsWith("file://") ? uri : `file://${uri}`;
  } catch {
    return null;
  }
}
