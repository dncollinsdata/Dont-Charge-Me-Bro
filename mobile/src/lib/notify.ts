import * as Notifications from "expo-notifications";
import { roastLine } from "./roasts";
import { countdownLabel, type RoastLevel, type Row } from "./trials";

/** How many days before a charge we shout, loudest last. */
const LEAD_DAYS = [3, 1, 0];
const ROAST_HOUR = 9;

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

/** 9am local, `lead` days before the charge date. Null if that moment has passed. */
function fireAt(chargeISO: string, lead: number): Date | null {
  const at = new Date(chargeISO + "T00:00:00");
  at.setDate(at.getDate() - lead);
  at.setHours(ROAST_HOUR, 0, 0, 0);
  return at.getTime() > Date.now() ? at : null;
}

/**
 * Rebuild the whole schedule from the current subs. Cancelling first is what
 * keeps a yeeted leech from roasting you from beyond the grave.
 */
export async function syncRoasts(rows: Row[], roast: RoastLevel) {
  if ((await getPermission()) !== "granted") return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();

  let scheduled = 0;
  for (const row of rows) {
    for (const lead of LEAD_DAYS) {
      const date = fireAt(row.date, lead);
      if (!date) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${row.sub.name} charges ${countdownLabel(lead)}`,
          body: roastLine(roast, row.sub.name, lead, row.sub.amount),
          data: { subId: row.sub.id },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
      scheduled++;
    }
  }
  return scheduled;
}

export async function scheduledCount() {
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}
