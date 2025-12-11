import {
  AddBillMenuModal,
  BillsList,
  EventHeader,
  StatsCard,
  type Bill,
  type EventNameAndCurrency,
  type EventStats,
} from "@/components/EventOverall";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

const EVENT_DATA: EventNameAndCurrency = {
  name: "Camping Trip 2025",
  date: "27-10-2025",
  emoji: "🤗",
};

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

export default function OverallScreen() {
  const router = useRouter();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // setShowAddMenu(false);
    // No permissions request is necessary for launching the image library.
    // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
    // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
    // so the app users aren't surprised by a system dialog after picking a video.
    // See "Invoke permissions for videos" sub section for more details.
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

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }

    setShowAddMenu(false);
  };

  const handleOpenCamera = () => {
    setShowAddMenu(false);
    router.push("/events/camera");
    // router.push("/bills/loading");
    // TODO: Implement camera functionality
  };

  const handleCreateBill = () => {
    setShowAddMenu(false);
    router.push("/bills/add");
  };
  // console.log(permission?.status);

  return (
    <>
      <SafeAreaView className="bg-primary1" edges={["top"]} />
      <View className="flex-1">
        <EventHeader eventNameAndCurrency={EVENT_DATA} />

        {/* Body */}
        <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
          <StatsCard stats={STATS_DATA} />
          <BillsList bills={BILLS_DATA} />
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
