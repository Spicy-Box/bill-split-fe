import { COLOR } from "@/utils/color";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import type { BillDetailHeaderProps } from "./types";

export default function BillDetailHeader({ title, eventId }: BillDetailHeaderProps) {
  const router = useRouter();

  return (
    <View
      className="bg-light3 px-4 py-4 flex-row justify-between items-center"
      style={{ height: "10%" }}
    >
      <TouchableOpacity
        onPress={() => router.navigate(`/events/${eventId}`)}
        className="w-8 h-8 bg-dark1 rounded-full items-center justify-center"
      >
        <ArrowLeft size={20} color={COLOR.light1} />
      </TouchableOpacity>
      <Text className="text-dark1 text-center font-medium text-base font-inter flex-1">
        {title}
      </Text>
      <View className="w-8 h-8" />
    </View>
  );
}
