import { COLOR } from "@/utils/color";
import { User } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import type { BillItemsCardProps } from "./types";

export default function BillItemsCard({ items, subTotal, tax, totalAmount }: BillItemsCardProps) {
  return (
    <View className="bg-light1 rounded-3xl p-4 gap-4">
      {items &&
        items.map((item, idx) => (
          <View key={item.id}>
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row gap-2 items-baseline mb-2">
                  <Text className="text-dark1 font-bold text-sm font-inter">{item.name}</Text>
                  <Text className="text-primary2 text-xs font-bold font-inter">
                    VND {(item.unitPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity className="flex-row items-center gap-1 bg-primary1 rounded-full px-2 py-0.5">
                    <User size={14} color={COLOR.dark1} />
                    <Text className="text-dark1 text-xs font-semibold font-inter">
                      {item.splitType === "everyone" || !item.splitType
                        ? "Everyone"
                        : `x${item.splitBetween?.length ?? 0} people`}
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-primary2 text-sm font-medium font-inter">
                    x{item.quantity}
                  </Text>
                </View>
              </View>
              <Text className="text-dark1 font-semibold ml-2">
                VND {(item.totalPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            {idx < items.length - 1 && <View className="border-b border-primary2 mt-3" />}
          </View>
        ))}

      {/* Summary */}
      <View className="border-t border-dark1 pt-3 gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-dark1 font-bold text-sm font-inter">Sub Total</Text>
          <Text className="text-dark1 font-semibold text-md">VND {(subTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-dark1 font-bold text-sm font-inter">Tax</Text>
          <Text className="text-dark1 font-semibold text-md">{(tax ?? 0).toFixed(0)}%</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-dark1 font-bold text-sm font-inter">Total</Text>
          <Text className="text-dark1 font-bold text-md">VND {(totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
      </View>
    </View>
  );
}
