import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { chipColor } from "../../src/lib/chips";
import { getPermission, requestPermission, scheduledCount, syncRoasts } from "../../src/lib/notify";
import { roastLine, ROAST_LEVELS } from "../../src/lib/roasts";
import { useStore } from "../../src/store";
import { C, F, sticker } from "../../src/theme";
import { Btn, Chip, FieldLabel, Heading, Segmented } from "../../src/ui";

export default function RoastsScreen() {
  const { rows, prefs, setRoast, showToast } = useStore();
  const insets = useSafeAreaInsets();
  const [permission, setPermission] = useState<string | null>(null);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    getPermission().then(setPermission);
  }, []);

  useEffect(() => {
    if (permission === "granted") scheduledCount().then(setQueued);
  }, [permission, rows, prefs.roast]);

  const preview = rows.slice(0, 4);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <Heading style={styles.title}>THE ROASTS 🔔</Heading>
      <Text style={styles.sub}>
        delivered at 9am, 3 days out, 1 day out, and the morning of. bro's most vulnerable hour.
      </Text>

      {permission !== "granted" && (
        <View style={styles.permCard}>
          <Text style={styles.permText}>
            {permission === "denied"
              ? "notifications are blocked 🙉 turn them back on in Settings to get roasted."
              : "let us into your notifications so the roasts actually land 📲"}
          </Text>
          {permission !== "denied" && (
            <Btn
              tone="pink"
              label="ALLOW"
              shadow={3}
              style={{ paddingVertical: 9, paddingHorizontal: 16 }}
              textStyle={{ fontFamily: F.black, fontSize: 12 }}
              onPress={async () => {
                const status = await requestPermission();
                setPermission(status);
                if (status === "granted") {
                  const n = await syncRoasts(rows, prefs.roast);
                  setQueued(n);
                  showToast("roasts armed 🔥");
                }
              }}
            />
          )}
        </View>
      )}

      {permission === "granted" && (
        <View style={styles.armed}>
          <Text style={styles.armedText}>
            {queued > 0
              ? `${queued} roast${queued === 1 ? "" : "s"} queued up 🔥 they fire even if the app is closed.`
              : "armed and waiting. add a leech and we'll schedule the roasts. 🔥"}
          </Text>
        </View>
      )}

      <FieldLabel>ROAST LEVEL 🌶️</FieldLabel>
      <View style={{ marginBottom: 16 }}>
        <Segmented value={prefs.roast} options={ROAST_LEVELS} onPick={setRoast} />
      </View>

      <View style={{ gap: 10 }}>
        {preview.map((row, i) => (
          <View key={row.sub.id} style={styles.notif}>
            <Chip letter={row.sub.name[0]?.toUpperCase() ?? "?"} color={chipColor(i)} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.notifHead}>
                <Text style={styles.notifApp}>DON'T CHARGE ME BRO</Text>
                <Text style={styles.notifApp}>now</Text>
              </View>
              <Text style={styles.notifBody}>
                {roastLine(prefs.roast, row.sub.name, row.days, row.sub.amount)}
              </Text>
            </View>
          </View>
        ))}

        {preview.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>nothing to roast yet. add a leech and we'll cook. 🔥</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.sky },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  title: { marginBottom: 4, transform: [{ rotate: "-1deg" }] },
  sub: { fontFamily: F.bold, fontSize: 13, color: C.steel, marginBottom: 14 },
  permCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    ...sticker(4),
  },
  permText: { flex: 1, fontFamily: F.bold, fontSize: 13, color: C.ink },
  armed: {
    backgroundColor: C.lime,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    ...sticker(4),
  },
  armedText: { fontFamily: F.bold, fontSize: 13, color: C.ink },
  notif: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 13,
    ...sticker(4),
  },
  notifHead: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  notifApp: { fontFamily: F.black, fontSize: 10, letterSpacing: 0.6, color: C.muted },
  notifBody: { fontFamily: F.bold, fontSize: 13, lineHeight: 19, color: C.ink, marginTop: 3 },
  empty: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: C.ink,
    borderStyle: "dashed",
    padding: 20,
  },
  emptyText: { fontFamily: F.black, fontSize: 13, color: C.ink, textAlign: "center" },
});
