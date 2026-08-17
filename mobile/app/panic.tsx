import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { money } from "../src/lib/trials";
import { useStore } from "../src/store";
import { C, F, sticker } from "../src/theme";
import { Btn } from "../src/ui";

export default function PanicScreen() {
  const { panic, yeet, letItCharge, showToast } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.siren}>🚨</Text>

      <Text style={styles.title}>
        {panic ? panic.sub.name.toUpperCase() : "NOTHING"}
        {"\n"}CHARGES{"\n"}TODAY 💀
      </Text>

      <View style={styles.body}>
        <Text style={styles.bodyText}>
          {panic
            ? `${money(panic.sub.amount)} leaves the account at midnight. the free trial bro SWORE he'd remember?? it's here. this is NOT a drill. this is a DEBIT. 🗣️`
            : "crisis averted. nothing charges today."}
        </Text>
      </View>

      <Btn
        tone="lime"
        label="I CANCELLED IT (W) 🏆"
        textStyle={{ fontSize: 18 }}
        onPress={() => {
          if (panic) yeet(panic);
          close();
          showToast("CERTIFIED W 🏆 the streak lives");
        }}
      />

      <Pressable
        accessibilityRole="button"
        // A bare Pressable around one 13pt line is a ~18pt target; pad it out to
        // the 44pt minimum so the escape hatch is actually reachable.
        style={styles.acceptHit}
        hitSlop={8}
        onPress={() => {
          if (panic) letItCharge(panic);
          close();
          showToast("streak: deceased 🪦 rip");
        }}
      >
        <Text style={styles.accept}>charge me ig… (L + ratio)</Text>
      </Pressable>
    </View>
  );
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
  accept: {
    fontFamily: F.black,
    fontSize: 13,
    color: C.white,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
