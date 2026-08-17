import { useFonts } from "expo-font";
import { Nunito_600SemiBold, Nunito_800ExtraBold, Nunito_900Black } from "@expo-google-fonts/nunito";
import { TitanOne_400Regular } from "@expo-google-fonts/titan-one";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
      </StoreProvider>
    </SafeAreaProvider>
  );
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

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{toast}</Text>
      </View>
    </View>
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
