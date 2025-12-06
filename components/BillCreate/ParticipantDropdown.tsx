import { COLOR } from "@/utils/color";
import { Users } from "lucide-react-native";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "react-native-paper";
import type { ParticipantDropdownProps } from "./types";

export default function ParticipantDropdown({
  visible,
  itemId,
  items,
  participants,
  everyoneOption,
  onClose,
  onSelectParticipant,
}: ParticipantDropdownProps) {
  const item = items.find((i) => i.id === itemId);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-dark1/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-light1 mx-6 mt-40 rounded-2xl p-4">
          <Text className="text-dark1 font-bold text-base font-inter mb-3">
            Select Participant
          </Text>

          {/* Everyone option */}
          <TouchableOpacity
            onPress={() => onSelectParticipant(itemId, everyoneOption)}
            className="flex-row items-center py-3 border-b border-light3"
          >
            <View className="w-10 h-10 bg-primary1 rounded-full items-center justify-center mr-3">
              <Users size={20} color={COLOR.dark1} />
            </View>
            <Text className="text-dark1 font-medium font-inter flex-1">
              Everyone
            </Text>
            {item?.participants.includes(everyoneOption) && (
              <View className="w-5 h-5 bg-primary1 rounded-full items-center justify-center">
                <Text className="text-dark1 text-xs">✓</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Individual participants */}
          {participants.map((participant) => {
            const isSelected =
              item?.participants.includes(participant.id) &&
              !item?.participants.includes(everyoneOption);

            return (
              <TouchableOpacity
                key={participant.id}
                onPress={() => onSelectParticipant(itemId, participant.id)}
                className="flex-row items-center py-3 border-b border-light3"
              >
                <Avatar.Image
                  size={40}
                  source={require("../../assets/images/avatar.png")}
                  style={{ marginRight: 12 }}
                />
                <Text className="text-dark1 font-medium font-inter flex-1">
                  {participant.isMe
                    ? `${participant.name} (Me)`
                    : participant.name}
                </Text>
                {isSelected && (
                  <View className="w-5 h-5 bg-primary1 rounded-full items-center justify-center">
                    <Text className="text-dark1 text-xs">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
