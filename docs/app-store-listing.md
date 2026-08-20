# App Store listing — Don't Charge Me Bro

Everything App Store Connect asks for, in the order it asks for it.
Character limits are noted, and every count below has been checked.

---

## URLs

| Field in App Store Connect | Value |
| --- | --- |
| Privacy Policy URL (**required**) | `https://dontchargeme.app/privacy/` |
| Support URL (**required**) | `https://dontchargeme.app/support/` |
| Marketing URL (optional) | `https://dontchargeme.app/` |
| License Agreement / EULA (optional) | `https://dontchargeme.app/terms/` |

Both pages ship in this repo: [landing/privacy/index.html](landing/privacy/index.html)
and [landing/terms/index.html](landing/terms/index.html). They go live with the next
`npx wrangler deploy` from `landing/`.

If you leave the EULA field alone, Apple applies its standard licence agreement and
`/terms/` is simply the link in the site footer. Custom EULA text is entered in App
Store Connect under **App Information → License Agreement**, where you can paste the
body of the terms page.

---

## Name and subtitle

**App Name** (30 max — 19 used)

```
Don't Charge Me Bro
```

**Subtitle** (30 max — 27 used)

```
Free trial & renewal alerts
```

Alternates, both within the limit: `Cancel it before it charges` (27) ·
`Kill the subscriptions` (22)

---

## Promotional text (170 max — 167 used)

Editable any time without a new build. Use it for the launch push.

```
Free trials end. Bro forgets. Bro pays $14.99 for an app he opened once. Not anymore: add a trial in five seconds and get roasted before the money leaves. $1.99, once.
```

---

## Description (4000 max — 2400 used)

```
Don't Charge Me Bro tracks your free trials and subscriptions and warns you before each one charges. Add what you're signed up for, and the app counts down to every renewal date so that none of them arrive as a surprise.

WHAT YOU TRACK
Free trials, monthly subscriptions, and annual plans. Enter the name, the amount, and the date it bills — that's the whole setup. When a trial bills, it becomes a monthly automatically and keeps warning you every cycle after that.

WARNED BEFORE IT CHARGES
Trials and monthly charges get three days' notice, then a day, then the morning of, then a final 8pm last call while the money is still yours. Annual plans — the ones that really hurt — start their countdown two weeks out. Every reminder is scheduled with iOS, so they arrive whether or not you've opened the app in weeks.

THE PANIC SCREEN
Every reminder carries the name, the amount, and how long you have left, plus buttons that drop you straight into the app. There you get the deadline in huge letters and a clear path to cancelling, while there is still time to do it.

PICK HOW MEAN IT IS
Three roast levels. Mild is a polite heads-up. Unhinged is your phone screaming that Netflix is outside your house. Change it whenever you like.

THE REAL NUMBER
Your total monthly drain across everything you've added, counted as though the free parts have already stopped being free. It is never the number you assumed.

CLAIM THE W
Cancel in time and the app hands you a trophy card showing the exact charge you dodged, adds it to your lifetime savings, and keeps your win streak alive. Share the card if you want the credit.

THE HALL OF SHAME
Let a charge through and it lands in the Hall of Shame, ranked by how much you have donated to companies you forgot about. Stickers unlock along the way — first cancellation, ten wins, a cancel with zero days to spare, a flawless month.

ONE PURCHASE, NO STRINGS
Buy it once and you own it. No subscription, no in-app purchases, no pro tier, no ads, no upsell.

NOTHING LEAVES YOUR PHONE
No account, no sign-in, no card details. No server, no sync, no analytics, no trackers. The app works entirely offline, your list lives on your device and nowhere else — which is also why deleting the app deletes all of it.

Don't Charge Me Bro is a reminder, not a cancellation service. You cancel with the company that bills you; the app makes sure you never miss the date.
```

---

### A note on the price

The description deliberately does not print "$1.99". Apple shows the price on the
product page already, and the literal figure is only correct in the US storefront —
every other one gets its own tier price, so a hardcoded number is wrong everywhere
else. The fact worth stating is the one the description keeps: bought once, with no
subscription, no in-app purchases, and no ads.

The same applies to the promotional text above, which does print $1.99. That is
defensible while the app ships to the US storefront only. If you add storefronts,
either localise that string per storefront or drop the figure from it too.

---

## Keywords (100 max — 94 used)

Comma-separated, no spaces after commas (spaces burn characters). Do not repeat
words already in the name or subtitle — Apple indexes those anyway.

```
subscription,tracker,cancel,billing,budget,spending,money,bills,expenses,recurring,due,manager
```

---

## What's New

Version 1.0 has no "What's New" field. For the first update:

