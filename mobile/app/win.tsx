import { useLocalSearchParams, useRouter } from "expo-router";
import { Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PopIn, Wobble } from "../src/anim";
import { shouldAskForReview } from "../src/lib/review";
import { askForReview } from "../src/lib/store-review";
import { money } from "../src/lib/trials";
import { useStore } from "../src/store";
import { C, F, sticker } from "../src/theme";
import { Btn } from "../src/ui";

/**
 * The trophy for a cancelled charge. The losing path always had a shareable
 * artifact — the L receipt — while the winning path produced a 2.6 second toast
 * and nothing else. This is the moment worth showing someone.
 */
export default function WinScreen() {
  const { prefs, streak, showToast, markReviewAsked } = useStore();
  const { name, amount } = useLocalSearchParams<{ name?: string; amount?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const rescued = Number(amount ?? 0);
  const leech = name ?? "that leech";

  async function share() {
    try {
      await Share.share({
        message: `just cancelled ${leech} before it charged me ${money(rescued)}. ${money(Math.round(prefs.saved))} kept from companies I forgot about 🏆 Don't Charge Me Bro`,
      });
    } catch {
      showToast("couldn't share that W 😔");
    }
  }

  /**
   * The review ask rides out on the back of a win, not a cold app launch — and
   * only once the celebration has been seen.
   */
  function done() {
    if (shouldAskForReview(prefs)) {
      setTimeout(() => {
        askForReview().then((asked) => {
          if (asked) markReviewAsked();
        });
      }, 700);
    }
    router.replace("/");
  }

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
    >
      <Wobble duration={800}>
        <Text style={styles.trophy}>🏆</Text>
      </Wobble>

      <PopIn duration={400}>
        <Text style={styles.title}>CERTIFIED{"\n"}W</Text>
      </PopIn>

      <View style={styles.card}>
        <Text style={styles.kept}>{money(rescued)}</Text>
        <Text style={styles.keptNote}>
          kept from {leech}. it never even touched the account. 💅
        </Text>

        <View style={styles.rule} />

        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>KEPT ALL TIME</Text>
            <Text style={styles.statValue}>{money(Math.round(prefs.saved))}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>W STREAK</Text>
            <Text style={styles.statValue}>{streak}d</Text>
          </View>
        </View>
      </View>

      <Btn tone="lime" label="SHARE THIS W 📤" onPress={share} textStyle={{ fontSize: 18 }} />

      <Text accessibilityRole="button" onPress={done} suppressHighlighting style={styles.done}>
        done ✌️
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.lime,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  trophy: { fontSize: 40, textAlign: "center" },
  title: {
    fontFamily: F.display,
    fontSize: 52,
    lineHeight: 52,
    color: C.white,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18,
    transform: [{ rotate: "-2deg" }],
    textShadowColor: C.ink,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
    transform: [{ rotate: "1deg" }],
    ...sticker(6),
  },
  kept: { fontFamily: F.display, fontSize: 44, color: C.ink, textAlign: "center" },
  keptNote: {
    fontFamily: F.bold,
    fontSize: 14,
    lineHeight: 20,
    color: C.steel,
    textAlign: "center",
    marginTop: 4,
  },
  rule: { height: 3, backgroundColor: C.ink, marginVertical: 14, borderRadius: 2 },
  statRow: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, alignItems: "center" },
  statLabel: { fontFamily: F.black, fontSize: 10, letterSpacing: 0.7, color: C.muted },
  statValue: { fontFamily: F.display, fontSize: 24, color: C.ink, marginTop: 2 },
  done: {
    fontFamily: F.black,
    fontSize: 14,
    color: C.ink,
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 16,
    paddingVertical: 12,
  },
});
