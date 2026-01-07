import { Link } from "expo-router";
import { Image, Text, View } from "react-native";
import { useAuthStore } from "@/stores/useAuthStore";

interface WelcomePanelProps {
  mode?: string;
}

export default function WelcomePanel({ mode }: WelcomePanelProps) {
  const { user } = useAuthStore();
  const userName = user ? `${user.first_name} ${user.last_name}`.trim() : "Guest";

  return (
    <View className="flex-row justify-between items-center">
      {/* Left */}
      <View>
        <Text className="mb-[10px] font-inter">Hello, {userName}</Text>
        {mode === "home" ? (
          <Text className="font-bold font-inter">Let&apos;s Divvy The Bill</Text>
        ) : (
          <></>
        )}
      </View>
      {/* Right */}
      <View>
        <View
          className={`${mode === "home" ? "w-[60px]" : "w-[40px]"} aspect-square rounded-full overflow-hidden border`}
        >
          <Link href={"/users/profile"}>
            <Image className="w-full h-full" source={require("../../assets/images/avatar.png")} />
          </Link>
        </View>
      </View>
    </View>
  );
}