```
Roasts now arrive with a card, a countdown, and buttons you can hit from the lock screen. Wins get a trophy you can share. Faster, louder, still $1.99 once.
```

---

## App Privacy (nutrition label)

Answer the questionnaire as **"Data Not Collected"** — every category, no exceptions.
This is true of the current build: the app makes no network requests, has no analytics
or crash-reporting SDK, and stores everything in local device storage.

- No account, no sign-in, no identifiers, no advertising identifier.
- No third-party SDKs that collect data.
- Notifications are scheduled locally by iOS; there is no push server.
- Sharing goes through the system share sheet at the user's initiative.

If a future build adds analytics, crash reporting, or any backend, this answer has to
change before that build ships — and so does [the privacy page](landing/privacy/index.html).

---

## Age rating

Answer every questionnaire item **None**, which yields **4+**. The roasts are shouty
and absurd but contain no profanity, no violence, no sexual content, and no gambling
or drug references.

Revisit this if the "unhinged" roast lines ever gain real profanity — that would make
it **12+** (Infrequent/Mild Profanity or Crude Humor).

---

## Category and pricing

- **Primary category:** Finance
- **Secondary category:** Productivity
- **Price:** Tier for $1.99 (paid up front, no in-app purchases)

Finance is the honest primary — the app is about money leaving your account, and the
Utilities shelf is far more crowded. Productivity as secondary keeps the reminder
angle discoverable.

---

## Notes for App Review

```
No account or login is required — the app opens straight to its own screens and everything works offline.

To see the core feature quickly: allow notifications on the last onboarding screen, then tap ADD, enter any name, an amount, and a date, and save. About eight seconds later the app delivers a one-off demo notification so you can see what a reminder looks like without waiting for a real date to approach. Notification permission is requested at the end of onboarding, and again from the ROASTS tab if it was deferred earlier.

The app schedules local notifications only. It makes no network requests, has no server, and collects no data. It does not connect to any bank, card, or App Store billing account, and it cannot cancel a subscription — it only reminds the user to do so themselves. All figures shown are arithmetic on what the user typed in.

The app is a single $1.99 purchase with no in-app purchases.
```

---

## Building and submitting

Run from `mobile/`, on a clean `main` — EAS archives what git tracks, so anything
uncommitted is not what gets built.

```
npm run build:ios
```

That is `eas build --platform ios --profile production --auto-submit`: it builds the
production profile and, when the build succeeds, uploads the result straight to App
Store Connect. From there the build appears in TestFlight, and you promote it to
review manually — auto-submit uploads, it does not release.

**First run only**, in order:

1. `eas login`
2. `eas init` — links the project and writes `extra.eas.projectId` into `app.json`. Commit that.
3. Create the app record in App Store Connect for bundle ID `com.dontchargemebro.app`. The submit step needs a record to upload into; it will not make one for you.
4. The first `--auto-submit` prompts for your Apple account and finds the App Store Connect app, then caches the answers. If you would rather pin it, put `ascAppId` (and optionally `appleId`, `appleTeamId`) in the `submit.production.ios` block of `eas.json`.

Notes on this setup:

- `appVersionSource: "remote"` plus `autoIncrement` means EAS owns the build number, so repeat TestFlight uploads never collide. The user-facing version stays the `version` field in `app.json` — bump that by hand for a real release.
- `app.json` requests the `com.apple.developer.usernotifications.time-sensitive` entitlement, which is what lets the 8pm last call through Focus. EAS syncs that capability onto the App ID during the build; if a build fails on provisioning, that entitlement is the first thing to check.
- `npm run build:ios:preview` produces an internal-distribution build for testing on a real device without touching App Store Connect.

---

## Pre-submission checklist

- [ ] Fill the three pink placeholders: `[LEGAL NAME / TRADING NAME]` in both [landing/privacy/index.html](landing/privacy/index.html) and [landing/terms/index.html](landing/terms/index.html), and `[JURISDICTION]` in the terms. Grep for `<mark>` to find them all.
- [ ] Set up `support@dontchargeme.app` (or swap it for a real address in both legal pages and the site footer). Apple emails this address, and Review checks that it works.
- [ ] Confirm the Support URL is set to `/support/`, not the apex.
- [ ] Deploy `landing/` and confirm `/privacy/`, `/terms/`, and `/support/` all load.
- [ ] Update the landing hero — it still says "COMING TO IPHONE" and "no App Store listing yet".
- [ ] Screenshots: 6.9" and 6.5" iPhone sets. Best five, in order: Home with a panic banner, the roast on a lock screen, ADD, the trophy/win card, the Hall of Shame.
