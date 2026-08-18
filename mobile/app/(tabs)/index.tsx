import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Wobble } from "../../src/anim";
import { chipColor } from "../../src/lib/chips";
import { dueText, money, type Row } from "../../src/lib/trials";
import { useStore } from "../../src/store";
import { C, F, sticker } from "../../src/theme";
import { Chip, Heading } from "../../src/ui";

export default function HomeScreen() {
  const { rows, panic, monthly, streak, yeet, showToast } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.titleRow}>
        <Heading size={28} style={styles.title}>
          DON'T CHARGE{"\n"}
          <Text style={{ color: C.pink }}>ME BRO!!</Text>
        </Heading>
        {panic && (
          <Wobble style={styles.alertBadge} duration={2000}>
            <Text style={styles.alertText}>SCAM{"\n"}ALERT!</Text>
          </Wobble>
        )}
      </View>

      {panic && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/panic")}
          style={({ pressed }) => [
            styles.panicCard,
            pressed && { transform: [{ rotate: "-1deg" }, { translateX: 2 }, { translateY: 2 }] },
          ]}
        >
          <Text style={styles.panicTitle}>😱 {panic.sub.name.toUpperCase()} CHARGES TODAY</Text>
          <Text style={styles.panicTeaser}>
            {money(panic.sub.amount)} about to leave the chat. NOT on our watch bestie.
          </Text>
          <View style={styles.panicCta}>
            <Text style={styles.panicCtaText}>HANDLE IT RN →</Text>
          </View>
        </Pressable>
      )}

      <View style={styles.statRow}>
        <View style={[styles.stat, { backgroundColor: C.white }]}>
          <Text style={styles.statLabel}>DRAIN / MO</Text>
          <Text style={styles.statValue}>{money(Math.round(monthly))}</Text>
        </View>
        <View style={[styles.stat, styles.statLime]}>
          <Text style={styles.statLabel}>W STREAK 🔥</Text>
          <Text style={styles.statValue}>{streak} days</Text>
        </View>
      </View>

      <Heading size={15} style={styles.sectionTitle}>
        THE LEECHES 🩸
      </Heading>

      <View style={{ gap: 9 }}>
        {rows.map((row, i) => (
          <LeechRow
            key={row.sub.id}
            row={row}
            color={chipColor(i)}
            onYeet={() => {
              yeet(row);
              showToast("YEETED. one less leech 🔥");
            }}
          />
        ))}

        {rows.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              no leeches?? 🥹 bro is FREE. add one when they come back.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function LeechRow({ row, color, onYeet }: { row: Row; color: string; onYeet: () => void }) {
  return (
    <View style={styles.leech}>
      <Chip letter={row.sub.name[0]?.toUpperCase() ?? "?"} color={color} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.leechName}>
          {row.sub.name}
        </Text>
        <Text style={[styles.leechSub, { color: row.days <= 1 ? C.pinkDeep : "#555555" }]}>
          {dueText(row.days)} · {money(row.sub.amount)}
          {row.sub.cycle === "trial"
            ? " · free trial trap"
            : row.sub.cycle === "monthly"
              ? "/mo"
              : "/yr"}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Yeet ${row.sub.name}`}
        onPress={onYeet}
        style={({ pressed }) => [styles.yeet, pressed && { backgroundColor: C.pink }]}
      >
        <Text style={styles.yeetText}>YEET</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.sky },
  content: { paddingHorizontal: 18, paddingBottom: 28 },
  titleRow: { marginBottom: 12 },
  title: { lineHeight: 29, transform: [{ rotate: "-2deg" }] },
  alertBadge: {
    position: "absolute",
    top: -6,
    right: 0,
    backgroundColor: C.yellow,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    transform: [{ rotate: "8deg" }],
    ...sticker(4),
  },
  alertText: { fontFamily: F.black, fontSize: 11, color: C.ink, textAlign: "center" },
  panicCard: {
    backgroundColor: C.pink,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    transform: [{ rotate: "-1deg" }],
    ...sticker(5),
  },
  panicTitle: { fontFamily: F.display, fontSize: 17, color: C.white },
  panicTeaser: { fontFamily: F.bold, fontSize: 13, color: C.white, marginTop: 4 },
  panicCta: {
    alignSelf: "flex-start",
    backgroundColor: C.white,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginTop: 10,
    ...sticker(3),
  },
  panicCtaText: { fontFamily: F.black, fontSize: 13, color: C.ink },
  statRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  stat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...sticker(4),
  },
  statLime: { backgroundColor: C.lime, transform: [{ rotate: "1deg" }] },
  statLabel: { fontFamily: F.black, fontSize: 10, letterSpacing: 0.6, color: C.ink },
  statValue: { fontFamily: F.display, fontSize: 24, color: C.ink },
  sectionTitle: { marginBottom: 9, transform: [{ rotate: "-1deg" }] },
  leech: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.white,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...sticker(4),
  },
  leechName: { fontFamily: F.bold, fontSize: 13, color: C.ink },
  leechSub: { fontFamily: F.bold, fontSize: 11 },
  yeet: {
    backgroundColor: C.ink,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  yeetText: { fontFamily: F.black, fontSize: 11, color: C.white },
  empty: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: C.ink,
    borderStyle: "dashed",
    padding: 20,
  },
  emptyText: { fontFamily: F.black, fontSize: 13, color: C.ink, textAlign: "center" },
});
