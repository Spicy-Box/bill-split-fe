// import { Stack } from 'expo-router';
import { Slot, Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        gestureEnabled: true,
      }}
    />
    // <Slot></Slot>
    // <Stack>
    //   <Stack.Screen name="index" options={{ title: 'Home' }} />
    //   <Stack.Screen name="(example-code)/nav" options={{ title: 'Nav' }} />
    //   <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
    // </Stack>
  );
}
