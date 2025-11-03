import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="events" />
    </Stack>
  );
}
