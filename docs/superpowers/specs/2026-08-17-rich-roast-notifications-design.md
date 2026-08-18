# Rich roast notifications

Date: 2026-08-17
Status: approved, ready for implementation planning
Scope: `mobile/` (the Expo iOS app). The web app in `src/` is untouched.

## Why

The notification system is the product. Every other screen is decoration around
the one job: make sure bro does not get charged. Today that job fails in ways
that are invisible from inside the app.

`syncRoasts` (`mobile/src/lib/notify.ts:42`) cancels everything and reschedules
`LEAD_DAYS = [3, 1, 0]` at 9am for each row returned by `toRows`. `toRows` uses
`nextDate(sub)`, which is the **next** occurrence only. So:

1. **Recurring subs get exactly one cycle of coverage.** Once that charge date
   passes, nothing is scheduled until the app is next opened. The user this app
   is built for — the one who forgets — is the one who stops getting warned.
2. **iOS caps pending local notifications at 64 per app.** At 3 per sub, past
   ~21 subs the OS silently drops the rest. Nothing detects or reports this.
3. **The day-of roast contradicts the app's own story.** It fires at 9am, but
   `app/panic.tsx:36` says the money "leaves the account at midnight". For App
   Store subscriptions Apple renews ~24h early and requires cancelling at least
   24h ahead, so a 9am morning-of roast is often a post-mortem.
4. **A roast is a dead end.** There is no `addNotificationResponseReceivedListener`
   anywhere in the app. The `data: { subId }` payload is written and never read.
   Bro gets told Netflix charges tomorrow and is handed a home screen.
5. **Yearly plans get the same three days' warning as a $6 trial.**
6. **A sub added on its own charge day schedules nothing** — both 9am moments
   have already passed, and `fireAt` returns null for each.
7. **`syncRoasts` has no concurrency guard.** It is cancel-then-schedule with
   awaits throughout; two overlapping runs can interleave so that one run's
   cancel wipes the other's partial schedule.

This design fixes 1, 2, 3, 4, 5 and 7 outright, and makes 6 a non-issue by
adding an evening slot.

## Decisions taken

Settled during brainstorming, recorded here so the plan does not relitigate them:

- **Richness: actions + image attachment, no native target.** Notification
  categories with buttons, an image card in the expanded notification, subtitle
  line, and time-sensitive interruption. No Notification Content Extension —
  its custom UI would be Swift, sharing nothing with `src/ui.tsx`, and this
  project already does not rebuild for free.
- **Every action opens the app.** `NotificationAction.options.opensAppToForeground`
  documents that a background action does **not** reach JS listeners when the app
  has been killed — which is exactly the state the app is in at 9am, days after
  it was last opened. A background action would silently do nothing. Since every
  action foregrounds anyway, snooze earns nothing and is cut.
- **The W is claimed in-app, never on the lock screen.** A lock-screen "I
  cancelled it" would delete the sub, stop the roasts, and award the streak for
  a cancellation that may never have happened — leaving bro worse off than with
  no notification at all. `YEET IT` opens panic for that specific sub, where the
  app can ask whether he actually did it.
- **Cycle-aware ladder with a last call**, replacing the flat `[3, 1, 0]`.
- **Cards start as static bundled art behind a one-function seam**, so
  per-sub rendered cards become a drop-in replacement later.

## Architecture

Five modules, each with one job. The dependency arrow points one way: the
planner knows nothing about expo, and the executor knows nothing about ladders.

```
trials.ts        (+ RoastTone) — Sub/Row types, date math, shared enums
   ↑                    ↑
planner.ts (new, pure)  roasts.ts (extended) — the copy
   ↑                    ↑
notify.ts  (rewritten) — talk to expo-notifications; execute a plan
   ↑          ↖
cards.ts   (new)       — PlannedRoast → local image file URL

roast-response.ts (new) — a tapped notification → app navigation/state
```

`RoastTone` lives in `trials.ts` alongside `RoastLevel` rather than in the
planner, so `planner.ts` and `roasts.ts` both depend on shared types and never
on each other.

`planner.ts` imports only from `trials.ts`. No expo, no react-native. That is
what makes the ladder, the budget, the month-rollover math and the horizon
testable in plain node, which is where the real bugs in this feature live.

### `src/lib/planner.ts` (new, pure)

