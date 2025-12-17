import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "react-native-paper";
import type { PaidByDropdownProps } from "./types";
import { getParticipantId } from "./types";

export default function PaidByDropdown({
  visible,
  selectedId,
  participants,
  onClose,
  onSelect,
}: PaidByDropdownProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-dark1/50" activeOpacity={1} onPress={onClose}>
        <View className="bg-light1 mx-6 mt-32 rounded-2xl p-4">
          <Text className="text-dark1 font-bold text-base font-inter mb-3">Who Paid?</Text>
          {participants.map((participant) => {
            const participantId = getParticipantId(participant);
            return (
              <TouchableOpacity
                key={participantId}
                onPress={() => {
                  onSelect(participantId);
                  onClose();
                }}
                className="flex-row items-center py-3 border-b border-light3"
              >
                <Avatar.Image
                  size={40}
                  source={require("../../assets/images/avatar.png")}
                  style={{ marginRight: 12 }}
                />
                <Text className="text-dark1 font-medium font-inter flex-1">
                  {participant.user_id ? `${participant.name} (Me)` : participant.name}
                </Text>
                {selectedId === participantId && (
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
