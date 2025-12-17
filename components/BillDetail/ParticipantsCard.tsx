import { Image, Text, View } from "react-native";
import { PerUserShare } from "@/interfaces/api/bill.api";

export default function ParticipantsCard({ participants }: { participants: PerUserShare[] }) {
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
            key={p.userName?.name}
            className="bg-light1 rounded-3xl px-4 py-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <Image
                source={
                  p.userName?.user_id
                    ? require("../../assets/images/avatar-1.png")
                    : require("../../assets/images/avatar.png")
                }
                className="w-12 h-12 rounded-full"
              />
              <Text className="text-dark1 font-medium text-sm font-inter">{p.userName?.name}</Text>
            </View>
            <Text className="text-dark1 font-medium text-sm font-inter">
              ${p.share?.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
