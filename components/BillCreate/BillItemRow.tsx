import { COLOR } from "@/utils/color";
import { Minus, Plus, Users, X } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import type { BillItemRowProps } from "./types";
import { useCurrencyInput } from "./useCurrencyInput";
import { formatCurrency } from "@/utils/formatCurrency";

export default function BillItemRow({
  item,
  participantDisplayText,
  onUpdateName,
  onUpdateUnitPrice,
  onUpdateQuantity,
  onRemove,
  onParticipantPress,
  mode,
}: BillItemRowProps) {
  const { text: priceText, handleChange } = useCurrencyInput(item.unitPrice);
  const totalPrice = item.unitPrice * item.quantity;
  const totalPriceStr = formatCurrency(totalPrice);

  return (
    <View className="border-b border-light3 pb-3">
      {/* Main container with left and right columns */}
      <View className={`flex-row items-center gap-3`}>
        {/* Left column: Item details and quantity controls */}
        <View className="flex-1">
          {/* Row 1: Item name and unit price */}
          <View className="flex-row items-baseline gap-2 mb-2">
                        
            <TextInput
             value={item.name}
             onChangeText={onUpdateName}
             mode="flat"
             underlineColor="transparent"
             activeUnderlineColor="transparent"
             textColor={COLOR.dark1}
             cursorColor={COLOR.dark1}
             selectionColor={COLOR.secondary3}
             placeholder="Item name"
             placeholderTextColor={COLOR.primary2}
             multiline
             style={{
               backgroundColor: "transparent",
               maxWidth: "65%",
              //  width: "fit-content",
              //  minWidth: "30%",
               fontSize: 14,
               fontWeight: "700",
               fontFamily: "inter",
               paddingHorizontal: 0,
              //  minHeight: 36,
             }}
             contentStyle={{ paddingHorizontal: 0 }}
            />    
            <View className="flex-row items-baseline">
              
              <Text className="text-primary2 font-inter" style={{ marginRight: 2, fontSize: 10 }}>VND</Text>

              <TextInput
                value={priceText}
                onChangeText={(text) => handleChange(text, onUpdateUnitPrice)}
                mode="flat"
                keyboardType="decimal-pad"
                multiline
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={COLOR.primary2}
                selectionColor={COLOR.secondary3}
                cursorColor={COLOR.primary2}
                placeholder="0.00"
                placeholderTextColor={COLOR.primary2}
                style={{
                  backgroundColor: "transparent",
                  // width: 80,
                  fontSize: 14,
                  // fontFamily: "inter",
                  paddingHorizontal: 0,
                  // height: 36,
                }}
                contentStyle={{ paddingHorizontal: 0 }}
              />
              
            </View>   
          </View>

          {/* Row 2: Participant badge and quantity controls */}
          <View className="flex-row items-center justify-start gap-2">
            {/* Participant Badge */}
            {mode !== "manual" && (
              <TouchableOpacity
                onPress={onParticipantPress}
                className="flex-row items-center gap-1 bg-primary1 rounded-full px-3 py-1"
              >
                <Users size={12} color={COLOR.dark1} />
                <Text className="text-dark1 text-xs font-semibold font-inter">
                  {participantDisplayText}
                </Text>
              </TouchableOpacity>
            )}

            {/* Quantity Controls */}
            <View
              className="flex-row items-center gap-1 bg-dark1 rounded-full p-1"
              style={{ overflow: "hidden" }}
            >
              <TouchableOpacity
                onPress={() => onUpdateQuantity(-1)}
                className="w-6 h-6 bg-primary1 rounded-full items-center justify-center"
              >
                <Minus size={12} color={COLOR.dark1} />
              </TouchableOpacity>
              <Text className="text-white font-bold text-sm w-6 text-center font-inter">
                {item.quantity}
              </Text>
              <TouchableOpacity
                onPress={() => onUpdateQuantity(1)}
                className="w-6 h-6 bg-primary1 rounded-full items-center justify-center"
              >
                <Plus size={12} color={COLOR.dark1} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Right column: Total price and delete button */}
         {/* Total price */}
         <View className={`flex-row items-center gap-2`}>
           <Text className="text-dark1 font-semibold text-sm">
             VND {formatCurrency(item.unitPrice * item.quantity)}
           </Text>


          {/* Delete button */}
          <TouchableOpacity onPress={onRemove} className="w-6 h-6 items-center justify-center">
            <X size={18} color={COLOR.dark1} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