```ts
// RoastTone = "headsUp" | "morningOf" | "lastCall"  — declared in trials.ts

export type Lead = { days: number; hour: number; tone: RoastTone };

export type PlannedRoast = {
  key: string;        // `${subId}:${chargeISO}:${days}:${hour}` — stable identity,
                      // used by tests and by the device readback diff
  subId: string;
  name: string;
  amount: number;
  chargeISO: string;  // the charge this roast is about
  fireAt: Date;
  days: number;       // lead, in days
  tone: RoastTone;
};

export type Plan = {
  roasts: PlannedRoast[];
  horizon: Date | null;  // fireAt of the last roast that fit
  dropped: number;       // candidates the budget could not fit
  keepalive: Date | null;
};

export function planRoasts(
  subs: Sub[],
  opts: { now: Date; cycles?: number; budget?: number },
): Plan;
```

**The ladder.** Trials and monthlies:

| lead | hour | tone |
|---|---|---|
| 3 days | 09:00 | headsUp |
| 1 day | 09:00 | headsUp |
| 0 days | 09:00 | morningOf |
| 0 days | 20:00 | lastCall |

Yearlies get `14` and `7` day heads-ups on the front, for five slots total. A
$180 renewal deserves a running start; a $6 trial does not.

The 8pm last call is the most valuable notification in the system — it is the
last moment intervention is still possible, and it is the one that finally
matches what the panic screen has always claimed about midnight.

**Algorithm.**

1. For each sub, walk forward `cycles` charge dates: start at `nextDate(sub)`,
   then apply `advance()` repeatedly. Default `cycles = 12`.
2. For each charge date, emit one candidate per rung of that sub's ladder,
   with `fireAt` = charge date minus `days`, at `hour` local.
3. Drop every candidate whose `fireAt` is at or before `now`.
4. Sort all candidates across all subs ascending by `fireAt`.
5. Keep the first `budget` (default 60). `dropped` = candidates minus kept.
6. `horizon` = `fireAt` of the last kept roast.
7. `keepalive` = one day before `horizon`, **only when `dropped > 0`**. A
   non-zero drop count is the precise signal that coverage ran out of room
   rather than running out of subscriptions.

Sorting globally by fire time before trimming is what makes the budget correct:
imminent charges are always fully covered, and the roasts sacrificed are the
most distant ones, which are also the ones most likely to be re-planned before
they would have fired.

**Trials beyond the first cycle.** `advance()` already encodes the rule that a
trial allowed to bill becomes a monthly subscription. The planner follows it and
schedules speculative post-trial cycles. If bro lets the trial charge and never
opens the app, he is now paying monthly — and those speculative roasts are the
only thing that will tell him. If he cancels, the next app open re-plans and
they disappear. Speculating is the behaviour that fails safe.

**Budget.** `MAX_PENDING = 64` is Apple's documented cap. The default budget is
60, leaving headroom for the keepalive and a margin so the app never depends on
iOS's eviction policy — we do our own trimming precisely so that cap is never
reached.

### `src/lib/notify.ts` (rewritten)

Keeps `getPermission` / `requestPermission` / `scheduledCount` as they are.
`syncRoasts` becomes a thin executor:

```ts
export async function syncRoasts(
  subs: Sub[],
  roast: RoastLevel,
  now?: Date,
): Promise<{ scheduled: number; dropped: number; horizon: Date | null }>;
```

1. Return zeros unless permission is `granted`.
2. Serialize behind a module-level promise chain, so overlapping calls queue
   instead of interleaving a cancel into another run's schedule.
3. Register the notification category (idempotent, once per process).
4. `cancelAllScheduledNotificationsAsync()`.
5. `planRoasts(subs, { now })`.
6. Resolve card attachments for the plan (see `cards.ts`); a card that fails to
   resolve yields `null` and the roast is scheduled without one.
7. Schedule each `PlannedRoast` with a `DATE` trigger, plus the keepalive if the
   plan has one.

Note the signature change: it now takes `Sub[]` rather than `Row[]`, because the
planner needs the raw subscriptions to walk cycles forward. `Row` is a
resolved-against-today view and cannot express future cycles.

**Notification content.**

```ts
{
  title: `${name} charges ${countdownLabel(days)}`,
  subtitle: `${money(amount)} · ${dueText(days)}`,        // iOS only
  body: roastLine(level, name, days, amount, tone),
  data: { subId, chargeISO, days },
  categoryIdentifier: "roast",
  interruptionLevel: days <= 1 ? "timeSensitive" : "active",
  attachments: card ? [{ url: card, identifier: tone }] : undefined,
  sound: true,
}
```

`timeSensitive` is what lets the last call break through Focus and Do Not
Disturb — at 8pm, on a phone that is deliberately quiet, that is the difference
between the roast landing and not. It requires the
`com.apple.developer.usernotifications.time-sensitive` entitlement, added under
`ios.entitlements` in `app.json`, which means a native rebuild.

**The keepalive roast** is a plain notification with no category and no
attachment: title `the roasts are running out 🔫`, body `open me so i can
reload. bro is not safe without ammo.` It converts a silent limit into a visible
one.

