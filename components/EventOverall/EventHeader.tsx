import { Skeleton } from "@/components/common/Skeleton";
import { Text, View } from "react-native";
import type { EventHeaderProps } from "./types";

export const EventHeader = ({ eventNameAndCurrency, isLoading = false }: EventHeaderProps) => {
  return (
    <View className="bg-primary1 py-10">
      <View className="flex-col items-center gap-4">
        {isLoading ? (
          <Skeleton variant="circle" width={112} height={112} />
        ) : (
          <View className="bg-secondary3 rounded-full p-5 w-28 h-28 items-center justify-center">
            <Text className="text-4xl">{eventNameAndCurrency.emoji}</Text>
          </View>
        )}
        
        {isLoading ? (
          <View className="items-center gap-2">
            <Skeleton width={200} height={24} />
            <Skeleton width={120} height={16} />
          </View>
        ) : (
          <View className="bg-dark1 rounded-2xl px-4 py-1 max-w-[70%]">
            <Text className="text-light1 text-center font-semibold text-base font-inter">
              {eventNameAndCurrency.name}
            </Text>
            <Text className="text-light2 text-center text-xs italic font-inter">
              {eventNameAndCurrency.date}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
