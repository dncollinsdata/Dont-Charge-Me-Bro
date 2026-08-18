import { useFonts } from "expo-font";
import { Nunito_600SemiBold, Nunito_800ExtraBold, Nunito_900Black } from "@expo-google-fonts/nunito";
import { TitanOne_400Regular } from "@expo-google-fonts/titan-one";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";
import { PopIn } from "../src/anim";
import { useRoastResponses } from "../src/lib/roast-response";
import { C, F, sticker } from "../src/theme";
import { StoreProvider, useStore } from "../src/store";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    TitanOne_400Regular,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <OnboardingGate />
        <RoastResponses />
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.sky },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
            <Stack.Screen name="panic" options={{ presentation: "fullScreenModal" }} />
            <Stack.Screen name="receipt" />
          </Stack>
          <Toast />
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

/** Lets a tapped roast reach the store and the router. */
function RoastResponses() {
  const { rows, letItCharge, showToast } = useStore();
  useRoastResponses({ rows, letItCharge, showToast });
  return null;
}

/** Sends first-run users to the pitch, and never shows it twice. */
function OnboardingGate() {
  const { hydrated, prefs } = useStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const onOnboarding = segments[0] === "onboarding";
    if (!prefs.onboarded && !onOnboarding) router.replace("/onboarding");
    if (prefs.onboarded && onOnboarding) router.replace("/");
  }, [hydrated, prefs.onboarded, segments, router]);

  return null;
}

/**
 * Anything rendered as a sibling of expo-router's <Stack> is invisible on iOS:
 * react-native-screens hosts the navigator in a native container that covers it,
 * and no amount of zIndex helps. FullWindowOverlay is the escape hatch — it
 * renders into a UIWindow above the whole navigation hierarchy.
 */
function ToastHost({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "ios") return <>{children}</>;
  return (
    <FullWindowOverlay>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {children}
      </View>
    </FullWindowOverlay>
  );
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <ToastHost>
      <PopIn duration={300} style={styles.toastWrap}>
        <View pointerEvents="none" style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      </PopIn>
    </ToastHost>
  );
}

const styles = StyleSheet.create({
  toastWrap: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 110,
  },
  toast: {
    backgroundColor: C.ink,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...sticker(5),
    borderColor: C.white,
    shadowColor: "rgba(0,0,0,0.35)",
  },
  toastText: {
    fontFamily: F.black,
    fontSize: 14,
    color: C.white,
    textAlign: "center",
  },
});
