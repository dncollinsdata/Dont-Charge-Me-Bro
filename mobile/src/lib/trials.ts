export type Cycle = "trial" | "monthly" | "yearly";

export type Sub = {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  date: string; // ISO yyyy-mm-dd of the next charge / trial end
};

/** A subscription resolved against today — what every screen actually renders. */
export type Row = {
  sub: Sub;
  date: string;
  days: number;
};

/** One company that got paid because bro forgot. Grows each time a charge lands. */
export type WastedEntry = {
  id: string;
  name: string;
  periods: number;
  amount: number;
};

export type RoastLevel = "mild" | "medium" | "unhinged";

/** Which rung of the ladder a roast sits on — drives its copy and its card. */
export type RoastTone = "headsUp" | "morningOf" | "lastCall";

export type Prefs = {
  onboarded: boolean;
  roast: RoastLevel;
  /** ISO day the current clean streak started. */
  streakSince: string;
  /** Total leeches yeeted, ever. */
  wins: number;
  /** Fewest days left at the moment of a cancel — null until the first win. */
  closestCall: number | null;
  /** ISO day we asked for an App Store review. Null until we have. */
  reviewAskedAt: string | null;
};

export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function defaultPrefs(): Prefs {
  return {
    onboarded: false,
    roast: "unhinged",
    streakSince: todayISO(),
    wins: 0,
    closestCall: null,
    reviewAskedAt: null,
  };
}

export function daysUntil(iso: string) {
  const a = new Date(todayISO() + "T00:00:00");
  const b = new Date(iso + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function plusDays(n: number) {
  const d = new Date(todayISO() + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function iso(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/**
 * Add months, clamping to the end of a short month. Plain `setMonth` spills a
 * Jan 31 charge into March 3, which skips February's charge altogether — the
 * one month bro most needed warning about.
 */
export function addMonths(from: Date, n: number): Date {
  const d = new Date(from.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

/** Add years, clamping Feb 29 onto Feb 28 rather than spilling into March. */
export function addYears(from: Date, n: number): Date {
  return addMonths(from, n * 12);
}

/** Roll a past recurring date forward so the list always shows the NEXT charge. */
export function nextDate(sub: Sub): string {
  if (sub.cycle === "trial") return sub.date;
  const anchor = new Date(sub.date + "T00:00:00");
  const now = new Date(todayISO() + "T00:00:00");
  // Every step is measured from the original anchor, so a 31st charge stays on
  // the 31st in the months that have one instead of ratcheting down to the 28th.
  let step = 0;
  let d = anchor;
  while (d < now && step < 400) {
    step++;
    d = sub.cycle === "monthly" ? addMonths(anchor, step) : addYears(anchor, step);
  }
  return iso(d);
}

/**
 * Move a sub past the charge that just landed. A trial that was allowed to bill
 * is no longer a trial — it is a monthly subscription now.
 */
export function advance(sub: Sub): Sub {
  const d = new Date(nextDate(sub) + "T00:00:00");
  const cycle: Cycle = sub.cycle === "trial" ? "monthly" : sub.cycle;
  const next = cycle === "yearly" ? addYears(d, 1) : addMonths(d, 1);
  return { ...sub, cycle, date: iso(next) };
}

/**
 * What this leech drains per month if nobody intervenes. A trial counts at full
 * price — that is the whole point of the number.
 */
export function monthlyCost(sub: Sub) {
  return sub.cycle === "yearly" ? sub.amount / 12 : sub.amount;
}

export function money(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function countdownLabel(days: number) {
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

/** Loud countdown for the leech list. */
export function dueText(days: number) {
  if (days <= 0) return "TODAY 💀";
  if (days === 1) return "tomorrow 😬";
  return `${days} days`;
}

/** Countdown for the panic screen's display title, where `dueText` is too quiet. */
export function panicWhen(days: number) {
  if (days <= 0) return "TODAY 💀";
  if (days === 1) return "TOMORROW 😬";
  return `IN ${days} DAYS`;
}

/** Days survived without letting a charge through. */
export function streakDays(streakSince: string) {
  return Math.max(0, -daysUntil(streakSince));
}

export function ranForLabel(entry: WastedEntry) {
  return `${entry.periods} month${entry.periods === 1 ? "" : "s"}`;
}

/** Fold another charge into the hall of shame, merging by subscription id. */
export function addWasted(wasted: WastedEntry[], sub: Sub): WastedEntry[] {
  const existing = wasted.find((w) => w.id === sub.id);
  if (existing) {
    return wasted.map((w) =>
      w.id === sub.id ? { ...w, periods: w.periods + 1, amount: w.amount + sub.amount } : w,
    );
  }
  return [...wasted, { id: sub.id, name: sub.name, periods: 1, amount: sub.amount }];
}

/** Resolve every sub against today, soonest charge first. */
export function toRows(subs: Sub[]): Row[] {
  return subs
    .map((sub) => {
      const date = nextDate(sub);
      return { sub, date, days: daysUntil(date) };
    })
    .sort((a, b) => a.days - b.days);
}
