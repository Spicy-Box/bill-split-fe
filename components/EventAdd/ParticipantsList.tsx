import { COLOR } from "@/utils/color";
import { UserPlus } from "lucide-react-native";
import { Avatar, Button, IconButton, TextInput } from "react-native-paper";
import { View } from "react-native";
import type { ParticipantsListProps } from "./types";

export default function ParticipantsList({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onUpdateParticipant,
}: ParticipantsListProps) {
  return (
    <>
      {/* Add Participant Button */}
      <Button
        mode="contained"
        onPress={onAddParticipant}
        buttonColor={COLOR.dark1}
        textColor={COLOR.light1}
        icon={({ size, color }) => (
          <UserPlus size={size} color={color} />
        )}
        contentStyle={{ paddingVertical: 4 }}
        labelStyle={{ fontSize: 14, fontWeight: "600", fontFamily: "inter" }}
        className="rounded-xl"
      >
        Add new participant
      </Button>

      {/* Participants List */}
      <View className="gap-3">
        {participants.map((participant) => (
          <View
            key={participant.id}
            className="bg-light3 rounded-2xl py-2 pl-4 pr-2 flex-row items-center"
          >
            <Avatar.Image
              size={48}
              source={require("../../assets/images/avatar.png")}
            />
            <TextInput
              value={participant.name}
              onChangeText={(text) => onUpdateParticipant(participant.id, text)}
              placeholder="Participant name"
              placeholderTextColor={COLOR.primary2}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={COLOR.dark1}
              cursorColor={COLOR.dark1}
              selectionColor={COLOR.primary1}
              style={{
                backgroundColor: "transparent",
                flex: 1,
                fontSize: 14,
                fontWeight: "500",
                fontFamily: "inter",
                marginLeft: 12,
              }}
              contentStyle={{ paddingHorizontal: 0 }}
            />
            <IconButton
              icon="close"
              iconColor={COLOR.light1}
              containerColor={COLOR.dark1}
              size={16}
              onPress={() => onRemoveParticipant(participant.id)}
            />
          </View>
        ))}
      </View>
    </>
  );
}
