import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { C, F, hardShadow, sticker, textShadow } from "./theme";

const TONES = {
  pink: { bg: C.pink, fg: C.white },
  lime: { bg: C.lime, fg: C.ink },
  yellow: { bg: C.yellow, fg: C.ink },
  white: { bg: C.white, fg: C.ink },
  ink: { bg: C.ink, fg: C.white },
} as const;

export function Btn({
  tone = "pink",
  label,
  onPress,
  disabled,
  style,
  textStyle,
  shadow = 5,
}: {
  tone?: keyof typeof TONES;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  shadow?: number;
}) {
  const { bg, fg } = TONES[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      // The sticker slides into its own shadow on press.
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: 999,
          paddingVertical: 15,
          paddingHorizontal: 16,
          alignItems: "center",
          opacity: disabled ? 0.45 : 1,
        },
        sticker(shadow),
        pressed && !disabled && { transform: [{ translateX: 3 }, { translateY: 3 }], ...hardShadow(1) },
        style,
      ]}
    >
      <Text style={[{ fontFamily: F.display, fontSize: 18, color: fg }, textStyle]}>{label}</Text>
    </Pressable>
  );
}

export function Card({
  children,
  style,
  shadow = 4,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  shadow?: number;
}) {
  return (
    <View style={[styles.card, sticker(shadow), style]}>{children}</View>
  );
}

export function Heading({
  children,
  size = 26,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        { fontFamily: F.display, fontSize: size, color: C.ink },
        // The white offset shadow is what lifts Titan One off the sky blue.
        // Page titles only — the small section headings are flat in the design.
        size >= 20 && textShadow("#ffffff", size >= 40 ? 4 : 3),
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#9aa7b5"
      {...props}
      style={[styles.field, sticker(3), props.style]}
    />
  );
}

/** Three-up pill selector used for cycle type and roast level. */
export function Segmented<T extends string>({
  value,
  options,
  onPick,
}: {
  value: T;
  options: { value: T; label: string }[];
  onPick: (value: T) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onPick(o.value)}
            style={[
              styles.segment,
              sticker(3),
              on && { backgroundColor: C.ink, shadowColor: "rgba(0,0,0,0.25)" },
            ]}
          >
            <Text
              style={{
                fontFamily: F.black,
                fontSize: 12,
                color: on ? C.white : C.ink,
                textAlign: "center",
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Coloured initial tile that makes a list read as a sticker sheet. */
export function Chip({ letter, color }: { letter: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color }]}>
      <Text style={{ fontFamily: F.display, fontSize: 16, color: C.ink }}>{letter}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 12,
  },
  fieldLabel: {
    fontFamily: F.black,
    fontSize: 11,
    letterSpacing: 0.55,
    color: C.ink,
    marginBottom: 6,
  },
  field: {
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: F.bold,
    fontSize: 15,
    color: C.ink,
  },
  segment: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  chip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.ink,
  },
  screen: {
    flex: 1,
    backgroundColor: C.sky,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});
