import { COLOR } from "@/utils/color";
import { ArrowRight } from "lucide-react-native";
import { Image, Text, View } from "react-native";
import type { DebtsListCardProps } from "./types";

export default function DebtsListCard({ debts }: DebtsListCardProps) {
  console.log(debts);
  return (
    <View className="bg-light1 rounded-3xl p-4 gap-4">
      {debts.map((debt, idx) => (
        <View key={idx}>
          <View>
            <View className="flex-row items-center justify-center gap-2 mb-3">
              <Text className="text-dark1 text-md font-semibold">Owes</Text>
              <View className="bg-dark1 rounded-lg px-2 py-0.5">
                <Text className="text-primary1 text-md font-semibold">
                  ${debt.amountOwed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="flex-1 bg-primary1 rounded-2xl px-3 py-2 flex-row items-center gap-2">
                <Image
                  source={
                    debt.debtor.user_id
                      ? require("../../assets/images/avatar-1.png")
                      : require("../../assets/images/avatar.png")
                  }
                  className="w-7 h-7 rounded-full"
                />
                <Text className="text-dark1 font-medium text-xs font-inter" numberOfLines={1}>
                  {debt.debtor.name}
                </Text>
              </View>
              <ArrowRight size={24} color={COLOR.dark1} />
              <View className="flex-1 bg-primary1 rounded-2xl px-3 py-2 flex-row items-center gap-2">
                <Image
                  source={
                    debt.creditor.user_id
                      ? require("../../assets/images/avatar-1.png")
                      : require("../../assets/images/avatar.png")
                  }
                  className="w-7 h-7 rounded-full"
                />
                <Text className="text-dark1 font-medium text-xs font-inter" numberOfLines={1}>
                  {debt.creditor.name}
                </Text>
              </View>
            </View>
          </View>
          {idx < debts.length - 1 && <View className="border-b border-primary2 mt-3" />}
        </View>
      ))}
    </View>
  );
}
