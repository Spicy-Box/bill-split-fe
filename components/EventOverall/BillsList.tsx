import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import type { Bill, BillsListProps } from "./types";

// Bill Icon Component
const BillIcon = () => (
  <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
    <Circle cx={22} cy={22} r={22} fill="#FFE5F0" />
    <Circle cx={16} cy={14} r={3} fill="#FF6B9D" />
    <Circle cx={28} cy={14} r={3} fill="#6B9DFF" />
    <Circle cx={22} cy={22} r={3} fill="#FFB366" />
    <Circle cx={16} cy={30} r={3} fill="#9D6BFF" />
    <Circle cx={28} cy={30} r={3} fill="#66FFB3" />
  </Svg>
);

// Bill Item Component
const BillItem = ({ bill }: { bill: Bill }) => (
  <View className="bg-light1 rounded-xl p-3 flex-row items-center justify-between">
    <View className="flex-row items-center gap-2.5">
      <View className="w-11 h-11">
        <BillIcon />
      </View>
      <View className="gap-1">
        <Text className="text-dark1 font-medium text-base font-inter">{bill.name}</Text>
        <Text className="text-dark1 text-xs font-medium font-inter opacity-40">
          Paid by {bill.paidBy}
        </Text>
      </View>
    </View>
    <View className="bg-primary3 rounded-lg px-3 py-1">
      <Text className="text-light1 text-center text-sm font-semibold font-inter">
        VND {bill.amount.toLocaleString()}
      </Text>
    </View>
  </View>
);

export const BillsList = ({ bills }: BillsListProps) => {
  return (
    <View className="gap-2.5 pb-24">
      {bills.map((bill) => (
        <BillItem key={bill.id} bill={bill} />
      ))}
    </View>
  );
};
