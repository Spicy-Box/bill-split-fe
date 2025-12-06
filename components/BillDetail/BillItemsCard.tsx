import { COLOR } from "@/utils/color";
import { User } from "lucide-react-native";
import { Text, View } from "react-native";
import type { BillItemsCardProps } from "./types";

export default function BillItemsCard({ items, total }: BillItemsCardProps) {
  return (
    <View className="bg-light1 rounded-3xl p-4 gap-4">
      {items.map((item, idx) => (
        <View key={item.id}>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row gap-2 items-baseline mb-2">
                <Text className="text-dark1 font-semibold text-sm font-inter">
                  {item.name}
                </Text>
                <Text className="text-primary2 text-xs font-semibold font-inter">
                  ${item.price.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center gap-1 bg-primary1 rounded-full px-2 py-0.5">
                  <User size={14} color={COLOR.dark1} />
                  <Text className="text-dark1 text-xs font-semibold font-inter">
                    {item.person}
                  </Text>
                </View>
                <Text className="text-primary2 text-sm font-medium font-inter">
                  x{item.quantity}
                </Text>
              </View>
            </View>
            <Text className="text-dark1 font-semibold ml-2">
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
          {idx < items.length - 1 && (
            <View className="border-b border-primary2 mt-3" />
          )}
        </View>
      ))}

      {/* Summary */}
      <View className="border-t border-dark1 pt-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-dark1 font-semibold text-sm font-inter">
            Total
          </Text>
          <Text className="text-dark1 font-semibold text-md">
            ${total.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
