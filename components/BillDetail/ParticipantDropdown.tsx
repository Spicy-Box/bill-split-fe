import { useAuthStore } from "@/stores/useAuthStore";
import { COLOR } from "@/utils/color";
import { Users } from "lucide-react-native";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "react-native-paper";
import type { ParticipantDropdownProps } from "./types";
import { getParticipantId } from "./types";

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
  const user = useAuthStore((state) => state.user);

  console.log("ParticipantDropdown - visible:", visible);
  console.log("ParticipantDropdown - itemId:", itemId);
  console.log("ParticipantDropdown - item:", item);
  console.log("ParticipantDropdown - item?.splitBetween:", item?.splitBetween);
  console.log("ParticipantDropdown - participants:", participants);

  const Checkbox = ({ checked }: { checked: boolean }) => (
    <View
      className={`w-6 h-6 rounded-sm items-center justify-center border ${checked ? "bg-primary1 border-primary1" : "border-dark1"}`}
    >
      {checked && <Text className="text-dark1 text-xs">✓</Text>}
    </View>
  );

  // Check if a participant is included in the item's splitBetween
  const isParticipantSelected = (participantId: string) => {
    if (!item?.splitBetween) return false;
    return item.splitBetween.some(
      (p) => (p.user_id || p.name) === participantId
    );
  };

  // Get display name for participant
  const getDisplayName = (participant: { name: string; user_id?: string | null; is_guest: boolean }) => {
    if (!participant.is_guest && user) {
      return `${user.first_name} ${user.last_name} (Me)`;
    }
    return participant.user_id ? `${participant.name} (Me)` : participant.name;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-dark1/50" activeOpacity={1} onPress={onClose}>
        <View className="bg-light1 mx-6 mt-40 rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-dark1 font-bold text-base font-inter">Shared With</Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-primary1/80 px-3 py-1 rounded-lg"
              activeOpacity={0.8}
            >
              <Text className="text-dark1 font-semibold text-xs">Close</Text>
            </TouchableOpacity>
          </View>

          {/* Everyone option - show all participants when splitType is everyone or splitBetween is null */}
          {item?.splitType === "everyone" || !item?.splitBetween ? (
            <>
              <TouchableOpacity
                onPress={() => {}}
                className="flex-row items-center py-3 border-b border-light3"
                activeOpacity={1}
              >
                <View className="w-10 h-10 bg-primary1 rounded-full items-center justify-center mr-3">
                  <Users size={20} color={COLOR.dark1} />
                </View>
                <Text className="text-dark1 font-medium font-inter flex-1">Everyone</Text>
                <Checkbox checked={true} />
              </TouchableOpacity>

              {/* Show all participants in the everyone group */}
              {(item?.splitBetween || participants).map((participant) => {
                const participantId = getParticipantId(participant);

                return (
                  <TouchableOpacity
                    key={participantId}
                    onPress={() => {}}
                    className="flex-row items-center py-3 border-b border-light3 pl-4"
                    activeOpacity={1}
                  >
                    <Avatar.Image
                      size={35}
                      source={require("../../assets/images/avatar.png")}
                      style={{ marginRight: 12 }}
                    />
                    <Text className="text-dark1 font-medium font-inter text-base flex-1">
                      {getDisplayName(participant)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : (
            /* Individual participants for custom split */
            participants.map((participant) => {
              const participantId = getParticipantId(participant);
              const isSelected = isParticipantSelected(participantId);

              return (
                <TouchableOpacity
                  key={participantId}
                  onPress={() => {}}
                  className="flex-row items-center py-3 border-b border-light3"
                  activeOpacity={1}
                >
                  <Avatar.Image
                    size={35}
                    source={require("../../assets/images/avatar.png")}
                    style={{ marginRight: 12 }}
                  />
                  <Text className="text-dark1 font-medium font-inter text-base flex-1">
                    {getDisplayName(participant)}
                  </Text>
                  <Checkbox checked={isSelected} />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
