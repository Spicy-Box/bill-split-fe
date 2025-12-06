import { Text, View } from "react-native";
import type { EventHeaderProps } from "./types";

export const EventHeader = ({ eventNameAndCurrency }: EventHeaderProps) => {
  return (
    <View className="bg-primary1 rounded-b-3xl py-10">
      <View className="flex-col items-center gap-4">
        <View className="bg-secondary3 rounded-full p-5 w-28 h-28 items-center justify-center">
          <Text className="text-4xl">{eventNameAndCurrency.emoji}</Text>
        </View>
        <View className="bg-dark1 rounded-2xl px-4 py-1">
          <Text className="text-light1 text-center font-semibold text-base font-inter">
            {eventNameAndCurrency.name}
          </Text>
          <Text className="text-light2 text-center text-xs italic font-inter">
            {eventNameAndCurrency.date}
          </Text>
        </View>
      </View>
    </View>
  );
};
