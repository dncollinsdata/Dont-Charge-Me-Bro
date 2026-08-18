/** Rotating avatar-chip fills, so a list of leeches reads as a sticker sheet. */
const CHIP_COLORS = ["#ffe14d", "#8fd0ff", "#ff9ecb", "#a5f56b", "#ffb47a"];

export function chipColor(i: number) {
  return CHIP_COLORS[i % CHIP_COLORS.length];
}
