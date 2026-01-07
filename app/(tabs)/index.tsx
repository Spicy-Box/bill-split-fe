import CreateNewEvent from "@/components/HomePage/CreateNewEvent";
import EventList from "@/components/HomePage/EventList";
import WelcomePanel from "@/components/HomePage/WelcomePanel";
import { clearAllData, getData, removeData } from "@/utils/asyncStorage";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import { COLOR } from "@/utils/color";
import { useAuthStore } from "@/stores/useAuthStore";
import Toast from "react-native-toast-message";

export default function HomeScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const checkFirstTimeOpen = useCallback(async () => {
    let onboarded = await getData("onboarded");
    if (onboarded !== "1") {
      router.replace("/onboarding");
    }
  }, [router]);

  useEffect(() => {
    checkFirstTimeOpen();
  }, [checkFirstTimeOpen]);

  const handleClearAppData = () => {
    Alert.alert(
      "Clear App Data",
      "Are you sure you want to clear all app data? This will log you out and reset the app.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              await logout();
              Toast.show({
                type: "success",
                text1: "App data cleared",
                text2: "You have been logged out",
              });
              router.replace("/onboarding");
            } catch {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to clear app data",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        <View className="p-5 gap-5">
          <WelcomePanel mode="home" />
          <CreateNewEvent />
        </View>

        <View className="flex-1 px-5">
          <EventList />
        </View>

        {/* <Link href={"/auth/login"}>
          <Text>Login</Text>
        </Link>
        <Link href={"/test"}>Test</Link> */}

        {/* <Button
          mode="outlined"
          buttonColor={COLOR.alert}
          textColor={COLOR.light1}
          onPress={handleClearAppData}
        >
          Clear App Data
        </Button> */}
      </View>
    </SafeAreaView>
  );
}
