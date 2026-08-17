export type Cycle = "trial" | "monthly" | "yearly";

export type Sub = {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  date: string; // ISO yyyy-mm-dd of the next charge / trial end
  cancelUrl?: string;
};

const KEY = "dontcharge.subs.v1";

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

export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
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

export function monthlyCost(sub: Sub) {
  if (sub.cycle === "yearly") return sub.amount / 12;
  if (sub.cycle === "monthly") return sub.amount;
  return 0;
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