### `src/lib/roasts.ts` (extended)

`roastLine` gains a fifth parameter:

```ts
export function roastLine(
  level: RoastLevel,
  name: string,
  days: number,
  amount: number,
  tone: RoastTone = "headsUp",
): string;
```

The default keeps the Roasts screen preview (`app/(tabs)/roasts.tsx:90`)
compiling unchanged. `lastCall` gets dedicated copy per roast level, all three
built around midnight rather than the day count — that is the whole point of the
8pm slot:

- mild — `${name} bills at midnight. ${amount}. last chance to bail 😬`
- medium — `bro. midnight. ${name}. ${amount}. this is the last text i send 🤨`
- unhinged — `⏰ MIDNIGHT. ${NAME}. ${amount}. IT IS COMING UP THE STAIRS. CANCEL IT OR ACCEPT YOUR FATE 💀🗣️`

### `src/lib/cards.ts` (new)

```ts
export async function cardFor(roast: PlannedRoast): Promise<string | null>;
```

One function, one job: turn a planned roast into a local file URL for the image
attachment, or `null`. Every failure path returns `null`, so a broken card
degrades the notification instead of losing it.

**v1 (this design):** four static PNGs bundled at
`mobile/assets/roast-cards/{heads-up,one-day,morning-of,last-call}.png`, chosen
by tone and lead, resolved through `expo-asset`'s
`Asset.fromModule(mod).downloadAsync()` → `localUri`, memoised per tone. 1200×600,
which reads well in the expanded notification. Adds one dependency,
`expo-asset`, and no native code of our own.

**Later, if wanted:** the same signature backed by `react-native-view-shot`,
snapshotting a real DCMB card with the sub's chip letter, name, amount and
countdown in the actual theme. It reuses `src/ui.tsx` so it cannot drift from
the app's look. It costs two dependencies, one of them native, plus a dev-client
rebuild and an unverified interaction with RN 0.86 on the New Architecture.
Deferred deliberately — the seam means adopting it touches one file.

### `src/lib/roast-response.ts` (new)

A `useRoastResponses()` hook, mounted in `app/_layout.tsx` **inside**
`StoreProvider` so it can reach the store.

- `getLastNotificationResponseAsync()` on mount, handling a cold start launched
  from a notification.
- `addNotificationResponseReceivedListener` for the warm case.
- Both paths funnel into one handler, deduped on
  `response.notification.request.identifier` via a ref, because the cold-start
  response can also arrive at the listener.

Routing:

| action | behaviour |
|---|---|
| default tap | `router.push('/panic?subId=…')` |
| `yeet` | `router.push('/panic?subId=…')` — the W is claimed on the screen, not here |
| `allow` | `letItCharge(row)` + toast; no navigation |

If the `subId` no longer resolves to a row — the sub was deleted on another
launch — the handler routes to `/` and does nothing else.

### `app/panic.tsx` (route contract change)

Panic currently renders `store.panic`, which is `rows.find(r => r.days <= 0)` —
a single global "whatever charges today". A roast three days out needs panic to
be about a *specific* subscription.

- Read `useLocalSearchParams<{ subId?: string }>()`.
- Resolve `subId ? rows.find(r => r.sub.id === subId) : panic`, so the tab-bar
  path keeps working exactly as it does now.
- The title's third line becomes the countdown rather than the constant
  `TODAY 💀`: `TODAY 💀`, `TOMORROW 😬`, `IN 3 DAYS`. This needs a new
  `panicWhen(days)` helper in `trials.ts` — the existing `dueText` is lowercase
  and renders `3 days` without the `IN`.
- The midnight body copy applies only when `days <= 0`; earlier leads get a
  variant that does not claim the money is leaving tonight, because it isn't.
- When arrived at from a notification, one line under the W button asks the
  question the lock screen could not: *"you actually cancelled it, right? 👀"*.
  This is the pushback that makes claiming the W in-app worth the extra tap.

No per-service cancellation links: the app stores no data that would support
them.

### `src/store.tsx`

- The notify effect passes `subs` instead of `rows`.
- A new `AppState` listener re-syncs on foreground, but only when `todayISO()`
  differs from the last synced day, or nothing has been synced this session.
  That covers both "reopened days later" and "left open across midnight" without
  rescheduling 60 notifications every time the app is flicked to.
- The Roasts screen surfaces coverage: `dropped` and `horizon` turn
  "12 roasts queued up" into an honest "roasts scheduled through March 14".

## Error handling

