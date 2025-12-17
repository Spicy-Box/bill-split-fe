import {
  AddBillMenuModal,
  BillsList,
  EventHeader,
  StatsCard,
  type Bill,
  type EventNameAndCurrency,
  type EventStats,
} from "@/components/EventOverall";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import api from "@/utils/api";
import { format } from "date-fns";
import { useEventStore } from "@/stores/useEventStore";

// const EVENT_DATA: EventNameAndCurrency = {
//   name: "Camping Trip 2025",
//   date: "27-10-2025",
//   emoji: "🤗",
// };

const STATS_DATA: EventStats = {
  myExpenses: 20.5,
  totalExpenses: 20.5,
};

const BILLS_DATA: Bill[] = [
  { id: "1", name: "Oyasumi Punpun", amount: 455000, paidBy: "John" },
  { id: "2", name: "Oyasumi Punpun", amount: 455000, paidBy: "Jane" },
  { id: "3", name: "Oyasumi Punpun", amount: 455000, paidBy: "Mike" },
  { id: "4", name: "Oyasumi Punpun", amount: 455000, paidBy: "Sarah" },
];

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [eventName, setEventName] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const setParticipants = useEventStore((state) => state.setParticipants);
  const setEventId = useEventStore((state) => state.setEventId);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access the media library is required.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }

    setShowAddMenu(false);
  };

  const handleOpenCamera = () => {
    setShowAddMenu(false);
    router.push("/events/camera");
  };

  const handleCreateBill = () => {
    setShowAddMenu(false);
    router.push("/bills/add");
  };

  const fetchEventDetails = useCallback(async () => {
    const response = await api.get(`/events/${id}`);
    const data = response.data.data;

    console.log(data);

    setEventName(data.name);
    setDate(format(data.createdAt, "dd-MM-yyyy"));
    setTotalAmount(data.totalAmount);
    setBills(data.bills);
    setParticipants(data?.participants ?? []);
    setEventId(id as string);
  }, [id, setParticipants, setEventId]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  return (
    <>
      <SafeAreaView className="bg-primary1" edges={["top"]} />
      <View className="flex-1">
        <EventHeader
          eventNameAndCurrency={{
            name: eventName,
            date: date,
            emoji: "🤗",
          }}
        />

        {/* Body */}
        <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
          <StatsCard stats={STATS_DATA} />
          <BillsList bills={bills} />
        </ScrollView>

        {/* Add Bill FAB */}
        <View className="absolute bottom-8 left-0 right-0 items-center z-10">
          <TouchableOpacity
            onPress={() => setShowAddMenu(true)}
            className="items-center gap-1"
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 bg-primary3 rounded-full items-center justify-center">
              <Plus size={20} color="white" />
            </View>
            <View className="bg-primary3 rounded-2xl px-4 py-1">
              <Text className="text-light1 text-center text-xs font-semibold font-inter">
                Add Bill
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <AddBillMenuModal
          visible={showAddMenu}
          onClose={() => setShowAddMenu(false)}
          onOpenCamera={handleOpenCamera}
          onUploadBill={pickImage}
          onCreateBill={handleCreateBill}
        />
      </View>
    </>
  );
}
