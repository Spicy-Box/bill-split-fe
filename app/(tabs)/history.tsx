import EventIcon from "@/assets/images/event-icon.svg";
import WelcomePanel from "@/components/HomePage/WelcomePanel";
import EmptyState from "@/components/common/EmptyState";
import api from "@/utils/api";
import { COLOR } from "@/utils/color";
import { formatCurrency } from "@/utils/formatCurrency";
import { useRouter } from "expo-router";
import { CalendarX2, ReceiptText } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Data interfaces
interface HistoryItem {
  id: string | number;
  type: string;
  name: string;
  date: string;
  amount: string;
  imageUrl: string;
  participants?: number;
}

type TabType = "bill" | "event";

// Data separated from UI
const HISTORY_ITEMS: HistoryItem[] = [
  {
    id: 1,
    type: "Company Trip",
    name: "Oyasumi Punpun",
    date: "15 Oct, 2025",
    amount: "VND 455,000",
    imageUrl:
      "https://api.builder.io/api/v1/image/assets/TEMP/384e4eaae9514a2267a6095064835f2d0e0a621e?width=104",
    participants: 5,
  },
  {
    id: 2,
    type: "Company Trip",
    name: "Oyasumi Punpun",
    date: "15 Oct, 2025",
    amount: "VND 455,000",
    imageUrl:
      "https://api.builder.io/api/v1/image/assets/TEMP/384e4eaae9514a2267a6095064835f2d0e0a621e?width=104",
    participants: 3,
  },
  {
    id: 3,
    type: "Company Trip",
    name: "Oyasumi Punpun",
    date: "15 Oct, 2025",
    amount: "VND 455,000",
    imageUrl:
      "https://api.builder.io/api/v1/image/assets/TEMP/384e4eaae9514a2267a6095064835f2d0e0a621e?width=104",
    participants: 4,
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("bill");
  const [billHistory, setBillHistory] = useState<HistoryItem[]>([]);
  const [eventHistory, setEventHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const displayedHistory = activeTab === "bill" ? billHistory : eventHistory;

  useEffect(() => {
    if (activeTab === "bill") {
      fetchBillHistory();
    } else if (activeTab === "event") {
      fetchEventHistory();
    }
  }, [activeTab]);

  const fetchBillHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/history/bills");
      
      if (response.data && response.data.data && response.data.data.bills) {
        const mappedBills: HistoryItem[] = response.data.data.bills.map((bill: any) => ({
          id: bill.id,
          type: bill.note || "Bill",
          name: bill.title,
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          amount: `VND ${formatCurrency(bill.totalAmount)}`,
          imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/384e4eaae9514a2267a6095064835f2d0e0a621e?width=104",
          participants: bill.perUserShares?.length || 0,
        }));
        setBillHistory(mappedBills);
      }
    } catch (error) {
      console.error("Error fetching bill history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/history/events");
      
      if (response.data && response.data.data && response.data.data.events) {
        let data = response.data.data.events;
        let dataWithSummary = data;
        
        // Fetch summary cho từng event chỉ khi có dữ liệu
        if (data.length > 0) {
          const summaries = await Promise.allSettled(
            data.map((item: any) =>
              api
                .get(`/bills/events/${item.id}/summary`)
                .then((res) => res.data?.data || { totalAmount: 0 })
            )
          );

          // Update totalAmount từ summary
          dataWithSummary = data.map((item: any, index: number) => {
            const summary = summaries[index];
            const totalAmount =
              summary.status === "fulfilled" && summary.value?.totalAmount
                ? summary.value.totalAmount
                : item.totalAmount || 0;

            return {
              ...item,
              totalAmount,
            };
          });
        }

        const mappedEvents: HistoryItem[] = dataWithSummary.map((event: any) => ({
          id: event.id,
          type: "Event",
          name: event.name,
          date: new Date(event.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          amount: `VND ${formatCurrency(event.totalAmount)}`,
          imageUrl: "https://api.builder.io/api/v1/image/assets/TEMP/384e4eaae9514a2267a6095064835f2d0e0a621e?width=104",
          participants: event.participantsCount,
        }));
        setEventHistory(mappedEvents);
      }
    } catch (error) {
      console.error("Error fetching event history:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === "bill") {
        await fetchBillHistory();
      } else {
        await fetchEventHistory();
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-light3">
      <View className="flex-1">
        {/* Header with WelcomePanel */}
        <View className="p-5 gap-5">
          <WelcomePanel mode="history" />
        </View>

        {/* Body */}
        <View className="flex-1 px-5 pt-5">
          {/* History Title */}
          <View className="items-center mb-5">
            <Text className="text-dark1 text-2xl font-medium font-inter">
              History
            </Text>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-0 bg-dark1  overflow-hidden mb-5">
            <TouchableOpacity
              onPress={() => setActiveTab("bill")}
              className="flex-1 py-3 items-center"
              activeOpacity={0.7}
            >
              <View>
                <Text
                  className={`text-sm font-medium font-inter ${
                    activeTab === "bill" ? "text-light1" : "text-primary2"
                  }`}
                >
                  Bill
                </Text>
                {activeTab === "bill" && (
                  <View className="h-1 bg-light1 mt-1" />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("event")}
              className="flex-1 py-3 items-center"
              activeOpacity={0.7}
            >
              <View>
                <Text
                  className={`text-sm font-medium font-inter ${
                    activeTab === "event" ? "text-light1" : "text-primary2"
                  }`}
                >
                  Event
                </Text>
                {activeTab === "event" && (
                  <View className="h-1 bg-light1 mt-1" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* History List */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 20, paddingBottom: 20, flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLOR.primary3}
                colors={[COLOR.primary3]}
              />
            }
          >
            {loading && !refreshing ? (
              <View className="flex-1 items-center justify-center py-10">
                <ActivityIndicator size="large" color={COLOR.primary3} />
              </View>
            ) : displayedHistory.length === 0 ? (
              <EmptyState
                icon={activeTab === "bill" ? ReceiptText : CalendarX2}
                title={activeTab === "bill" ? "No bills yet" : "No events yet"}
                description={
                  activeTab === "bill"
                    ? "Recent bills you create or join will appear here."
                    : "Your event history will show up once you start splitting bills."
                }
                actionLabel="Refresh"
                onActionPress={onRefresh}
              />
            ) : (
              displayedHistory.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-light1 rounded-xl p-3 gap-2"
                  onPress={() =>
                    activeTab === "bill"
                      ? router.push(`/bills/${item.id}`)
                      : router.push(`/events/${item.id}`)
                  }
                  activeOpacity={0.7}
                >
                  {/* Event Type Badge - Only show for Bill tab */}
                  {activeTab === "bill" && (
                    <View className="flex-row items-center">
                      <View className="bg-primary1 rounded-lg px-3 py-1">
                        <Text className="text-dark1 text-sm font-medium font-inter">
                          {item.type}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Item Content */}
                  <View className="flex-row items-center justify-between gap-3">
                    {/* Image and Info */}
                    <View className="flex-row items-center gap-2 flex-1">
                      <EventIcon width={52} height={52} />
                      <View className="flex-1 gap-1">
                        <Text className="text-dark1 font-semibold text-base font-inter">
                          {item.name}
                        </Text>
                        <Text className="text-dark1 text-base font-medium font-inter opacity-40">
                          {item.date}
                        </Text>
                      </View>
                    </View>

                    {/* Amount Badge with Participants (for Event tab) */}
                    <View className="gap-1">
                      <Text className="bg-primary3 text-light1 rounded-lg px-3 py-1 text-sm font-bold font-inter text-center">
                        {item.amount}
                      </Text>
                      {activeTab === "event" && item.participants && (
                        <View className="ml-auto">
                          <Text className="text-primary2 font-semibold font-inter text-center">
                            {item.participants} persons
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

