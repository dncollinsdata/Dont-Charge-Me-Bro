

export const C = {
  ink: "#111111",
  white: "#ffffff",
  sky: "#8fd0ff",
  skyDeep: "#bfe3ff",
  pink: "#ff2f8e",
  pinkDeep: "#e11d74",
  yellow: "#ffe14d",
  lime: "#a5f56b",
  steel: "#33506b",
  locked: "#dfe9f2",
  muted: "#666666",
  faint: "#999999",
} as const;

export const F = {
  display: "TitanOne_400Regular",
  semi: "Nunito_600SemiBold",
  bold: "Nunito_800ExtraBold",
  black: "Nunito_900Black",
} as const;

/**
 * Spelled out rather than typed as ViewStyle/TextStyle: RN types those two as
 * mutually unassignable (cursor, userSelect), and these compose into both View
 * and TextInput style props.
 */
type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

type StickerStyle = ShadowStyle & {
  borderWidth: number;
  borderColor: string;
};

/**
 * The whole look hangs off these: a hard offset shadow with zero blur.
 * shadowRadius 0 + full opacity is what turns iOS's soft shadow into a sticker.
 */
export function hardShadow(offset = 4): ShadowStyle {
  return {
    shadowColor: C.ink,
    shadowOffset: { width: offset, height: offset },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: offset,
  };
}

export function sticker(offset = 4): StickerStyle {
  return { borderWidth: 3, borderColor: C.ink, ...hardShadow(offset) };
}
