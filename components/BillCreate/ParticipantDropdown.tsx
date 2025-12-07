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

  const Checkbox = ({ checked }: { checked: boolean }) => (
    <View
      className={`w-6 h-6 rounded-sm items-center justify-center border ${checked ? "bg-primary1 border-primary1" : "border-dark1"}`}
    >
      {checked && <Text className="text-dark1 text-xs">✓</Text>}
    </View>
  );

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
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-dark1 font-bold text-base font-inter">
              Select Participant
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-primary1/80 px-3 py-1 rounded-lg"
              activeOpacity={0.8}
            >
              <Text className="text-dark1 font-semibold text-xs">
                Close
              </Text>
            </TouchableOpacity>
          </View>

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
            <Checkbox checked={item?.participants.includes(everyoneOption) ?? false} />
          </TouchableOpacity>

          {/* Individual participants */}
          {participants.map((participant) => {
            const isSelected = !!(
              item?.participants.includes(participant.id) &&
              !item?.participants.includes(everyoneOption)
            );

            return (
              <TouchableOpacity
                key={participant.id}
                onPress={() => onSelectParticipant(itemId, participant.id)}
                className="flex-row items-center py-3 border-b border-light3"
              >
                <Avatar.Image
                  size={35}
                  source={require("../../assets/images/avatar.png")}
                  style={{ marginRight: 12 }}
                />
                <Text className="text-dark1 font-medium font-inter text-base flex-1">
                  {participant.isMe
                    ? `${participant.name} (Me)`
                    : participant.name}
                </Text>
                <Checkbox checked={isSelected} />
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
