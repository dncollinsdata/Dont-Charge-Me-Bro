import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, sticker } from "../src/theme";
import { useStore } from "../src/store";
import { Btn, Heading } from "../src/ui";

export default function Onboarding() {
  const { dismissOnboarding } = useStore();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>100%{"\n"}FREE FR</Text>
      </View>

      <Heading size={44} style={styles.title}>
        DON'T{"\n"}CHARGE{"\n"}
        <Text style={{ color: C.pink }}>ME BRO!!</Text>
      </Heading>

      <View style={styles.pitch}>
        <Text style={styles.pitchText}>
          free trials end. bro forgets. bro pays $14.99 for an app he opened ONCE 💀
          {"\n\n"}
          not anymore bestie. we track. we yeet. we keep the bag. 💰
        </Text>
      </View>

      <Btn tone="pink" label="LET'S GOOO 🚀" onPress={dismissOnboarding} shadow={6} textStyle={{ fontSize: 20 }} />

      <Text style={styles.footnote}>no account 🙅 no card 🙅 nothing leaves the phone 🤐</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.sky,
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  badge: {
    position: "absolute",
    top: 70,
    right: 18,
    backgroundColor: C.yellow,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    transform: [{ rotate: "9deg" }],
    ...sticker(4),
  },
  badgeText: {
    fontFamily: F.black,
    fontSize: 12,
    color: C.ink,
    textAlign: "center",
  },
  title: {
    lineHeight: 45,
    marginBottom: 18,
    transform: [{ rotate: "-2deg" }],
  },
  pitch: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 26,
    transform: [{ rotate: "1deg" }],
    ...sticker(6),
  },
  pitchText: {
    fontFamily: F.bold,
    fontSize: 15,
    lineHeight: 22,
    color: C.ink,
  },
  footnote: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.steel,
    textAlign: "center",
    marginTop: 14,
  },
});
