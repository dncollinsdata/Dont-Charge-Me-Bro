import { streakDays, type Prefs } from "./trials";

export type Sticker = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  /** Whether bro has earned it yet. */
  earned: (prefs: Prefs) => boolean;
};

/**
 * The sticker book. Lives here rather than inside the Hall of Shame screen so
 * the store can spot the moment one is earned — an achievement nobody witnesses
 * is not an achievement.
 */
export const STICKERS: Sticker[] = [
  {
    id: "first-blood",
    emoji: "🩸",
    title: "FIRST BLOOD",
    body: "cancelled his first trial. a nation wept.",
    earned: (p) => p.wins >= 1,
  },
  {
    id: "serial-yeeter",
    emoji: "✂️",
    title: "SERIAL YEETER",
    body: "ten confirmed Ws. companies fear him.",
    earned: (p) => p.wins >= 10,
  },
  {
    id: "close-call",
    emoji: "🔥",
    title: "CLOSE CALL",
    body: "cancelled with 0 days left. absolute cinema.",
    earned: (p) => p.closestCall !== null && p.closestCall <= 0,
  },
  {
    id: "flawless-month",
    emoji: "🏅",
    title: "FLAWLESS MONTH",
    body: "30 days, zero charges. untouchable.",
    earned: (p) => streakDays(p.streakSince) >= 30,
  },
];

export function unlockedStickers(prefs: Prefs): string[] {
  return STICKERS.filter((s) => s.earned(prefs)).map((s) => s.id);
}

/** The stickers that went from locked to earned between two states. */
export function newStickers(before: Prefs, after: Prefs): Sticker[] {
  const had = new Set(unlockedStickers(before));
  return STICKERS.filter((s) => s.earned(after) && !had.has(s.id));
}
