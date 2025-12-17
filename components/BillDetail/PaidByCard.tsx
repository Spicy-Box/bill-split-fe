import { Image, Text, View } from "react-native";
import { Participant } from "../BillCreate";

export default function PaidByCard({ participant }: { participant?: Participant }) {
  if (!participant) return null;

  const hasUserId = !!participant.user_id;

  return (
    <View className="bg-primary1 rounded-2xl p-4 flex-row items-center gap-3">
      <View className="bg-dark1 rounded-lg px-3 py-1">
        <Text className="text-light1 text-sm font-semibold font-inter">Paid By</Text>
      </View>
      <Image
        source={
          hasUserId
            ? require("../../assets/images/avatar-1.png")
            : require("../../assets/images/avatar.png")
        }
        className="w-8 h-8 rounded-full"
      />
      <Text className="text-dark1 font-medium flex-1">{participant.name}</Text>
    </View>
  );
}
