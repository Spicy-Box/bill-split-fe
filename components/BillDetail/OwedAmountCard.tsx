import { BalancesRepsonse } from "@/interfaces/api/bill.api";
import { useAuthStore } from "@/stores/useAuthStore";
import { Image, Text, View } from "react-native";
import { formatCurrency } from "@/utils/formatCurrency";

export default function OwedAmountCard({ balances }: { balances: BalancesRepsonse[] }) {
  const user = useAuthStore((state) => state.user);

  const amount = balances.reduce((acc, cur) => {
    if (cur.debtor.user_id) {
      return acc - Number(cur.amountOwed);
    } else if (cur.creditor.user_id) {
      return acc + Number(cur.amountOwed);
    }
    return acc;
  }, 0);

  return (
    <View className="bg-primary1 rounded-2xl p-4 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Image
          source={require("../../assets/images/avatar-1.png")}
          className="w-8 h-8 rounded-full"
        />
        <Text className="text-dark1 font-medium text-base">
          {user?.first_name + " " + user?.last_name}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className="text-dark1 text-sm font-bold font-inter">
          {amount < 0 ? "" : "are"} owed
        </Text>
        <View className={`${amount < 0 ? "bg-alert" : "bg-primary4"} rounded-lg px-2 py-0.5`}>
          <Text className="text-light1 text-sm font-semibold font-inter">
            VND {formatCurrency(amount < 0 ? (amount * -1) : amount)}
          </Text>
        </View>
      </View>
    </View>
  );
}
