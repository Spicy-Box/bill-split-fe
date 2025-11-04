import EventIcon from "@/assets/images/event-icon.svg";

import { Image, Text, View } from "react-native";

export default function ListItem({
  name = "Oyasumi Punpun",
  date = "15 Oct, 2025",
  price = 455000,
  people = 6,
}: {
  name: string;
  date: string;
  price: number;
  people: number;
}) {
  return (
    <View className="flex-row justify-between bg-light1 p-3 rounded-xl items-center">
      {/* Col 1 */}
      <EventIcon width={52} height={52} />

      {/* Col 2 */}
      <View className="gap-1">
        <Text className="font-bold font-inter">{name}</Text>
        <Text className="text-primary2 font-bold font-inter">{date}</Text>
      </View>

      {/* Col 3 */}
      <View className="gap-1">
        <Text className="bg-primary3 text-light1 rounded-lg p-1 text-sm font-bold font-inter">
          VND {price.toLocaleString()}
        </Text>
        <Text className="text-primary2 font-semibold font-inter">
          {people} persons
        </Text>
      </View>
    </View>
  );
}
