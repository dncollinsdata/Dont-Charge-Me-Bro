import { addMonths, addYears, iso, nextDate, type RoastTone, type Sub } from "./trials";

/** One rung of the ladder: how far out, at what hour, in what voice. */
export type Lead = { days: number; hour: number; tone: RoastTone };

const LAST_TWO: Lead[] = [
  { days: 0, hour: 9, tone: "morningOf" },
  { days: 0, hour: 20, tone: "lastCall" },
];

/** A trial or a monthly gets three days' notice. */
const MONTHLY_LADDER: Lead[] = [
  { days: 3, hour: 9, tone: "headsUp" },
  { days: 1, hour: 9, tone: "headsUp" },
  ...LAST_TWO,
];

/** An annual charge is big enough to deserve a running start. */
const YEARLY_LADDER: Lead[] = [
  { days: 14, hour: 9, tone: "headsUp" },
  { days: 7, hour: 9, tone: "headsUp" },
  { days: 1, hour: 9, tone: "headsUp" },
  ...LAST_TWO,
];

/** How many charges ahead we look. The budget trims long before this bites. */
const CYCLES = 12;

/**
 * iOS keeps at most 64 pending local notifications per app and discards the
 * rest without telling anyone. We trim to our own smaller number so that limit
 * is never the thing deciding which roasts survive — and so the keepalive
 * always has a slot.
 */
const BUDGET = 60;

/** How long before the horizon we admit we are running out of ammo. */
const KEEPALIVE_LEAD_DAYS = 1;

function ladderFor(sub: Sub): Lead[] {
  return sub.cycle === "yearly" ? YEARLY_LADDER : MONTHLY_LADDER;
}

export type PlannedRoast = {
  key: string;
  subId: string;
  name: string;
  amount: number;
  chargeISO: string;
  fireAt: Date;
  days: number;
  tone: RoastTone;
};

export type Plan = {
  /** What to schedule, soonest first, already trimmed to the budget. */
  roasts: PlannedRoast[];
  /** When the last surviving roast fires — how far coverage actually reaches. */
  horizon: Date | null;
  /** Candidates the budget could not fit. Non-zero means coverage ran short. */
  dropped: number;
  /** When to tell bro to reopen the app, or null if coverage did not run short. */
  keepalive: Date | null;
};

/**
 * The k-th charge from now, measured from a single anchor. Stepping one
 * `advance` at a time would re-anchor on each clamped result, ratcheting a
 * 31st charge down to the 30th and then the 28th and never letting it back up.
 */
function chargeFor(sub: Sub, first: string, k: number): string {
  if (k === 0) return first;
  const anchor = new Date(first + "T00:00:00");
  return iso(sub.cycle === "yearly" ? addYears(anchor, k) : addMonths(anchor, k));
}

function moment(chargeISO: string, lead: Lead): Date {
  const at = new Date(chargeISO + "T00:00:00");
  at.setDate(at.getDate() - lead.days);
  at.setHours(lead.hour, 0, 0, 0);
  return at;
}

export function planRoasts(
  subs: Sub[],
  opts: { now: Date; cycles?: number; budget?: number },
): Plan {
  const cycles = opts.cycles ?? CYCLES;
  const budget = opts.budget ?? BUDGET;
  const roasts: PlannedRoast[] = [];

  for (const sub of subs) {
    // Past the first cycle we speculate that a trial bro let bill is now a
    // monthly — the same rule `advance` uses. If he cancelled instead, the next
    // app open re-plans and these disappear; the opposite error costs money.
    const first = nextDate(sub);
    for (let cycle = 0; cycle < cycles; cycle++) {
      const chargeISO = chargeFor(sub, first, cycle);
      for (const lead of ladderFor(sub)) {
        const fireAt = moment(chargeISO, lead);
        if (fireAt.getTime() <= opts.now.getTime()) continue;
        roasts.push({
          key: `${sub.id}:${chargeISO}:${lead.days}:${lead.hour}`,
          subId: sub.id,
          name: sub.name,
          amount: sub.amount,
          chargeISO,
          fireAt,
          days: lead.days,
          tone: lead.tone,
        });
      }
    }
  }

  // Sorting everything before trimming is what makes the budget correct: the
  // roasts we sacrifice are always the most distant ones, which are also the
  // ones most likely to be re-planned before they would have fired.
  roasts.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());

  const kept = roasts.slice(0, budget);
  const dropped = roasts.length - kept.length;
  const horizon = kept.length ? kept[kept.length - 1].fireAt : null;

  let keepalive: Date | null = null;
  if (dropped > 0 && horizon) {
    keepalive = new Date(horizon);
    keepalive.setDate(keepalive.getDate() - KEEPALIVE_LEAD_DAYS);
  }

  return { roasts: kept, horizon, dropped, keepalive };
}
