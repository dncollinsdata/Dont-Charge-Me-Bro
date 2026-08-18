import { useRouter } from "expo-router";
import { useRef } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureCard } from "../src/lib/share-card";
import { shameShareText } from "../src/lib/share-text";
import { money, ranForLabel } from "../src/lib/trials";
import { useStore } from "../src/store";
import { C, F, sticker } from "../src/theme";
import { Btn } from "../src/ui";

/**
 * iOS ignores `borderStyle: "dashed"` on a single edge — it only draws dashes
 * when all four borders match — so a torn-receipt rule has to be drawn by hand.
 */
function DashedRule() {
  return (
    <View style={styles.rule}>
      {Array.from({ length: 28 }).map((_, i) => (
        <View key={i} style={styles.dash} />
      ))}
    </View>
  );
}

export default function ReceiptScreen() {
  const { wasted, wastedTotal, showToast } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cardRef = useRef<View>(null);

  const dateline = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function share() {
    const message = shameShareText(wastedTotal);
    const url = await captureCard(cardRef);
    try {
      await Share.share(url ? { message, url } : { message });
    } catch {
      showToast("couldn't share that L 😔");
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <Pressable accessibilityRole="button" onPress={() => router.back()}>
        <Text style={styles.back}>← hall of shame</Text>
      </Pressable>

      <View ref={cardRef} collapsable={false} style={styles.shot}>
      <View style={styles.receipt}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>OFFICIAL L RECEIPT 🧾</Text>
          <Text style={styles.headerMeta}>DON'T CHARGE ME BRO · {dateline}</Text>
        </View>
        <DashedRule />

        {wasted.map((w) => (
          <View key={w.id} style={styles.line}>
            <Text numberOfLines={1} style={styles.lineName}>
              {w.name} <Text style={styles.lineRan}>({ranForLabel(w)})</Text>
            </Text>
            <Text style={styles.lineAmount}>{money(w.amount)}</Text>
          </View>
        ))}

        {wasted.length === 0 && (
          <Text style={styles.nothing}>nothing to declare. suspiciously clean. 🧼</Text>
        )}

        <DashedRule />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL SHAME</Text>
          <Text style={styles.totalLabel}>{money(Math.round(wastedTotal))}</Text>
        </View>

        <View style={styles.barcode}>
          {Array.from({ length: 42 }).map((_, i) => (
            <View key={i} style={[styles.bar, { width: i % 3 === 0 ? 3 : 1.5 }]} />
          ))}
        </View>

        <Text style={styles.footer}>keep for your records. or don't. you won't. 🫡</Text>
      </View>
      </View>

      <Btn tone="pink" label="SHARE THIS L 📤" onPress={share} textStyle={{ fontSize: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.sky },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  back: { fontFamily: F.black, fontSize: 13, color: C.steel },
  shot: { backgroundColor: C.sky, paddingVertical: 6, paddingHorizontal: 4 },
  receipt: {
    backgroundColor: C.white,
    borderRadius: 6,
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginVertical: 14,
    transform: [{ rotate: "-1deg" }],
    ...sticker(6),
  },
  header: {
    alignItems: "center",
    paddingBottom: 12,
  },
  rule: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  dash: {
    width: 8,
    height: 3,
    backgroundColor: C.ink,
  },
  headerTitle: { fontFamily: F.display, fontSize: 19, color: C.ink },
  headerMeta: { fontFamily: F.black, fontSize: 10, letterSpacing: 0.8, color: C.muted, marginTop: 4 },
  line: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 4 },
  lineName: { flex: 1, fontFamily: F.bold, fontSize: 13, color: C.ink },
  lineRan: { fontSize: 11, color: C.faint },
  lineAmount: { fontFamily: F.bold, fontSize: 13, color: C.ink },
  nothing: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: { fontFamily: F.display, fontSize: 16, color: C.ink },
  barcode: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    height: 36,
    marginVertical: 16,
  },
  bar: { backgroundColor: C.ink, height: "100%" },
  footer: { fontFamily: F.bold, fontSize: 10, color: C.muted, textAlign: "center" },
});
