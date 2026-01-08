import { COLOR } from "@/utils/color";
import { formatCurrency } from "@/utils/formatCurrency";
import { User } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ParticipantDropdown from "./ParticipantDropdown";
import type { BillItemsCardProps } from "./types";

export default function BillItemsCard({ items, subTotal, tax, totalAmount, perUserShares }: BillItemsCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleParticipantPress = (itemId: string) => {
    setSelectedItemId(itemId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItemId(null);
  };

  // Get all unique participants from all items, or use perUserShares as fallback
  const allParticipants = items.reduce((acc, item) => {
    if (item.splitBetween) {
      item.splitBetween.forEach((participant) => {
        const id = participant.user_id || participant.name;
        if (!acc.find((p) => (p.user_id || p.name) === id)) {
          acc.push(participant);
        }
      });
    }
    return acc;
  }, [] as { name: string; user_id?: string | null; is_guest: boolean }[]);

  // If no participants found from items, use perUserShares
  const finalParticipants = allParticipants.length > 0 
    ? allParticipants 
    : (perUserShares?.map(share => share.userName) || []);

  console.log("BillItemsCard - items:", items);
  console.log("BillItemsCard - finalParticipants:", finalParticipants);

  return (
    <View className="bg-light1 rounded-3xl p-4 gap-4">
      {items &&
        items.map((item, idx) => (
          <View key={item.id}>
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row gap-2 items-baseline mb-2 flex-wrap">
                    <Text className="text-dark1 font-bold text-sm font-inter">{item.name}</Text>
                    <Text className="text-primary2 text-xs font-bold font-inter">
                      VND {formatCurrency(item.unitPrice ?? 0)}
                    </Text>
                  </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity 
                    className="flex-row items-center gap-1 bg-primary1 rounded-full px-2 py-0.5"
                    onPress={() => handleParticipantPress(item.id)}
                    activeOpacity={0.7}
                  >
                    <User size={14} color={COLOR.dark1} />
                    <Text className="text-dark1 text-xs font-semibold font-inter">
                      {item.splitType === "everyone" || !item.splitType
                        ? "Everyone"
                        : `x${item.splitBetween?.length ?? 0} people`}
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-primary2 text-sm font-medium font-inter">
                    x{item.quantity}
                  </Text>
                </View>
              </View>
              <Text className="text-dark1 font-semibold ml-2">
                VND {formatCurrency(item.totalPrice ?? 0)}
              </Text>
            </View>
            {idx < items.length - 1 && <View className="border-b border-primary2 mt-3" />}
          </View>
        ))}

      {/* Summary */}
      <View className="border-t border-dark1 pt-3 gap-2">
        <View className="flex-row justify-between items-center">
           <Text className="text-dark1 font-bold text-sm font-inter">Sub Total</Text>
           <Text className="text-dark1 font-semibold text-md">VND {formatCurrency(subTotal ?? 0)}</Text>
         </View>
         <View className="flex-row justify-between items-center">
           <Text className="text-dark1 font-bold text-sm font-inter">Tax</Text>
           <Text className="text-dark1 font-semibold text-md">{(tax ?? 0).toFixed(0)}%</Text>
         </View>
         <View className="flex-row justify-between items-center">
           <Text className="text-dark1 font-bold text-sm font-inter">Total</Text>
           <Text className="text-dark1 font-bold text-md">VND {formatCurrency(totalAmount ?? 0)}</Text>
         </View>
      </View>

      {/* Participant Modal */}
      <ParticipantDropdown
        visible={modalVisible}
        itemId={selectedItemId || ""}
        items={items}
        participants={finalParticipants}
        everyoneOption="everyone"
        onClose={handleCloseModal}
        onSelectParticipant={() => {}} // Read-only mode, no selection changes
      />
    </View>
  );
}
