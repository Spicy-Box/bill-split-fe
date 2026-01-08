import { COLOR } from "@/utils/color";
import { Plus } from "lucide-react-native";
import { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import type { BillItemInputProps } from "./types";

export default function BillItemInput({
  value,
  onChangeText,
  onSubmit,
  onAdd,
}: BillItemInputProps) {
  const textInputRef = useRef<any>(null);

  const handlePlusPress = () => {
    textInputRef.current?.focus();
  };

  return (
    <View
      className="flex-row items-center gap-3 py-3 mt-2"
      style={{
        borderWidth: 1,
        borderColor: COLOR.primary2,
        borderStyle: "dashed",
        borderRadius: 12,
        paddingHorizontal: 12,
      }}
    >
      <TouchableOpacity
        onPress={handlePlusPress}
        style={{
          borderWidth: 1,
          borderColor: COLOR.primary2,
          borderStyle: "dashed",
          borderRadius: 8,
          padding: 6,
        }}
      >
        <Plus size={20} color={COLOR.primary2} />
      </TouchableOpacity>
      <TextInput
        ref={textInputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Create new item"
        placeholderTextColor={COLOR.primary2}
        mode="flat"
        underlineColor="transparent"
        activeUnderlineColor="transparent"
        textColor={COLOR.dark1}
        cursorColor={COLOR.dark1}
        selectionColor={COLOR.dark1}
        style={{
          backgroundColor: "transparent",
          flex: 1,
          fontSize: 14,
          fontStyle: "italic",
          fontFamily: "inter",
          paddingHorizontal: 0,
          height: 40,
        }}
        contentStyle={{ paddingHorizontal: 0 }}
      />
      {value.trim() && (
        <TouchableOpacity onPress={onAdd} className="bg-primary1 px-3 py-1 rounded-lg">
          <Text className="text-dark1 text-xs font-semibold font-inter">Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
