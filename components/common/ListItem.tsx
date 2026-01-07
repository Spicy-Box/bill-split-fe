import EventIcon from "@/assets/images/event-icon.svg";
import { formatCurrency } from "@/utils/formatCurrency";
import { RelativePathString, useRouter } from "expo-router";

import { Text, TouchableOpacity, View } from "react-native";

export default function ListItem({
  id = "1",
  name = "Oyasumi Punpun",
  date = "15 Oct, 2025",
  price = 455000,
  people = 6,
  onPress,
}: {
  id: string;
  name: string;
  date: string;
  price: number;
  people: number;
  onPress?: () => void;
}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.push(`/events/${id}` as RelativePathString))}
      className="flex-row justify-between bg-light1 p-3 rounded-xl items-center"
    >
      {/* Col 1 & Col 2 */}
      <View className="flex-row gap-3 items-center">
        {/* Col 1 */}
        <EventIcon width={52} height={52} />

        {/* Col 2 */}
        <View className="gap-1">
          <Text className="font-bold text-base font-inter">{name}</Text>
          <Text className="text-primary2 font-semibold font-inter">{date}</Text>
        </View>
      </View>

      {/* Col 3 */}
      <View className="gap-1 items-end">
        <Text
          className="bg-primary3 text-light1 rounded-lg px-3 py-1 text-sm font-bold font-inter"
          style={{ textAlign: "center" }}
        >
          VND {formatCurrency(price)}
        </Text>
        <Text className="text-primary2 font-semibold font-inter">{people} persons</Text>
      </View>
    </TouchableOpacity>
  );
}
