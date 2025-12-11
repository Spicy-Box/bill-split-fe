import {
  EventHeader,
  EventNameAndCurrency,
  ParticipantsList,
  type Participant,
} from "@/components/EventAdd";
import { CurrencyObj, EventRequest } from "@/interfaces/api/event.api";
import api from "@/utils/api";
import { COLOR } from "@/utils/color";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 1, name: "Khánh Lê" },
  { id: 2, name: "" },
];

export default function AddEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState("");
  const [currency, setCurrency] = useState("");
  const [selectedEmoji] = useState("🤗");
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);

  const removeParticipant = (id: number) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const addParticipant = () => {
    const newId = Math.max(...participants.map((p) => p.id), 0) + 1;
    setParticipants([...participants, { id: newId, name: "" }]);
  };

  const updateParticipant = (id: number, name: string) => {
    setParticipants(participants.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      // TODO: Implement create event logic

      const currencyKey = (Object.keys(CurrencyObj) as (keyof typeof CurrencyObj)[]).find(
        (code) => code === currency
      );
      console.log(currencyKey);
      const defaultCurrency = currencyKey ? CurrencyObj[currencyKey] : CurrencyObj.VND;

      const req: EventRequest = {
        name: eventName,
        currency: defaultCurrency,
        participants: participants.map((p) => p.name).filter(Boolean),
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
