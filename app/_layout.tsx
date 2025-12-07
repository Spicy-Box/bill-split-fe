import { Stack } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { configureFonts, MD3LightTheme, PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";
import { registerTranslation, en } from "react-native-paper-dates";
import { ActivityIndicator, Text, View } from "react-native";
import { COLOR } from "../utils/color";
import { useAuthStore } from "@/stores/useAuthStore";

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

  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!loaded || !hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-primary1">
        <ActivityIndicator size="large" color={COLOR.dark1} />
        <Text className="mt-3 text-dark1">Loading</Text>
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
            <Stack.Protected guard={user ? true : false}>
              <Stack.Screen name="events" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="bills" />
              <Stack.Screen
                name="users/profile"
                options={{
                  animation: "fade_from_bottom",
                }}
              />
            </Stack.Protected>

            <Stack.Screen name="auth" />
          </Stack>
          <Toast />
        </SafeAreaProvider>
      </PaperProvider>
    </>
  );
}
