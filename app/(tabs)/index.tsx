import CreateNewEvent from "@/components/HomePage/CreateNewEvent";
import EventList from "@/components/HomePage/EventList";
import WelcomePanel from "@/components/HomePage/WelcomePanel";
import { getData } from "@/utils/asyncStorage";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  const checkFirstTimeOpen = useCallback(async () => {
    let onboarded = await getData("onboarded");
    if (onboarded !== "1") {
      router.replace("/onboarding");
    }
  }, [router]);

  useEffect(() => {
    checkFirstTimeOpen();
  }, [checkFirstTimeOpen]);

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
      </View>
    </SafeAreaView>
  );
}
