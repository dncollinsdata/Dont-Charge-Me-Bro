import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { claimResponse, roastAction } from "./roast-action";
import type { Row } from "./trials";

type Handlers = {
  /** Until the store has loaded from disk there are no rows to resolve against. */
  hydrated: boolean;
  rows: Row[];
  letItCharge: (row: Row) => void;
  showToast: (message: string) => void;
};

/**
 * Turns a tapped roast into something that actually happens. Without this the
 * notification is a dead end: it tells bro Netflix charges tomorrow and hands
 * him a home screen.
 *
 * Takes its dependencies as arguments rather than reaching for the store, so
 * this module stays out of the store -> notify -> here import cycle.
 */
export function useRoastResponses({ hydrated, rows, letItCharge, showToast }: Handlers) {
  const router = useRouter();
  const queue = useRef<Notifications.NotificationResponse[]>([]);
  const latest = useRef({ hydrated, rows, letItCharge, showToast });
  latest.current = { hydrated, rows, letItCharge, showToast };

  const drain = useCallback(() => {
    // A cold start launched by a notification arrives long before AsyncStorage
    // has given us any subs. Acting now would resolve every subId to nothing
    // and drop bro on the home screen — the dead end we are here to remove.
    if (!latest.current.hydrated) return;

    const pending = queue.current;
    queue.current = [];

    for (const response of pending) {
      const request = response.notification.request;
      if (!claimResponse(request.identifier)) continue;

      const action = roastAction(
        request.content.data ?? {},
        response.actionIdentifier,
        latest.current.rows,
      );

      if (action.kind === "ignore") continue;

      if (action.kind === "allow") {
        latest.current.letItCharge(action.row);
        latest.current.showToast("streak: deceased 🪦 rip");
        continue;
      }

      // Both a plain tap and YEET IT land on panic, where claiming the W happens
      // against a screen that can ask whether he really cancelled it.
      router.push(`/panic?subId=${encodeURIComponent(action.row.sub.id)}&from=roast`);
    }
  }, [router]);

  useEffect(() => {
    let alive = true;

    function enqueue(response: Notifications.NotificationResponse) {
      queue.current.push(response);
      drain();
    }

    // The launch that opened the app, if a notification is what opened it.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (alive && response) enqueue(response);
      })
      .catch(() => undefined);

    const subscription = Notifications.addNotificationResponseReceivedListener(enqueue);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, [drain]);

  // Hydration finishing, or the rows changing, is what makes a queued tap actionable.
  useEffect(drain, [drain, hydrated, rows]);
}
