import { Tabs } from "expo-router";
import { Text } from "react-native";
import { C, F } from "../../src/theme";

const icon = (emoji: string) => {
  const Icon = () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;
  Icon.displayName = `TabIcon(${emoji})`;
  return Icon;
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.pink,
        tabBarInactiveTintColor: C.faint,
        sceneStyle: { backgroundColor: C.sky },
        tabBarStyle: {
          backgroundColor: C.white,
          borderTopWidth: 4,
          borderTopColor: C.ink,
          paddingTop: 6,
          height: 88,
        },
        tabBarLabelStyle: {
          fontFamily: F.black,
          fontSize: 9,
          letterSpacing: 0.8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "HOME", tabBarIcon: icon("🏠") }} />
      <Tabs.Screen name="add" options={{ title: "ADD", tabBarIcon: icon("➕") }} />
      <Tabs.Screen name="shame" options={{ title: "SHAME", tabBarIcon: icon("💀") }} />
      <Tabs.Screen name="roasts" options={{ title: "ROASTS", tabBarIcon: icon("🔔") }} />
    </Tabs>
  );
}