| failure | behaviour |
|---|---|
| permission not granted | `syncRoasts` returns zeros; no scheduling attempted |
| card fails to resolve | roast is scheduled with no attachment |
| a single `scheduleNotificationAsync` throws | logged, loop continues; the count reflects what actually landed |
| overlapping syncs | serialised by the promise chain |
| `subId` from a notification no longer exists | route to `/`, no state change |
| more candidates than budget | trimmed furthest-first, `dropped` reported, keepalive scheduled |

## Testing

`mobile/` has no test runner today. Add `vitest` and a `test` script. The
planner is deliberately free of expo and react-native imports so it runs in
plain node with no native mocking — this is the reason for the module boundary,
not a happy accident.

`src/lib/planner.test.ts`, with `vi.setSystemTime` for determinism (`nextDate`
and `advance` read the system clock through `todayISO()`):

- the correct ladder per cycle type, including yearly's five rungs
- moments already past are dropped; a sub added at 2pm on its charge day still
  gets the 8pm last call
- recurrence: a monthly sub yields roasts across many cycles, not one
- month rollover: a charge on the 2nd puts its 3-day lead in the previous month;
  a charge on the 31st survives months that have no 31st
- budget trimming keeps the soonest and reports `dropped` accurately
- `horizon` matches the last kept roast
- keepalive appears only when `dropped > 0`
- trials speculate forward as monthlies

`src/lib/roasts.test.ts`: `lastCall` copy for all three levels; the default
`tone` argument preserves existing output exactly.

**Device verification.** Far-future DATE triggers cannot be waited out. The
check that actually proves the system works is a readback diff: run a sync, then
`getAllScheduledNotificationsAsync()` and compare the pending list against the
planner's output — count, identifiers, fire dates, categories and attachments.
That verifies the executor against the plan without waiting for anything. Rich
presentation (card, subtitle, buttons) is verified separately with a debug
`TIME_INTERVAL` trigger a few seconds out, and confirmed on screenshot.

## Risks

- **Card art has to be produced.** Whether this Mac has a working SVG→PNG
  converter is unverified. This gets checked before the static-art path is
  committed to; if there is nothing usable, the choice is the rendered-card path
  or shipping without attachments, and it will be raised rather than quietly
  dropped.
- **A native rebuild is required** for the time-sensitive entitlement and
  `expo-asset`. The `expo-modules-jsi` patch is load-bearing for this project and
  must survive it — `postinstall` runs `patch-package`, but the rebuild is where
  it will be proven.
- **`timeSensitive` needs its entitlement to have any effect.** Without it iOS
  quietly downgrades the interruption level, which would look like it works
  while the last call keeps getting muted by Focus.
- **The 64 cap's eviction policy is not depended on**, only the cap itself.
- **Speculative post-trial roasts can be wrong** if bro cancels a trial outside
  the app and never opens it again. He gets roasted about a subscription he does
  not have. Judged the better failure: the opposite error costs money.

## Out of scope

- Notification Content Extension / custom notification UI (Rung 3).
- Per-sub rendered card images (the `cards.ts` seam exists for it; not built).
- User-configurable lead times.
- Android-specific channel and ladder tuning. `subtitle`, `attachments` and
  `interruptionLevel` are iOS-only and are ignored gracefully elsewhere; Android
  must keep working, but is not optimised here.
- Remote push of any kind. Everything stays local and offline.
- Per-service cancellation links from the panic screen.

## Implementation notes

Two things the device changed about this design.

**Attachments are moved, not copied.** iOS takes ownership of an attachment's
file when the notification is scheduled, moving it into its own store. The
design assumed four bundled PNGs resolved through `expo-asset` would be enough;
in practice the first roast to use a card consumed the file and every later
roast failed with `ERR_NOTIFICATIONS_FAILED_TO_SCHEDULE`. Because the executor
catches and skips a roast that throws, this was silent: the first sync armed 4
of 60 roasts, and the second armed 0 — while the Roasts screen cheerfully
reported roasts were queued. `cards.ts` now copies the card to its own file per
roast, which adds `expo-file-system` (and so a native rebuild) to the
dependency list stated above. `card-names.ts` holds the pure part, so the
"every roast gets a distinct file" property is unit-tested rather than trusted.

This is exactly the failure the readback diff was specified to catch, and it
would not have been visible to typechecking, to unit tests, or to a screenshot
of the app's own UI.

**Month arithmetic was broken before this feature touched it.** Walking twelve
cycles forward exposed that `setMonth` turns a Jan 31 charge into Mar 3 —
skipping February's charge entirely — and that stepping one `advance` at a time
ratchets a month-end charge down (31 -> 30 -> 30) and never lets it back up.
`nextDate` and `advance` now clamp to the end of short months, and the planner
measures every cycle from a single anchor. This changes dates the home screen
shows too, in the direction of being correct.
