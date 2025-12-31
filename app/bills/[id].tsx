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
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams } from "expo-router";
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";


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
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const fetchBillDetail = useCallback(async () => {
    try {
      setIsLoadingDetail(true);
      const response = await api.get(`/bills/${id}`);
      const data: BillByItemResponse = response.data.data;
      setBillDetail(data);
      console.log(data);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [id]);

  const fetchBillBalances = useCallback(async () => {
    try {
      setIsLoadingBalance(true);
      const response = await api.get(`/bills/${id}/balances`);
      const data = response.data.data;
      console.log(data);
      setBalance(data.balances);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBillDetail();
    fetchBillBalances();
  }, [fetchBillDetail, fetchBillBalances]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get(`/bills/${id}/export-pdf`, {
        responseType: 'arraybuffer'
      });
      
      // Convert arraybuffer to base64 (works in React Native)
      const bytes = new Uint8Array(response.data);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      
      const fileName = `bill ${billDetail?.title ?? "bill"}_ trả bởi ${billDetail?.paidBy?.name ?? ""}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: 'base64',
      });
      
      // Share file - user can choose to save to Files/Downloads
      if (await Sharing.isAvailableAsync()) {
        if (Platform.OS === 'android') {
          const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permission.granted) {
            const base64Data = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
            const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
              permission.directoryUri,
              fileName,
              'application/pdf' //mine type
            );
            await FileSystem.writeAsStringAsync(newFileUri, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            // console.log('File saved to:', newFileUri);
            const parts = newFileUri.split('/');
            const displayPath = decodeURIComponent(parts.length >= 2 ? parts.slice(-2).join('/') : "").replace('primary:', '');
            

            
            


            
            Toast.show({
              type: 'success',
              text1: 'PDF ready',
              text2: `File saved to ${displayPath}`,
            });
          } else {
            // throw new Error('Permission to access storage was denied');
            Toast.show({
              type: 'error',
              text1: 'Permission to access storage was denied',
            });
          }
        }

        // iOS and others
        else{
          await Sharing.shareAsync(fileUri);
          Toast.show({
            type: 'success',
            text1: 'PDF ready',
            text2: `File saved to ${fileUri[-1]}`,
          });
        }
      } 
      
      
      
      else {
        Toast.show({
          type: 'error',
          text1: 'Sharing not available',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to export PDF',
      });
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  console.log({ billDetail });

  return (
    <SafeAreaView className="flex-1 bg-light3" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLOR.light3} />

      <BillDetailHeader eventId={billDetail?.eventId ?? ""} title={billDetail?.title ?? ""} />

      <View className="bg-light3 px-5 flex-1">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "overall" && isLoadingDetail ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLOR.primary3} />
          </View>
        ) : activeTab === "balances" && isLoadingBalance ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLOR.primary3} />
          </View>
        ) : (
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
                <ExportButton onPress={handleExport} isLoading={isExporting} />
              </>
            ) : (
              <>
                <OwedAmountCard balances={balance} />
                <DebtsListCard debts={balance} />
                <ExportButton onPress={handleExport} isLoading={isExporting} />
              </>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
