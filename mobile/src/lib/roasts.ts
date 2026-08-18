import { money, type RoastLevel, type RoastTone } from "./trials";

export const ROAST_LEVELS: { value: RoastLevel; label: string }[] = [
  { value: "mild", label: "mild 🧂" },
  { value: "medium", label: "medium 🌶️" },
  { value: "unhinged", label: "UNHINGED 🔥" },
];

function when(days: number) {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

function shoutWhen(days: number) {
  if (days <= 0) return "TODAY";
  if (days === 1) return "TOMORROW";
  return `IN ${days} DAYS`;
}

const LINES: Record<
  RoastLevel,
  (name: string, days: number, amount: string) => string
> = {
  mild: (name, days, amount) =>
    `${name} charges ${when(days)}. ${amount}. just so you know 😌`,
  medium: (name, days, amount) =>
    `bro. ${name}. ${days <= 0 ? "TODAY" : days === 1 ? "tomorrow" : days + " days"}. ${amount}. we've talked about this 🤨`,
  unhinged: (name, days, amount) =>
    `${name.toUpperCase()} IS OUTSIDE YOUR HOUSE 💀 ${amount}. ${shoutWhen(days)}. blink twice if you need help cancelling 🗣️🔥`,
};

/**
 * The 8pm roast. By this hour the day count has stopped meaning anything — the
 * only fact left is that the money leaves at midnight, which is the deadline
 * the panic screen has always claimed and nothing ever warned about.
 */
const LAST_CALL: Record<RoastLevel, (name: string, amount: string) => string> = {
  mild: (name, amount) => `${name} bills at midnight. ${amount}. last chance to bail 😬`,
  medium: (name, amount) =>
    `bro. midnight. ${name}. ${amount}. this is the last text i send 🤨`,
  unhinged: (name, amount) =>
    `⏰ MIDNIGHT. ${name.toUpperCase()}. ${amount}. IT IS COMING UP THE STAIRS. CANCEL IT OR ACCEPT YOUR FATE 💀🗣️`,
};

export function roastLine(
  level: RoastLevel,
  name: string,
  days: number,
  amount: number,
  tone: RoastTone = "headsUp",
) {
  if (tone === "lastCall") return LAST_CALL[level](name, money(amount));
  return LINES[level](name, days, money(amount));
}
