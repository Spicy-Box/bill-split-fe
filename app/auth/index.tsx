import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLOR } from "@/utils/color";

export default function AuthIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login");
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
