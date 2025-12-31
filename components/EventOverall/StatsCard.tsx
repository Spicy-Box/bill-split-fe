import { Text, View } from "react-native";
import type { StatsCardProps } from "./types";

export const StatsCard = ({ stats }: StatsCardProps) => {
  return (
    <View className="bg-light1 rounded-2xl p-4 mb-5">
      <View className="flex-row gap-2.5">
        <View className="flex-1 bg-secondary1 rounded-2xl py-4 items-center gap-1">
          <Text className="text-dark1 text-center text-sm font-medium font-inter">
            My Expenses
          </Text>
          <Text className="text-dark2 text-center text-sm font-semibold font-inter">
            VND {stats.myExpenses.toLocaleString()}
          </Text>
        </View>
        <View className="flex-1 bg-secondary2 rounded-2xl py-4 items-center gap-1">
          <Text className="text-dark1 text-center text-sm font-medium font-inter">
            Total Expenses
          </Text>
          <Text className="text-dark2 text-center text-sm font-semibold font-inter">
            VND {stats.totalExpenses.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};
