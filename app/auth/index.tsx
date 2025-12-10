import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLOR } from "@/utils/color";
import { getData } from "@/utils/asyncStorage";

export default function AuthIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = await getData("onboarded");
      if (onboarded !== "1") {
        router.replace("/onboarding");
      } else {
        router.replace("/auth/login");
      }
    };
    checkOnboarding();
  }, [router]);

  // Return empty view with same background as auth layout to prevent flash
  return (
    <LinearGradient
      colors={[COLOR.secondary3, COLOR.primary1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }} />
    </LinearGradient>
  );
}
