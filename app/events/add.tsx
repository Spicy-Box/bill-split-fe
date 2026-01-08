import {
    EventHeader,
    EventNameAndCurrency,
    ParticipantsList,
    type Participant,
} from "@/components/EventAdd";
import { CurrencyObj, EventRequest } from "@/interfaces/api/event.api";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/utils/api";
import { COLOR } from "@/utils/color";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function AddEventPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState("");
  const [currency, setCurrency] = useState("");
  const [selectedEmoji] = useState("🤗");
  
  const INITIAL_PARTICIPANTS: Participant[] = [
    { id: 1, name: user ? `${user.first_name} ${user.last_name}` : "You", isCurrentUser: true, user_id: user?.id },
    { id: 2, name: "", isCurrentUser: false },
  ];
  
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [errors, setErrors] = useState<{
    eventName?: string;
    currency?: string;
  }>({});

  const removeParticipant = (id: number) => {
    // Không cho phép xóa user hiện tại (participant đầu tiên)
    const participant = participants.find((p) => p.id === id);
    if (participant?.isCurrentUser) {
      return;
    }
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const addParticipant = () => {
    const newId = Math.max(...participants.map((p) => p.id), 0) + 1;
    setParticipants([...participants, { id: newId, name: "", isCurrentUser: false, user_id: undefined }]);
  };

  const updateParticipant = (id: number, name: string) => {
    // Kiểm tra trùng tên với chủ sự kiện hoặc người tham gia khác
    const trimmedName = name.trim();
    
    if (trimmedName) {
      const isDuplicate = participants.some(p => 
        p.id !== id && p.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (isDuplicate) {
        Toast.show({
          type: "error",
          text1: "Duplicate Name",
          text2: "This name is already used by another participant",
        });
        return;
      }
    }
    
    setParticipants(participants.map((p) => {
      // Không cho phép đổi tên user hiện tại
      if (p.id === id && !p.isCurrentUser) {
        return { ...p, name };
      }
      return p;
    }));
  };

  const handleCreateEvent = async () => {
    // Validate event name
    const newErrors: { eventName?: string; currency?: string } = {};
    
    if (!eventName.trim()) {
      newErrors.eventName = "Event name is required";
    }
    // Currency validation removed - always using VND
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);
    try {
      // TODO: Implement create event logic

      // Always use VND currency
      // Loại bỏ chủ sự kiện khỏi danh sách participants (backend tự động thêm dựa trên token)
      const participantsWithoutOwner = participants
        .filter(p => !p.isCurrentUser) // Loại bỏ chủ sự kiện
        .map(p => p.name)
        .filter(Boolean); // Loại bỏ tên rỗng
      
      const req: EventRequest = {
        name: eventName,
        currency: CurrencyObj.VND,
        participants: participantsWithoutOwner,
      };

      await api.post("/events/", req);

      Toast.show({
        type: "success",
        text1: "Add New Event Successfuly",
      });
      router.push("/");
    } catch (err: any) {
      if (isAxiosError(err)) {
        console.log(err.message);
        Toast.show({
          type: "error",
          text1: "Unable to create event",
          text2: err.response?.data?.message ?? err.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 ">
      {loading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 z-10 items-center justify-center flex-1 bg-[rgba(0,0,0,0.5)]">
          <ActivityIndicator size={"large"} color={COLOR.primary3} />
        </View>
      )}

      <SafeAreaView className="flex-1 bg-light1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="py-5 px-6 gap-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <EventHeader
            selectedEmoji={selectedEmoji}
            onEmojiPress={() => {
              // TODO: Open emoji picker
            }}
            onClose={() => router.push("/")}
          />

          <EventNameAndCurrency
            eventName={eventName}
            currency={currency}
            onEventNameChange={setEventName}
            onCurrencyChange={setCurrency}
            errors={errors}
          />

          <ParticipantsList
            participants={participants}
            onAddParticipant={addParticipant}
            onRemoveParticipant={removeParticipant}
            onUpdateParticipant={updateParticipant}
          />

          {/* Create Event Button */}
          <Button
            mode="contained"
            onPress={handleCreateEvent}
            buttonColor={COLOR.primary3}
            textColor={COLOR.light1}
            icon={({ size, color }) => <Text className="text-light1 text-2xl font-bold">+</Text>}
            contentStyle={{ paddingVertical: 4 }}
            labelStyle={{
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "inter",
            }}
            className="rounded-xl"
          >
            Create Event
          </Button>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
