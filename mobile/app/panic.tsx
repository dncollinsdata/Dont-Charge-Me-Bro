import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PopIn, Wobble } from "../src/anim";
import { money, panicWhen, type Row } from "../src/lib/trials";
import { useStore } from "../src/store";
import { C, F, sticker } from "../src/theme";
import { Btn } from "../src/ui";

export default function PanicScreen() {
  const { rows, panic, yeet, letItCharge, showToast } = useStore();
  const { subId, from } = useLocalSearchParams<{ subId?: string; from?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Arriving from a roast means panicking about that specific leech; arriving
  // from the tab bar means panicking about whatever charges today.
  const target = subId ? (rows.find((r) => r.sub.id === subId) ?? null) : panic;

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <Wobble duration={700}>
        <Text style={styles.siren}>🚨</Text>
      </Wobble>

      <PopIn duration={400}>
        <Text style={styles.title}>
          {target ? target.sub.name.toUpperCase() : "NOTHING"}
          {"\n"}CHARGES{"\n"}
          {target ? panicWhen(target.days) : "TODAY 💀"}
        </Text>
      </PopIn>

      <View style={styles.body}>
        <Text style={styles.bodyText}>{bodyCopy(target)}</Text>
      </View>

      <Btn
        tone="lime"
        label="I CANCELLED IT (W) 🏆"
        textStyle={{ fontSize: 18 }}
        onPress={() => {
          if (target) yeet(target);
          close();
          showToast("CERTIFIED W 🏆 the streak lives");
        }}
      />

      {from === "roast" && target && (
        <Text style={styles.check}>you actually cancelled it, right? 👀</Text>
      )}

      <Pressable
        accessibilityRole="button"
        // A bare Pressable around one 13pt line is a ~18pt target; pad it out to
        // the 44pt minimum so the escape hatch is actually reachable.
        style={styles.acceptHit}
        hitSlop={8}
        onPress={() => {
          if (target) letItCharge(target);
          close();
          showToast("streak: deceased 🪦 rip");
        }}
      >
        <Text style={styles.accept}>charge me ig… (L + ratio)</Text>
      </Pressable>
    </View>
  );
}

/**
 * The midnight line is only true on the day itself. A roast three days out has
 * to sound urgent without claiming a deadline that has not arrived.
 */
function bodyCopy(target: Row | null) {
  if (!target) return "crisis averted. nothing charges today.";
  const amount = money(target.sub.amount);
  if (target.days <= 0) {
    return `${amount} leaves the account at midnight. the free trial bro SWORE he'd remember?? it's here. this is NOT a drill. this is a DEBIT. 🗣️`;
  }
  const days = target.days === 1 ? "tomorrow" : `in ${target.days} days`;
  return `${amount} goes out ${days}. bro SWORE he'd cancel this one. the clock is running and it does not care. handle it NOW. 🗣️`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.pink,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  siren: { fontSize: 34, textAlign: "center" },
  title: {
    fontFamily: F.display,
    fontSize: 44,
    lineHeight: 46,
    color: C.white,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 16,
    transform: [{ rotate: "-2deg" }],
    textShadowColor: C.ink,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  body: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 24,
    transform: [{ rotate: "1deg" }],
    ...sticker(6),
  },
  bodyText: {
    fontFamily: F.bold,
    fontSize: 15,
    lineHeight: 22,
    color: C.ink,
    textAlign: "center",
  },
  acceptHit: {
    marginTop: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignSelf: "center",
  },
  check: {
    fontFamily: F.black,
    fontSize: 13,
    color: C.white,
    textAlign: "center",
    marginTop: 14,
    opacity: 0.9,
  },
  accept: {
    fontFamily: F.black,
    fontSize: 13,
    color: C.white,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
