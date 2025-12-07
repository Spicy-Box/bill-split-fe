import { Text, View } from "react-native";
import type { BillTotalsProps } from "./types";

export default function BillTotals({ subtotal, tax_rate, total }: BillTotalsProps) {
  return (
    <View className="border-t border-dark1 pt-4 gap-2 mt-4">
      <View className="flex-row justify-between">
        <Text className="text-dark1 font-medium font-inter">Subtotal</Text>
        <Text className="text-dark1 font-medium">
          ${subtotal.toFixed(2)}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-dark1 font-medium font-inter">Tax</Text>
        <Text className="text-dark1 font-medium">
          {(tax_rate * 100).toFixed(0)}%
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-dark1 font-semibold font-inter">Total</Text>
        <Text className="text-dark1 font-semibold">
          ${total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
