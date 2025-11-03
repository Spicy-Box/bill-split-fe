import { Image, Text, View } from "react-native";

export default function WelcomePanel() {
  return (
    <View className="flex-row justify-between items-center">
      {/* Left */}
      <View>
        <Text className="mb-[10px]">Hello, Mahito</Text>
        <Text className="font-bold">Let&apos;s Divvy The Bill</Text>
      </View>
      {/* Right */}
      <View>
        <View className="w-[60px] aspect-square rounded-full overflow-hidden border">
          <Image
            className="w-full h-full"
            source={require("../../assets/images/avatar.png")}
          />
        </View>
      </View>
    </View>
  );
}
