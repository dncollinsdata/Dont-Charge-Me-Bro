import { money, type RoastLevel } from "./trials";

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

export function roastLine(
  level: RoastLevel,
  name: string,
  days: number,
  amount: number,
) {
  return LINES[level](name, days, money(amount));
}
