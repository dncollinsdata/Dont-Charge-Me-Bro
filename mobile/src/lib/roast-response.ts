import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ACTION_ALLOW } from "./notify";
import type { Row } from "./trials";

type Handlers = {
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
export function useRoastResponses({ rows, letItCharge, showToast }: Handlers) {
  const router = useRouter();
  const handled = useRef(new Set<string>());
  const latest = useRef({ rows, letItCharge, showToast });
  latest.current = { rows, letItCharge, showToast };

  useEffect(() => {
    let alive = true;

    function handle(response: Notifications.NotificationResponse) {
      const request = response.notification.request;
      // A cold-start response is delivered by getLastNotificationResponseAsync
      // AND, on some launches, to the listener as well. Act once.
      if (handled.current.has(request.identifier)) return;
      handled.current.add(request.identifier);

      const subId = request.content.data?.subId;
      if (typeof subId !== "string") return;

      const row = latest.current.rows.find((r) => r.sub.id === subId);
      // The sub was yeeted on some earlier launch; there is nothing to panic about.
      if (!row) return;

      if (response.actionIdentifier === ACTION_ALLOW) {
        latest.current.letItCharge(row);
        latest.current.showToast("streak: deceased 🪦 rip");
        return;
      }

      // Both a plain tap and YEET IT land on panic, where claiming the W happens
      // against a screen that can ask whether he really cancelled it.
      router.push(`/panic?subId=${encodeURIComponent(subId)}&from=roast`);
    }

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (alive && response) handle(response);
      })
      .catch(() => undefined);

    const subscription = Notifications.addNotificationResponseReceivedListener(handle);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, [router]);
}
