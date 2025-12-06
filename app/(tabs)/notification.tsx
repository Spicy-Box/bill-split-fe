import WelcomePanel from "@/components/HomePage/WelcomePanel";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Data interfaces
interface NotificationItem {
  id: number;
  eventType: string;
  status: "Overdue" | "Pending" | "Paid";
  title: string;
  amount: string;
}

// Data separated from UI
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    eventType: "Company Trip",
    status: "Overdue",
    title: "Tacos's Bill",
    amount: "$10",
  },
  {
    id: 2,
    eventType: "Company Trip",
    status: "Overdue",
    title: "Tacos's Bill",
    amount: "$10",
  },
  {
    id: 3,
    eventType: "Company Trip",
    status: "Overdue",
    title: "Tacos's Bill",
    amount: "$10",
  },
  {
    id: 4,
    eventType: "Company Trip",
    status: "Overdue",
    title: "Tacos's Bill",
    amount: "$10",
  },
];

// Helper function to get status badge color
const getStatusColor = (status: NotificationItem["status"]) => {
  switch (status) {
    case "Overdue":
      return "bg-alert";
    case "Pending":
      return "bg-primary2";
    case "Paid":
      return "bg-primary4";
    default:
      return "bg-primary2";
  }
};

export default function NotificationPage() {
  return (
    <SafeAreaView className="flex-1 bg-light3">
      <View className="flex-1">
        {/* Header with WelcomePanel */}
        <View className="p-5 gap-5">
          <WelcomePanel mode="notification" />
        </View>

        {/* Body */}
        <View className="flex-1 px-5 pt-5">
          {/* Notifications Title */}
          <View className="items-center mb-5">
            <Text className="text-dark1 text-2xl font-medium font-inter">
              Notifications
            </Text>
          </View>

          {/* Notifications List */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 20, paddingBottom: 20 }}
          >
            {NOTIFICATIONS.map((notification) => (
              <View
                key={notification.id}
                className="bg-light1 rounded-xl p-4 gap-2"
              >
                {/* Main content row with amount centered vertically */}
                <View className="flex-row items-center justify-between">
                  {/* Left side: tags and title */}
                  <View className="flex-1 gap-2">
                    {/* Tags */}
                    <View className="flex-row items-center gap-2">
                      <View className="bg-primary1 rounded-lg px-3 py-1">
                        <Text className="text-dark1 text-sm font-medium font-inter">
                          {notification.eventType}
                        </Text>
                      </View>
                      <View className={`${getStatusColor(notification.status)} rounded-lg px-3 py-1`}>
                        <Text className="text-light1 text-sm font-medium font-inter">
                          {notification.status}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text className="text-dark1 text-base font-bold font-inter">
                      {notification.title}
                    </Text>
                  </View>

                  {/* Right side: amount centered vertically */}
                  <View className="items-center justify-center">
                    <Text className="text-dark1 text-2xl font-medium font-inter">
                      {notification.amount}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
