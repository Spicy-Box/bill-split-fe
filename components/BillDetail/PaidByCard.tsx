import { Image, Text, View } from "react-native";
import type { PaidByCardProps } from "./types";

export default function PaidByCard({ participant }: PaidByCardProps) {
  return (
    <View className="bg-primary1 rounded-2xl p-4 flex-row items-center gap-3">
      <View className="bg-dark1 rounded-lg px-3 py-1">
        <Text className="text-light1 text-sm font-semibold font-inter">
          Paid By
        </Text>
      </View>
      <Image
        source={{ uri: participant.avatar }}
        className="w-8 h-8 rounded-full"
      />
      <Text className="text-dark1 font-medium flex-1">
        {participant.name}
      </Text>
    </View>
  );
}
