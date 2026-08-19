import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PopIn, Wobble } from "../src/anim";
import { chipColor } from "../src/lib/chips";
import { requestPermission } from "../src/lib/notify";
import { roastLine } from "../src/lib/roasts";
import { useStore } from "../src/store";
import { C, F, sticker } from "../src/theme";
import { Btn, Chip, Heading } from "../src/ui";

const SLIDES = 4;

export default function Onboarding() {
  const { dismissOnboarding } = useStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [asking, setAsking] = useState(false);
  const last = SLIDES - 1;

  function go(next: number) {
    scroller.current?.scrollTo({ x: next * width, animated: true });
    setPage(next);
  }

  function onSettled(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  }

  /**
   * iOS grants exactly one permission dialog per install. Firing it behind a
   * button bro chose to press is the only version of this that respects that —
   * and if he defers, the ROASTS tab's own ALLOW button is still live.
   */
  async function turnOnRoasts() {
    if (asking) return;
    setAsking(true);
    try {
      await requestPermission();
    } finally {
      dismissOnboarding();
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 18 }]}>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onSettled}
        style={{ flex: 1 }}
      >
        <Slide width={width}>
          <Wobble style={styles.badge} duration={2200}>
            <Text style={styles.badgeText}>$1.99{"\n"}ONCE</Text>
          </Wobble>
          <PopIn>
            <Image source={require("../assets/logo-badge.png")} style={styles.logo} />
          </PopIn>
          <Heading size={40} style={styles.title}>
            DON'T{"\n"}CHARGE{"\n"}
            <Text style={{ color: C.pink }}>ME BRO!!</Text>
          </Heading>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              free trials end. bro forgets. bro pays $14.99 for an app he opened ONCE 💀
              {"\n\n"}
              not anymore bestie. we track. we yeet. we keep the bag. 💰
              {"\n\n"}
              and us? $1.99. one time. forever. we're not the leech 💅
            </Text>
          </View>
        </Slide>

        <Slide width={width}>
          <Step n="1" label="ADD THE LEECH" />
          <Text style={styles.blurb}>
            hit ADD, drop the name, the damage, and the day it bites. trials, monthlies, those
            sneaky yearly ones. all of it.
          </Text>
          <View style={styles.leech}>
            <Chip letter="N" color={chipColor(0)} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.leechName}>Netflix</Text>
              <Text style={styles.leechMeta}>tomorrow 😬 · $12.99/mo</Text>
            </View>
            <View style={styles.yeetPill}>
              <Text style={styles.yeetText}>YEET</Text>
            </View>
          </View>
        </Slide>

        <Slide width={width}>
          <Step n="2" label="WE ROAST YOU" />
          <Text style={styles.blurb}>
            3 days out. 1 day out. the morning of. then an 8pm LAST CALL while the money is still
            yours. they land even if the app is closed.
          </Text>
          <View style={styles.notif}>
            <Chip letter="N" color={chipColor(0)} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.notifHead}>
                <View style={styles.notifSource}>
                  <Image source={require("../assets/logo-mark.png")} style={styles.notifIcon} />
                  <Text style={styles.notifApp}>DON'T CHARGE ME BRO</Text>
                </View>
                <Text style={styles.notifApp}>now</Text>
              </View>
              <Text style={styles.notifBody}>{roastLine("unhinged", "Netflix", 1, 12.99)}</Text>
            </View>
          </View>
        </Slide>

        <Slide width={width}>
          <Step n="3" label="YEET IT" />
          <Text style={styles.blurb}>
            tap the roast and we drop you straight on the panic screen. cancel it, claim the W, and
            the streak lives. let it charge and it goes in the hall of shame forever.
          </Text>
          <View style={styles.panic}>
            <Text style={styles.panicSiren}>🚨</Text>
            <Text style={styles.panicText}>NETFLIX{"\n"}CHARGES{"\n"}TOMORROW 😬</Text>
          </View>
        </Slide>
      </ScrollView>

      <View style={styles.below}>
        <View style={styles.dots}>
          {Array.from({ length: SLIDES }, (_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
          ))}
        </View>

        {page < last ? (
          <Btn
            tone="pink"
            label="NEXT →"
            shadow={6}
            textStyle={{ fontSize: 20 }}
            onPress={() => go(page + 1)}
          />
        ) : (
          <Btn
            tone="pink"
            label="TURN ON THE ROASTS 🔔"
            shadow={6}
            disabled={asking}
            textStyle={{ fontSize: 19 }}
            onPress={turnOnRoasts}
          />
        )}

        {page < last ? (
          <Text style={styles.footnote}>no account 🙅 no card 🙅 nothing leaves the phone 🤐</Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            // Padded to the 44pt minimum — the escape hatch has to be reachable.
            style={styles.laterHit}
            hitSlop={8}
            onPress={dismissOnboarding}
          >
            <Text style={styles.later}>nah, later</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Slide({ width, children }: { width: number; children: React.ReactNode }) {
  return <View style={[styles.slide, { width }]}>{children}</View>;
}

function Step({ n, label }: { n: string; label: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Heading size={30} style={styles.stepLabel}>
        {label}
      </Heading>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.sky },
  slide: { flex: 1, justifyContent: "center", paddingHorizontal: 26 },
  badge: {
    position: "absolute",
    top: 24,
    right: 18,
    backgroundColor: C.yellow,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    transform: [{ rotate: "9deg" }],
    ...sticker(4),
  },
  badgeText: { fontFamily: F.black, fontSize: 12, color: C.ink, textAlign: "center" },
  logo: { width: 88, height: 88, marginBottom: 14 },
  title: { lineHeight: 41, marginBottom: 16, transform: [{ rotate: "-2deg" }] },
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    transform: [{ rotate: "1deg" }],
    ...sticker(6),
  },
  cardText: { fontFamily: F.bold, fontSize: 15, lineHeight: 22, color: C.ink },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  stepNum: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: C.yellow,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-6deg" }],
    ...sticker(4),
  },
  stepNumText: { fontFamily: F.display, fontSize: 20, color: C.ink },
  stepLabel: { flexShrink: 1, transform: [{ rotate: "-1deg" }] },
  blurb: { fontFamily: F.bold, fontSize: 15, lineHeight: 22, color: C.steel, marginBottom: 20 },
  leech: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 13,
    transform: [{ rotate: "-1deg" }],
    ...sticker(5),
  },
  leechName: { fontFamily: F.black, fontSize: 16, color: C.ink },
  leechMeta: { fontFamily: F.bold, fontSize: 13, color: C.pink, marginTop: 2 },
  yeetPill: {
    backgroundColor: C.ink,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  yeetText: { fontFamily: F.black, fontSize: 12, color: C.white },
  notif: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 13,
    transform: [{ rotate: "1deg" }],
    ...sticker(5),
  },
  notifHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  notifSource: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  notifIcon: { width: 13, height: 13, borderRadius: 3.5 },
  notifApp: { fontFamily: F.black, fontSize: 10, letterSpacing: 0.6, color: C.muted },
  notifBody: { fontFamily: F.bold, fontSize: 13, lineHeight: 19, color: C.ink, marginTop: 3 },
  panic: {
    backgroundColor: C.pink,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
    transform: [{ rotate: "-2deg" }],
    ...sticker(6),
  },
  panicSiren: { fontSize: 30 },
  panicText: {
    fontFamily: F.display,
    fontSize: 26,
    lineHeight: 29,
    color: C.white,
    textAlign: "center",
    marginTop: 8,
    textShadowColor: C.ink,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  below: { paddingHorizontal: 26 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
  },
  dotOn: { backgroundColor: C.ink, width: 22 },
  footnote: {
    fontFamily: F.black,
    fontSize: 12,
    color: C.steel,
    textAlign: "center",
    marginTop: 20,
  },
  laterHit: { alignSelf: "center", paddingVertical: 13, paddingHorizontal: 18, marginTop: 4 },
  later: {
    fontFamily: F.black,
    fontSize: 13,
    color: C.steel,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
