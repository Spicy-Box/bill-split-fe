import { getData } from "@/utils/asyncStorage";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { Text, View } from "react-native";
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

  return (
    <SafeAreaView className="bg-white flex-1">
      <Text>Hello</Text>
      <Link href={"/onboarding"}>Test</Link>
    </SafeAreaView>
  );
}
