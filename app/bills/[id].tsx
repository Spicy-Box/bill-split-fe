import {
  BillDetailHeader,
  BillItemsCard,
  DebtsListCard,
  ExportButton,
  OwedAmountCard,
  PaidByCard,
  ParticipantsCard,
  TabBar,
  type BillItem,
  type DebtItem,
  type Participant,
} from "@/components/BillDetail";
import { BalancesRepsonse, BillByItemResponse } from "@/interfaces/api/bill.api";
import api from "@/utils/api";
import { COLOR } from "@/utils/color";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data
const BILL_ITEMS: BillItem[] = [
  {
    id: "1",
    name: "Egg Benedict & Bacon",
    price: 9.5,
    person: "Everyone",
    quantity: 1,
  },
  {
    id: "2",
    name: "Egg Benedict & Bacon",
    price: 9.5,
    person: "Everyone",
    quantity: 1,
  },
];

const PARTICIPANTS: Participant[] = [
  {
    id: "1",
    name: "Tuấn Anh (Me)",
    avatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/5ea48db9c69592465b9e6b854671c482f2c50037?width=64",
    amount: 6.65,
  },
  {
    id: "2",
    name: "Khánh Lê",
    avatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/b538bea737d4a5dab504335cf82a13327f8e4852?width=100",
    amount: 6.65,
  },
  {
    id: "3",
    name: "Tú Dương",
    avatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/b538bea737d4a5dab504335cf82a13327f8e4852?width=100",
    amount: 6.65,
  },
];

const OWED_DETAILS: DebtItem[] = [
  {
    from: "Khánh Lê",
    to: "Tuấn Anh",
    amount: 6.65,
    fromAvatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/0d3b44906653167a15eca94bd795c503e8843707?width=56",
    toAvatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/0d3b44906653167a15eca94bd795c503e8843707?width=56",
  },
  {
    from: "Tú Dương",
    to: "Tuấn Anh",
    amount: 6.65,
    fromAvatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/0d3b44906653167a15eca94bd795c503e8843707?width=56",
    toAvatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/0d3b44906653167a15eca94bd795c503e8843707?width=56",
  },
];

export default function BillDetailPage() {
  const { id } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<"overall" | "balances">("overall");
  const [billDetail, setBillDetail] = useState<BillByItemResponse | null>(null);
  const [balance, setBalance] = useState<BalancesRepsonse[]>([]);

  const fetchBillDetail = useCallback(async () => {
    const response = await api.get(`/bills/${id}`);
    const data: BillByItemResponse = response.data.data;
    setBillDetail(data);
    console.log(data);
  }, [id]);

  const fetchBillBalances = useCallback(async () => {
    const response = await api.get(`/bills/${id}/balances`);
    const data = response.data.data;
    console.log(data);
    setBalance(data.balances);
  }, [id]);

  useEffect(() => {
    fetchBillDetail();
    fetchBillBalances();
  }, [fetchBillDetail, fetchBillBalances]);

  console.log({ billDetail });

  return (
    <SafeAreaView className="flex-1 bg-light3" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLOR.light3} />

      <BillDetailHeader eventId={billDetail?.eventId ?? ""} title={billDetail?.title ?? ""} />

      <View className="bg-light3 px-5 flex-1">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <ScrollView
          className="bg-light3 flex-1"
          contentContainerClassName="gap-4 pb-20"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 24 }}
        >
          {activeTab === "overall" ? (
            <>
              {billDetail?.paidBy && <PaidByCard participant={billDetail.paidBy} />}
              {billDetail?.items && billDetail.totalAmount && (
                <BillItemsCard
                  items={billDetail.items}
                  subTotal={billDetail.subtotal}
                  tax={billDetail.tax}
                  totalAmount={billDetail.totalAmount}
                />
              )}
              {billDetail?.perUserShares && (
                <ParticipantsCard participants={billDetail.perUserShares} />
              )}
              <ExportButton />
            </>
          ) : (
            <>
              <OwedAmountCard balances={balance} />
              <DebtsListCard debts={balance} />
              <ExportButton />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
