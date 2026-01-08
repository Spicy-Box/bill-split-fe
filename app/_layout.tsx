import { navigationIntegration } from "@/sentry";
import { useAuthStore } from "@/stores/useAuthStore";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Stack, useNavigationContainerRef } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureFonts, MD3LightTheme, PaperProvider } from "react-native-paper";
import { en, registerTranslation } from "react-native-paper-dates";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";
import { COLOR } from "../utils/color";

registerTranslation("en", en);

type WithDefaultProps<T> = T & { defaultProps?: { allowFontScaling?: boolean } };

const TextWithDefaults = Text as WithDefaultProps<typeof Text>;
TextWithDefaults.defaultProps = TextWithDefaults.defaultProps || {};
TextWithDefaults.defaultProps.allowFontScaling = false;

const TextInputWithDefaults = TextInput as WithDefaultProps<typeof TextInput>;
TextInputWithDefaults.defaultProps = TextInputWithDefaults.defaultProps || {};
TextInputWithDefaults.defaultProps.allowFontScaling = false;

export default Sentry.wrap(function RootLayout() {
  const ref = useNavigationContainerRef();

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

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    Sentry.setTag("group", "divvy");
  }, []);

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: `${user.first_name} ${user.last_name}`.trim() || user.email,
      });
    } else {
      // Clear user khi logout
      Sentry.setUser(null);
    }
  }, [user]);

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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
              }}
            >
              <Stack.Protected guard={user ? true : false}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="events" />
                <Stack.Screen name="bills/add" />
                <Stack.Screen name="bills/details" />
                <Stack.Screen name="bills/loading" />
                <Stack.Screen name="test" />
                <Stack.Screen
                  name="users/profile"
                  options={{
                    animation: "fade_from_bottom",
                  }}
                />
              </Stack.Protected>
              <Stack.Screen name="auth" />
              <Stack.Screen name="onboarding" />
            </Stack>
            <Toast
            // config={{
            //   success: (props) => (
            //     <View className="bg-light1 px-8 py-3 rounded-lg mx-4 shadow-lg border-l-4 border-[#4CAF50]">
            //       <Text className="text-dark1 font-bold font-inter" style={{ fontSize: 15.6 }}>
            //         {props.text1}
            //       </Text>
            //       {props.text2 && (
            //         <Text className="text-dark2 font-inter " style={{ fontSize: 13.4 }}>
            //           {props.text2}
            //         </Text>
            //       )}
            //     </View>
            //   ),
            //   error: (props) => (
            //     <View className="bg-light1 px-8 py-3 rounded-lg mx-4 shadow-lg border-l-4 border-[#F44336]">
            //       <Text className="text-dark1 font-bold font-inter" style={{ fontSize: 15.6 }}>
            //         {props.text1}
            //       </Text>
            //       {props.text2 && (
            //         <Text className="text-dark2 font-inter " style={{ fontSize: 13.4 }}>
            //           {props.text2}
            //         </Text>
            //       )}
            //     </View>
            //   ),
            //   info: (props) => (
            //     <View className="bg-light1 px-8 py-3 rounded-lg mx-4 shadow-lg border-l-4 border-[#2196F3]">
            //       <Text className="text-dark1 font-bold font-inter" style={{ fontSize: 15.6 }}>
            //         {props.text1}
            //       </Text>
            //       {props.text2 && (
            //         <Text className="text-dark2 font-inter " style={{ fontSize: 13.4 }}>
            //           {props.text2}
            //         </Text>
            //       )}
            //     </View>
            //   ),
            // }}
            />
          </SafeAreaProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </>
  );
});
