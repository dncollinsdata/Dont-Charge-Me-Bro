import { roastLine } from "./roasts";
import { countdownLabel, todayISO, type RoastLevel } from "./trials";

const SEEN_KEY = "dontcharge.notified.v1";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission():
  NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotifications() {
  if (!notificationsSupported()) return "unsupported" as const;
  return await Notification.requestPermission();
}

function loadSeen(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveSeen(seen: Record<string, string>) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    /* ignore */
  }
}

/** Fire one roast per item per day for anything charging within 3 days. */
export function notifyExpiring(
  items: { id: string; name: string; amount: number; days: number }[],
  roast: RoastLevel = "unhinged",
) {
  if (!notificationsSupported() || Notification.permission !== "granted")
    return;
  const seen = loadSeen();
  const today = todayISO();
  let changed = false;

  for (const item of items) {
    if (item.days > 3) continue;
    if (seen[item.id] === today) continue;
    seen[item.id] = today;
    changed = true;
    new Notification(`${item.name} charges ${countdownLabel(item.days)}`, {
      body: roastLine(roast, item.name, item.days, item.amount),
      tag: `dontcharge-${item.id}-${today}`,
    });
  }

  if (changed) saveSeen(seen);
}
