import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { money, ranForLabel } from "../../src/lib/trials";
import { useStore } from "../../src/store";
import { C, F, sticker } from "../../src/theme";
import { Btn, Heading } from "../../src/ui";

type Medal = { emoji: string; title: string; body: string; locked: boolean };

export default function ShameScreen() {
  const { wasted, wastedTotal, prefs, streak } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const ranked = [...wasted].sort((a, b) => b.amount - a.amount);

  const medals: Medal[] = [
    {
      emoji: "🩸",
      title: "FIRST BLOOD",
      body: "cancelled his first trial. a nation wept.",
      locked: prefs.wins < 1,
    },
    {
      emoji: "✂️",
      title: "SERIAL YEETER",
      body: "ten confirmed Ws. companies fear him.",
      locked: prefs.wins < 10,
    },
    {
      emoji: "🔥",
      title: "CLOSE CALL",
      body: "cancelled with 0 days left. absolute cinema.",
      locked: prefs.closestCall === null || prefs.closestCall > 0,
    },
    {
      emoji: "🏅",
      title: "FLAWLESS MONTH",
      body: "30 days, zero charges. locked. for now.",
      locked: streak < 30,
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <Heading style={styles.title}>HALL OF SHAME 💀</Heading>
      <Text style={styles.sub}>money donated to companies bro forgot about:</Text>

      <View style={styles.total}>
        <Text style={styles.totalValue}>{money(Math.round(wastedTotal))}</Text>
        <Text style={styles.totalNote}>lifetime figure. it does NOT get better. 😭</Text>
      </View>

      <Heading size={15} style={{ marginBottom: 9 }}>
        TOP DONATIONS 🏆
      </Heading>
      <View style={{ gap: 8, marginBottom: 18 }}>
        {ranked.map((w, i) => (
          <View key={w.id} style={styles.row}>
            <Text style={styles.rank}>{i + 1}</Text>
            <Text numberOfLines={1} style={styles.rowName}>
              {w.name} <Text style={styles.rowRan}>({ranForLabel(w)})</Text>
            </Text>
            <Text style={styles.rowAmount}>{money(w.amount)}</Text>
          </View>
        ))}
        {ranked.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              clean record so far 😇 let one charge slip and it lands here forever.
            </Text>
          </View>
        )}
      </View>

      <Heading size={15} style={{ marginBottom: 9 }}>
        STICKER BOOK 🎖️
      </Heading>
      <View style={styles.medalGrid}>
        {medals.map((m) => (
          <View
            key={m.title}
            style={[styles.medal, m.locked && { backgroundColor: C.locked, opacity: 0.55 }]}
          >
            <Text style={{ fontSize: 24 }}>{m.locked ? "🔒" : m.emoji}</Text>
            <Text style={styles.medalTitle}>{m.title}</Text>
            <Text style={styles.medalBody}>{m.body}</Text>
          </View>
        ))}
      </View>

      <LinearGradient
        colors={["#ffe14d", "#ff9ecb", "#ff2f8e"]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={styles.mascot}
      >
        <Text style={styles.mascotEmoji}>😭</Text>
        <Text style={[styles.mascotEmoji, { fontSize: 44 }]}>📱</Text>
        <Text style={styles.mascotEmoji}>💸</Text>
      </LinearGradient>
      <Text style={styles.mascotCaption}>live footage of bro checking his statement</Text>

      <Btn
        tone="white"
        label="PRINT THE RECEIPT 🧾"
        shadow={4}
        textStyle={{ fontSize: 15 }}
        style={{ paddingVertical: 12 }}
        onPress={() => router.push("/receipt")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.sky },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  title: { marginBottom: 4, transform: [{ rotate: "-1deg" }] },
  sub: { fontFamily: F.bold, fontSize: 13, color: C.steel, marginBottom: 12 },
  total: {
    backgroundColor: C.yellow,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
    transform: [{ rotate: "-1deg" }],
    ...sticker(5),
  },
  totalValue: { fontFamily: F.display, fontSize: 44, color: C.ink },
  totalNote: { fontFamily: F.black, fontSize: 11, color: C.ink, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.white,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    ...sticker(4),
  },
  rank: { fontFamily: F.display, fontSize: 16, width: 24, textAlign: "center", color: C.ink },
  rowName: { flex: 1, fontFamily: F.bold, fontSize: 13, color: C.ink },
  rowRan: { fontSize: 11, color: C.muted },
  rowAmount: { fontFamily: F.display, fontSize: 14, color: C.ink },
  empty: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: C.ink,
    borderStyle: "dashed",
    padding: 20,
  },
  emptyText: { fontFamily: F.black, fontSize: 13, color: C.ink, textAlign: "center" },
  medalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  medal: {
    width: "47.5%",
    flexGrow: 1,
    backgroundColor: C.white,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...sticker(4),
  },
  medalTitle: { fontFamily: F.display, fontSize: 13, color: C.ink, marginTop: 4 },
  medalBody: { fontFamily: F.bold, fontSize: 11, color: "#444444", marginTop: 2 },
  mascot: {
    height: 190,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 6,
    transform: [{ rotate: "1deg" }],
    ...sticker(4),
  },
  mascotEmoji: { fontSize: 64 },
  mascotCaption: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.steel,
    textAlign: "center",
    marginBottom: 16,
  },
});
