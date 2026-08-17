export type Cycle = "trial" | "monthly" | "yearly";

export type Sub = {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  date: string; // ISO yyyy-mm-dd of the next charge / trial end
  cancelUrl?: string;
};

/** One company that got paid because bro forgot. Grows each time a charge lands. */
export type WastedEntry = {
  id: string;
  name: string;
  periods: number;
  amount: number;
};

/** A subscription resolved against today — what every screen actually renders. */
export type Row = {
  sub: Sub;
  date: string;
  days: number;
};

export type RoastLevel = "mild" | "medium" | "unhinged";

export type Prefs = {
  onboarded: boolean;
  roast: RoastLevel;
  /** ISO day the current clean streak started. */
  streakSince: string;
  /** Total leeches yeeted, ever. */
  wins: number;
  /** Fewest days left at the moment of a cancel — null until the first win. */
  closestCall: number | null;
};

const KEY = "dontcharge.subs.v1";
const WASTED_KEY = "dontcharge.wasted.v1";
const PREFS_KEY = "dontcharge.prefs.v1";

export function loadSubs(): Sub[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Sub[]) : [];
  } catch {
    return [];
  }
}

export function saveSubs(subs: Sub[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(subs));
  } catch {
    /* ignore */
  }
}

export function loadWasted(): WastedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WASTED_KEY);
    return raw ? (JSON.parse(raw) as WastedEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveWasted(wasted: WastedEntry[]) {
  try {
    window.localStorage.setItem(WASTED_KEY, JSON.stringify(wasted));
  } catch {
    /* ignore */
  }
}

export function defaultPrefs(): Prefs {
  return {
    onboarded: false,
    roast: "unhinged",
    streakSince: todayISO(),
    wins: 0,
    closestCall: null,
  };
}

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return defaultPrefs();
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw
      ? { ...defaultPrefs(), ...(JSON.parse(raw) as Partial<Prefs>) }
      : defaultPrefs();
  } catch {
    return defaultPrefs();
  }
}

export function savePrefs(prefs: Prefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export function daysUntil(iso: string) {
  const a = new Date(todayISO() + "T00:00:00");
  const b = new Date(iso + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Roll a past recurring date forward so the list always shows the NEXT charge. */
export function nextDate(sub: Sub): string {
  if (sub.cycle === "trial") return sub.date;
  const d = new Date(sub.date + "T00:00:00");
  const now = new Date(todayISO() + "T00:00:00");
  let guard = 0;
  while (d < now && guard++ < 400) {
    if (sub.cycle === "monthly") d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
  }
  return d.toISOString().slice(0, 10);
}

/**
 * Move a sub past the charge that just landed. A trial that was allowed to bill
 * is no longer a trial — it is a monthly subscription now.
 */
export function advance(sub: Sub): Sub {
  const d = new Date(nextDate(sub) + "T00:00:00");
  const cycle: Cycle = sub.cycle === "trial" ? "monthly" : sub.cycle;
  if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return { ...sub, cycle, date: d.toISOString().slice(0, 10) };
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

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function countdownLabel(days: number) {
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

export function plusDays(n: number) {
  const d = new Date(todayISO() + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Days survived without letting a charge through. */
export function streakDays(streakSince: string) {
  return Math.max(0, -daysUntil(streakSince));
}

/** Loud countdown for the leech list. */
export function dueText(days: number) {
  if (days <= 0) return "TODAY 💀";
  if (days === 1) return "tomorrow 😬";
  return `${days} days`;
}

export function ranForLabel(entry: WastedEntry) {
  return `${entry.periods} month${entry.periods === 1 ? "" : "s"}`;
}

/** Fold another charge into the hall of shame, merging by subscription id. */
export function addWasted(wasted: WastedEntry[], sub: Sub): WastedEntry[] {
  const existing = wasted.find((w) => w.id === sub.id);
  if (existing) {
    return wasted.map((w) =>
      w.id === sub.id
        ? { ...w, periods: w.periods + 1, amount: w.amount + sub.amount }
        : w,
    );
  }
  return [
    ...wasted,
    { id: sub.id, name: sub.name, periods: 1, amount: sub.amount },
  ];
}
