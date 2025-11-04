import { Stack } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  configureFonts,
  MD3LightTheme,
  PaperProvider,
} from "react-native-paper";

import { registerTranslation, en } from "react-native-paper-dates";
import { ActivityIndicator, Text, View } from "react-native";
import { COLOR } from "../utils/color";

registerTranslation("en", en);

export default function RootLayout() {
  const [loaded] = useFonts({
    inter: require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
  });

  const fontConfig = {
    fontFamily: "inter",
  };

  const theme = {
    ...MD3LightTheme,
    fonts: configureFonts({ config: fontConfig }),
  };

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color={COLOR.primary1} />
        <Text style={{ marginTop: 12, color: "#666" }}>Loading fonts…</Text>
      </View>
    );
  }

  return (
    <>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              gestureEnabled: false,
              fullScreenGestureEnabled: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="events" />
            <Stack.Screen name="auth" />
          </Stack>
        </SafeAreaProvider>
      </PaperProvider>
    </>
  );
}
