import CreateNewEvent from "@/components/HomePage/CreateNewEvent";
import EventList from "@/components/HomePage/EventList";
import WelcomePanel from "@/components/HomePage/WelcomePanel";
import { getData, removeData } from "@/utils/asyncStorage";
import { RelativePathString, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { Text, View, TouchableOpacity, Alert, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  const checkFirstTimeOpen = useCallback(async () => {
    let onboarded = await getData("onboarded");
    if (onboarded !== "1") {
      router.replace("/onboarding");
    }
  }, []);

  useEffect(() => {
    checkFirstTimeOpen();
  }, []);

  const resetData = async () => {
    try {
      await removeData("onboarded");
      router.replace("/onboarding"); // show onboarding again
      console.log("✅ AsyncStorage cleared");
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset App Data",
      "Are you sure you want to clear all saved data? This will log you out and show onboarding again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => resetData(),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="p-5 gap-5">
        <WelcomePanel mode="home" />
        <CreateNewEvent />

        <EventList />

        <TouchableOpacity onPress={handleResetData}>
          <Text className="font-inter">Clear App Data</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/login" as RelativePathString)}>
          <Text className="font-inter">Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
