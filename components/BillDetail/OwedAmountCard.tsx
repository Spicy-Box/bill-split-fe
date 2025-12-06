import { Image, Text, View } from "react-native";
import type { OwedAmountCardProps } from "./types";

export default function OwedAmountCard({
  participant,
  amount,
}: OwedAmountCardProps) {
  return (
    <View className="bg-primary1 rounded-2xl p-4 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Image
          source={{ uri: participant.avatar }}
          className="w-8 h-8 rounded-full"
        />
        <Text className="text-dark1 font-medium text-base">
          {participant.name}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className="text-dark1 text-sm font-bold font-inter">
          are owed
        </Text>
        <View className="bg-primary4 rounded-lg px-2 py-0.5">
          <Text className="text-light1 text-sm font-semibold font-inter">
            ${amount.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
