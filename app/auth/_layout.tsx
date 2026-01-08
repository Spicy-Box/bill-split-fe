import { Slot, Stack, usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { COLOR } from "@/utils/color";
import { IconButton } from "react-native-paper";
import Logo from "@/assets/images/Logo.svg";
import { useAuthStore } from "@/stores/useAuthStore";
import Toast from "react-native-toast-message";
import path from "path";

export default function AuthLayout() {
  const pathname = usePathname();
  const router = useRouter();

  console.log(pathname);

  return (
    <LinearGradient
      colors={[COLOR.secondary3, COLOR.primary1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 p-5 justify-center">
        <View className="flex-1 gap-5">
          <View className="flex-row justify-between">
            <View className="w-[50px] h-[50px] items-center justify-center">
              {pathname !== "/auth/login" && (
                <IconButton
                  mode="contained"
                  icon={"arrow-left"}
                  iconColor={COLOR.light1}
                  containerColor={COLOR.dark1}
                  size={24}
                  onPress={() => router.back()}
                />
              )}
            </View>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Logo width={50} height={50} />
            </TouchableOpacity>
            <View className="w-[50px] h-[50px]"></View>
          </View>
          <Animated.View
            style={{
              paddingVertical: 40,
              paddingHorizontal: 24,
              backgroundColor: COLOR.light1,
              flex: 1,
              borderRadius: 16,
            }}
            key={pathname}
            entering={FadeIn}
            exiting={FadeOut}
          >
            <Slot></Slot>
          </Animated.View>
        </View>
        <Toast />
      </SafeAreaView>
    </LinearGradient>
  );
}
