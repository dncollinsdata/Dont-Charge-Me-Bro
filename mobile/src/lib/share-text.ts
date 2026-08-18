import { money } from "./trials";

/**
 * The caption that rides along with the shared card.
 *
 * The dodged charge keeps its cents — it is a real figure off a real invoice —
 * while the lifetime total is rounded, because it is a brag and brags are round.
 */
export function winShareText(name: string, rescued: number, savedTotal: number) {
  return `just cancelled ${name} before it charged me ${money(rescued)}. ${money(Math.round(savedTotal))} kept from companies I forgot about 🏆 Don't Charge Me Bro`;
}

export function shameShareText(wastedTotal: number) {
  return `I have donated ${money(Math.round(wastedTotal))} to companies I forgot about. Don't Charge Me Bro 🧾`;
}
