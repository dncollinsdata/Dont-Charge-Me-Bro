import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { plusDays, todayISO, type Cycle } from "../../src/lib/trials";
import { useStore } from "../../src/store";
import { C, F, sticker } from "../../src/theme";
import { Btn, Field, FieldLabel, Heading, Segmented } from "../../src/ui";

const CYCLES: { value: Cycle; label: string }[] = [
  { value: "trial", label: "free trial" },
  { value: "monthly", label: "monthly" },
  { value: "yearly", label: "yearly" },
];

export default function AddScreen() {
  const { addSub, showToast } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<Cycle>("trial");
  const [date, setDate] = useState(plusDays(7));
  const [picking, setPicking] = useState(false);

  const valid = name.trim().length > 0 && Boolean(date);

  function submit() {
    if (!valid) return;
    addSub({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      amount: Number(amount) || 0,
      cycle,
      date,
    });
    setName("");
    setAmount("");
    setCycle("trial");
    setDate(plusDays(7));
    showToast("TRACKED ✅ bro is slightly less doomed");
    router.push("/");
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Heading style={styles.title}>ADD A LEECH ➕</Heading>
      <Text style={styles.sub}>5 seconds. that's it. future you says ty 🙏</Text>

      <View style={{ gap: 14 }}>
        <View>
          <FieldLabel>WHO'S COMING FOR THE BAG 💰</FieldLabel>
          <Field
            value={name}
            onChangeText={setName}
            placeholder="streaming service, gym, AI girlfriend…"
            returnKeyType="next"
            // Brand names are exactly what autocorrect ruins: "Netflix" becomes
            // "Liz", "RizzGPT" becomes anything at all.
            autoCorrect={false}
            autoCapitalize="words"
            spellCheck={false}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel>HOW MUCH 💸</FieldLabel>
            <Field
              value={amount}
              onChangeText={setAmount}
              placeholder="9.99"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>{cycle === "trial" ? "TRIAL ENDS 📅" : "NEXT CHARGE 📅"}</FieldLabel>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pick the charge date"
              onPress={() => setPicking((p) => !p)}
              style={[styles.dateField, sticker(3)]}
            >
              <Text style={styles.dateText}>{prettyDate(date)}</Text>
            </Pressable>
          </View>
        </View>

        {picking && (
          <View style={[styles.pickerWrap, sticker(3)]}>
            <DateTimePicker
              value={new Date(date + "T00:00:00")}
              mode="date"
              display="inline"
              minimumDate={new Date(todayISO() + "T00:00:00")}
              accentColor={C.pink}
              onValueChange={(_, picked) => setDate(toISO(picked))}
            />
            <Btn
              tone="ink"
              label="DONE"
              shadow={3}
              textStyle={{ fontSize: 14 }}
              style={{ paddingVertical: 10 }}
              onPress={() => setPicking(false)}
            />
          </View>
        )}

        <View>
          <FieldLabel>WHAT KIND OF TRAP 🪤</FieldLabel>
          <Segmented value={cycle} options={CYCLES} onPick={setCycle} />
        </View>

        {cycle === "trial" && (
          <View style={styles.quickRow}>
            {[3, 7, 14, 30].map((d) => (
              <Btn
                key={d}
                tone="yellow"
                label={`${d}-day`}
                shadow={3}
                onPress={() => setDate(plusDays(d))}
                style={styles.quickChip}
                textStyle={styles.quickChipText}
              />
            ))}
          </View>
        )}

        <Btn
          tone="pink"
          label="TRACK IT BESTIE ✅"
          disabled={!valid}
          onPress={submit}
          textStyle={{ fontSize: 17 }}
        />
      </View>
    </ScrollView>
  );
}

function toISO(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function prettyDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.sky },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { marginBottom: 4, transform: [{ rotate: "-1deg" }] },
  sub: { fontFamily: F.bold, fontSize: 13, color: C.steel, marginBottom: 16 },
  dateField: {
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: { fontFamily: F.bold, fontSize: 14, color: C.ink },
  pickerWrap: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 8,
    gap: 8,
  },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickChip: { paddingVertical: 6, paddingHorizontal: 13 },
  quickChipText: { fontFamily: F.black, fontSize: 12 },
});
