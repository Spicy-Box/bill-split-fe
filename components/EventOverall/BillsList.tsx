import { BillOverallItemRequest } from "@/interfaces/api/bill.api";
import { formatCurrency } from "@/utils/formatCurrency";
import { Router, useRouter } from "expo-router";
import { Edit3, Trash2 } from "lucide-react-native";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Svg, { Circle } from "react-native-svg";
import type { BillsListProps } from "./types";

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
const BillItem = ({
  bill,
  router,
  onDelete,
  onEdit,
}: {
  bill: BillOverallItemRequest;
  router: Router;
  onDelete: (billId: string) => void;
  onEdit: (billId: string, currentTitle: string) => void;
}) => {
  const renderLeftActions = () => (
    <TouchableOpacity
      className="bg-red-500 rounded-xl justify-center items-center px-5 mr-2"
      onPress={() => {
        Alert.alert(
          "Delete Bill",
          "Are you sure you want to delete this bill?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => onDelete(bill.id),
            },
          ],
          { cancelable: true }
        );
      }}
    >
      <Trash2 size={24} color="white" />
    </TouchableOpacity>
  );

  const renderRightActions = () => (
    <TouchableOpacity
      className="bg-blue-500 rounded-xl justify-center items-center px-5 ml-2"
      onPress={() => onEdit(bill.id, bill.title)}
    >
      <Edit3 size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
    >
      <TouchableOpacity
        className="bg-light1 rounded-xl p-3 flex-row items-center justify-between"
        onPress={() => router.navigate(`/bills/${bill.id}`)}
      >
        <View className="flex-row items-center gap-2.5 flex-1">
          <View className="w-11 h-11 items-center justify-center">
            <BillIcon />
          </View>
          <View className="gap-1 flex-1">
            <Text className="text-dark1 font-medium text-base font-inter">{bill.title}</Text>
            <Text className="text-dark1 text-xs font-medium font-inter opacity-40">
              Paid by {bill.paidBy.name}
            </Text>
          </View>
        </View>
        <View className="bg-primary3 rounded-lg px-3 py-1.5 items-center justify-center ml-2">
          <Text className="text-light1 text-sm font-semibold font-inter">
            VND {formatCurrency(bill.totalAmount)}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export const BillsList = ({ bills, onDeleteBill, onEditBill }: BillsListProps) => {
  const router = useRouter();

  return (
    <View className="gap-2.5 pb-24">
      {bills.map((bill) => (
        <BillItem key={bill.id} bill={bill} router={router} onDelete={onDeleteBill} onEdit={onEditBill} />
      ))}
    </View>
  );
};
