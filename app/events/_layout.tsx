import { Stack } from "expo-router";

export default function EventLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="add" options={{ headerShown: false }} />
    </Stack>
  );
}
