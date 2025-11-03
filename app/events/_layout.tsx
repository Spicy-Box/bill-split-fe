import { Stack } from "expo-router";

export default function EventLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        headerShown: false,
      }}
    >
      <Stack.Screen name="add" options={{ headerShown: true, title: "Add" }} />
    </Stack>
  );
}
