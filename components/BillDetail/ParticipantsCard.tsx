import { Image, Text, View } from "react-native";
import type { ParticipantsCardProps } from "./types";

export default function ParticipantsCard({
  participants,
}: ParticipantsCardProps) {
  return (
    <View className="bg-primary1 rounded-3xl p-4 gap-3">
      <View className="bg-dark1 rounded-lg px-3 py-1 self-start">
        <Text className="text-light1 text-sm font-semibold font-inter">
          Participants (Split Equally)
        </Text>
      </View>
      <View className="gap-3">
        {participants.map((p) => (
          <View
            key={p.id}
            className="bg-light1 rounded-3xl px-4 py-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: p.avatar }}
                className="w-12 h-12 rounded-full"
              />
              <Text className="text-dark1 font-medium text-sm font-inter">
                {p.name}
              </Text>
            </View>
            <Text className="text-dark1 font-medium text-sm font-inter">
              ${p.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
