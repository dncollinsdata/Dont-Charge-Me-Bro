# App Store listing — Don't Charge Me Bro

Everything App Store Connect asks for, in the order it asks for it.
Character limits are noted, and every count below has been checked.

---

## URLs

| Field in App Store Connect | Value |
| --- | --- |
| Privacy Policy URL (**required**) | `https://dontchargeme.app/privacy/` |
| Support URL (**required**) | `https://dontchargeme.app/` |
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

## Description (4000 max — 2009 used)

```
Every free trial you forget turns into a subscription you never wanted. Don't Charge Me Bro exists to make that stop.

Add a trial in five seconds — the name, the damage, and the day it bites. Then the app does one job, loudly: it warns you while the money is still yours.

WARNED BEFORE IT CHARGES
Trials and monthly charges get three days' notice, then a day, then the morning of, then a final 8pm last call while the money is still yours. Annual charges — the ones that really hurt — start their countdown two weeks out. Every reminder is scheduled with iOS, so they arrive whether or not you've opened the app in weeks. Tap one and you land straight on the panic screen: the deadline in huge letters, the amount about to go, and a clear path to cancelling.

PICK HOW MEAN IT IS
Mild, medium, or UNHINGED. Mild is a polite heads-up. Unhinged is your phone screaming that Netflix is outside your house. Your call — change it any time.

THE REAL NUMBER
See what your subscriptions actually cost per month, once they stop being free. It is never the number you assumed.

CLAIM THE W
Cancel in time and the app hands you a trophy card with the exact charge you dodged, adds it to your lifetime savings, and keeps your streak alive. Share the card if you want the credit.

THE HALL OF SHAME
Let one charge through and it lives in the Hall of Shame forever, ranked by how much you have donated to companies you forgot about. Motivating, in the worst way.

$1.99. ONCE.
The app that kills subscriptions isn't going to be one. Pay once and that's the end of it — no subscription, no in-app purchases, no pro tier, no ads, no upsell, ever.

NOTHING LEAVES YOUR PHONE
No account. No sign-in. No card details. No server, no sync, no analytics, no trackers. Your list is stored on your device and nowhere else — which is also why deleting the app deletes everything.

Don't Charge Me Bro is a reminder, not a cancellation service. You cancel with the company that bills you; the app makes sure you never miss the date.
```

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

## Pre-submission checklist

- [ ] Fill the two `[LEGAL NAME / TRADING NAME]` and `[JURISDICTION]` placeholders in [landing/terms/index.html](landing/terms/index.html).
- [ ] Set up `support@dontchargeme.app` (or swap it for a real address in both legal pages and the site footer).
- [ ] Deploy `landing/` and confirm `/privacy/` and `/terms/` both load.
- [ ] Update the landing hero — it still says "COMING TO IPHONE" and "no App Store listing yet".
- [ ] Screenshots: 6.9" and 6.5" iPhone sets. Best five, in order: Home with a panic banner, the roast on a lock screen, ADD, the trophy/win card, the Hall of Shame.
