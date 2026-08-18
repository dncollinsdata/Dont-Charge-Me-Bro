import * as Notifications from "expo-notifications";
import { cardFor, resetCards } from "./cards";
import { planRoasts, type PlannedRoast } from "./planner";
import { ACTION_ALLOW, ACTION_YEET } from "./roast-action";
import { roastLine } from "./roasts";
import { countdownLabel, dueText, money, type RoastLevel, type Sub } from "./trials";

export const ROAST_CATEGORY = "roast";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestPermission() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return status;
}

/**
 * Both buttons open the app. A background action does not reach JS once iOS has
 * killed the process — which is exactly the state the app is in at 9am, days
 * after bro last opened it — so a background button would silently do nothing.
 * Claiming the W in-app also means the panic screen gets to ask whether he
 * really cancelled it, which a lock screen cannot.
 */
let category: Promise<unknown> | null = null;
function ensureCategory() {
  category ??= Notifications.setNotificationCategoryAsync(ROAST_CATEGORY, [
    {
      identifier: ACTION_YEET,
      buttonTitle: "YEET IT 🏆",
      options: { opensAppToForeground: true },
    },
    {
      identifier: ACTION_ALLOW,
      buttonTitle: "charge me ig… (L)",
      options: { opensAppToForeground: true, isDestructive: true },
    },
  ]).catch(() => undefined);
  return category;
}

function contentFor(
  roast: PlannedRoast,
  level: RoastLevel,
  card: string | null,
): Notifications.NotificationContentInput {
  const lastCall = roast.tone === "lastCall";
  return {
    title: lastCall
      ? `${roast.name} bills at midnight 💀`
      : `${roast.name} charges ${countdownLabel(roast.days)}`,
    subtitle: `${money(roast.amount)} · ${lastCall ? "MIDNIGHT" : dueText(roast.days)}`,
    body: roastLine(level, roast.name, roast.days, roast.amount, roast.tone),
    data: { subId: roast.subId, chargeISO: roast.chargeISO, days: roast.days },
    categoryIdentifier: ROAST_CATEGORY,
    // Time-sensitive is what lets the last call through Focus. At 8pm on a
    // deliberately quiet phone that is the difference between landing and not.
    interruptionLevel: roast.days <= 1 ? "timeSensitive" : "active",
    ...(card
      ? { attachments: [{ url: card, identifier: roast.tone, type: "public.png" }] }
      : {}),
    sound: true,
  };
}

export type SyncResult = {
  scheduled: number;
  /** Roasts the budget could not fit. Non-zero means coverage runs short. */
  dropped: number;
  /** How far coverage actually reaches. */
  horizon: Date | null;
};

const EMPTY: SyncResult = { scheduled: 0, dropped: 0, horizon: null };

async function runSync(subs: Sub[], level: RoastLevel, now: Date): Promise<SyncResult> {
  if ((await getPermission()) !== "granted") return EMPTY;
  await ensureCategory();

  // Cancelling first is what keeps a yeeted leech from roasting you from
  // beyond the grave.
  await Notifications.cancelAllScheduledNotificationsAsync();
  await resetCards();

  const plan = planRoasts(subs, { now });
  let scheduled = 0;

  for (const roast of plan.roasts) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: contentFor(roast, level, await cardFor(roast)),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: roast.fireAt },
      });
      scheduled++;
    } catch {
      // One roast that refuses to schedule must not cost us the rest of them.
    }
  }

  if (plan.keepalive) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "the roasts are running out 🔫",
          body: "open me so i can reload. bro is not safe without ammo.",
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: plan.keepalive },
      });
    } catch {
      // Losing the keepalive is survivable; losing the roasts is not.
    }
  }

  return { scheduled, dropped: plan.dropped, horizon: plan.horizon };
}

// Sync is cancel-then-schedule, so two overlapping runs could interleave one
// run's cancel into the other's schedule. Queue them instead.
let chain: Promise<unknown> = Promise.resolve();

/** Rebuild the whole schedule from the current subs. */
export function syncRoasts(
  subs: Sub[],
  level: RoastLevel,
  now: Date = new Date(),
): Promise<SyncResult> {
  const run = chain.then(
    () => runSync(subs, level, now),
    () => runSync(subs, level, now),
  );
  chain = run.catch(() => undefined);
  return run;
}

export async function scheduledCount() {
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}
