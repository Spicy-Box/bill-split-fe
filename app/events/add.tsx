import {
  EventHeader,
  EventNameAndCurrency,
  ParticipantsList,
  type Participant,
} from "@/components/EventAdd";
import { COLOR } from "@/utils/color";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 1, name: "Khánh Lê" },
  { id: 2, name: "" },
];

export default function AddEventPage() {
  const router = useRouter();
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

  const handleCreateEvent = () => {
    // TODO: Implement create event logic
    router.push("/events/overall");
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
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
