import * as Notifications from "expo-notifications";
import { cardFor, resetCards } from "./cards";
import { coalescing } from "./coalesce";
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
  ]).catch(() => {
    // Clearing the memo lets the next sync try again. Left cached, one failed
    // registration would ship every roast with a categoryIdentifier iOS does
    // not know — delivering them with no buttons at all, silently, all session.
    category = null;
  });
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
  /**
   * Roasts iOS refused. Anything above zero means the schedule is quietly
   * shorter than planned — the shape of failure that once armed 4 roasts out of
   * 60 while the app cheerfully reported it was ready.
   */
  failed: number;
  /** Roasts the budget could not fit. Non-zero means coverage runs short. */
  dropped: number;
  /** How far coverage actually reaches. */
  horizon: Date | null;
};

const EMPTY: SyncResult = { scheduled: 0, failed: 0, dropped: 0, horizon: null };

async function runSync(subs: Sub[], level: RoastLevel): Promise<SyncResult> {
  // Taken here rather than at call time: a coalesced run can start well after
  // the call that asked for it, and planning against a stale clock schedules
  // moments that have already gone by.
  const now = new Date();

  if ((await getPermission()) !== "granted") return EMPTY;
  await ensureCategory();

  // Cancelling first is what keeps a yeeted leech from roasting you from
  // beyond the grave.
  await Notifications.cancelAllScheduledNotificationsAsync();
  await resetCards();

  const plan = planRoasts(subs, { now });
  let scheduled = 0;
  let failed = 0;

  for (const roast of plan.roasts) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: contentFor(roast, level, await cardFor(roast)),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: roast.fireAt },
      });
      scheduled++;
    } catch {
      // One roast that refuses to schedule must not cost us the rest of them,
      // but the count has to come back so the miss is visible.
      failed++;
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

  return { scheduled, failed, dropped: plan.dropped, horizon: plan.horizon };
}

/**
 * Rebuild the whole schedule from the current subs.
 *
 * Sync is cancel-then-schedule, so overlapping runs must never interleave one
 * run's cancel into another's schedule. Coalescing rather than merely queueing
 * also means a burst of changes — bro adding five subscriptions in a row —
 * costs one rebuild instead of five full teardowns.
 */
export const syncRoasts = coalescing(runSync);

export async function scheduledCount() {
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}
