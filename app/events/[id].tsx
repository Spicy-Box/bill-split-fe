import {
  AddBillMenuModal,
  BillsList,
  EventHeader,
  StatsCard,
  type Bill,
  type EventStats,
} from "@/components/EventOverall";
import { BillOverallItemRequest } from "@/interfaces/api/bill.api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEventStore } from "@/stores/useEventStore";
import api from "@/utils/api";
import { COLOR } from "@/utils/color";
import { parseDataFromPhoto } from "@/utils/imageOCR";
import { format } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, BackHandler, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// const EVENT_DATA: EventNameAndCurrency = {
//   name: "Camping Trip 2025",
//   date: "27-10-2025",
//   emoji: "🤗",
// };

// const STATS_DATA: EventStats = {
//   myExpenses: 20.5,
//   totalExpenses: 20.5,
// };

const BILLS_DATA: Bill[] = [
  { id: "1", name: "Oyasumi Punpun", amount: 455000, paidBy: "John" },
  { id: "2", name: "Oyasumi Punpun", amount: 455000, paidBy: "Jane" },
  { id: "3", name: "Oyasumi Punpun", amount: 455000, paidBy: "Mike" },
  { id: "4", name: "Oyasumi Punpun", amount: 455000, paidBy: "Sarah" },
];

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [billList, setBillList] = useState<BillOverallItemRequest[]>([]);
  const [date, setDate] = useState<string>("");
  const setParticipants = useEventStore((state) => state.setParticipants);
  const setEventId = useEventStore((state) => state.setEventId);

  // Edit bill modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editNote, setEditNote] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const [STATS_DATA, setStatsData] = useState<EventStats>({
    myExpenses: 0,
    totalExpenses: 0,
  });

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
    if (!result.canceled && result.assets?.[0]) {
      parseDataFromPhoto(result.assets[0].uri, router);
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
    setParticipants(data?.participants ?? []);
    setEventId(id as string);
  }, [id, setParticipants, setEventId]);

  const fetchBillList = useCallback(async () => {
    const response = await api.get(`/bills/?event_id=${id}`);
    const data = response.data.data;

    const bills: BillOverallItemRequest[] = data.map((item: BillOverallItemRequest) => {
      let paidBy = item.paidBy;
      
      // Replace name with current user name if is_guest is false
      if (paidBy && !paidBy.is_guest && user) {
        const userName = `${user.first_name} ${user.last_name}`.trim();
        paidBy = { ...paidBy, name: userName };
      }
      
      return { id: item.id, title: item.title, totalAmount: item.totalAmount, paidBy };
    });

    setBillList(bills);

    console.log(bills);
  }, [id, user]);

  const fetchEventSummary = useCallback(async () => {
    try {
      const eventSummaryTotalAmount = await api.get(`/bills/events/${id}/summary`);
      const myExpense = await api.get(`/bills/events/${id}/registered-users-expense`);
      
      
      setStatsData((prevStats) => ({
        ...prevStats,
        myExpenses: myExpense.data.data.totalExpense,
        totalExpenses: eventSummaryTotalAmount.data.data.totalAmount,
      }));
      
    } catch (error) {
      console.error("Failed to fetch event summary:", error);
    }}, [id]);

  const handleDeleteBill = useCallback(async (billId: string) => {
    try {
      await api.delete(`/bills/${billId}`);
      // Refresh data after deletion
      await Promise.all([
        fetchBillList(),
        fetchEventSummary(),
        fetchEventDetails(),
      ]);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Bill deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete bill:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete bill. Please try again.",
      });
    }
  }, [fetchBillList, fetchEventSummary, fetchEventDetails]);

  const handleEditBill = useCallback((billId: string, currentTitle: string) => {
    setEditingBillId(billId);
    setEditTitle(currentTitle);
    setEditNote("");
    setShowEditModal(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingBillId) return;

    try {
      await api.put(`/bills/${editingBillId}`, {
        title: editTitle,
        note: editNote,
      });
      
      setShowEditModal(false);
      setEditingBillId(null);
      setEditTitle("");
      setEditNote("");
      
      // Refresh bill list
      await fetchBillList();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Bill updated successfully",
      });
    } catch (error) {
      console.error("Failed to update bill:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update bill. Please try again.",
      });
    }
  }, [editingBillId, editTitle, editNote, fetchBillList]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchEventDetails(),
        fetchEventSummary(),
        fetchBillList(),
      ]);
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchEventDetails, fetchEventSummary, fetchBillList]);

  useEffect(() => {
    fetchEventDetails();
    fetchEventSummary();
    fetchBillList();
  }, [fetchEventDetails, fetchBillList, fetchEventSummary]);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      router.navigate("/");
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [router]);

  return (
    <>
      <SafeAreaView className="bg-primary1" edges={["top"]} />
      <View className="flex-1">
        <View className="flex-row bg-primary1 justify-end">
          <IconButton
            icon={"close"}
            iconColor={COLOR.dark1}
            size={25}
            onPress={() => router.navigate("/")}
          />
        </View>
        <EventHeader
          eventNameAndCurrency={{
            name: eventName,
            date: date,
            emoji: "🤗",
          }}
        />
        {/* Body */}
        <ScrollView
          className="flex-1 px-5 pt-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLOR.primary3}
              colors={[COLOR.primary3]}
            />
          }
        >
          <StatsCard stats={STATS_DATA} />
          <BillsList bills={billList} onDeleteBill={handleDeleteBill} onEditBill={handleEditBill} />
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

        {/* Edit Bill Modal */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-light1 rounded-2xl p-6 w-full max-w-md">
              <Text className="text-dark1 text-xl font-bold font-inter mb-4">Edit Bill</Text>
              
              <Text className="text-dark1 text-sm font-medium font-inter mb-2">Title</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-dark1 font-inter"
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Enter bill title"
              />
              
              <Text className="text-dark1 text-sm font-medium font-inter mb-2">Note (Optional)</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-6 text-dark1 font-inter"
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Enter note"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-300 rounded-lg py-3 items-center"
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingBillId(null);
                    setEditTitle("");
                    setEditNote("");
                  }}
                >
                  <Text className="text-dark1 font-semibold font-inter">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-primary3 rounded-lg py-3 items-center"
                  onPress={handleSaveEdit}
                >
                  <Text className="text-light1 font-semibold font-inter">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
