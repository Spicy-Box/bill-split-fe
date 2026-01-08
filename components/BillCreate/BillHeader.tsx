import { COLOR } from "@/utils/color";
import { ArrowLeft } from "lucide-react-native";
import { TextInput, TouchableOpacity, View } from "react-native";
import type { BillHeaderProps } from "./types";

export default function BillHeader({ title, onBack, setBillName }: BillHeaderProps) {
  return (
    <View className="bg-primary1 py-6 pt-8 flex-row justify-between items-center">
      <TouchableOpacity
        onPress={onBack}
        className="w-8 h-8 bg-dark1 rounded-full items-center justify-center"
      >
        <ArrowLeft size={20} color={COLOR.light1} />
      </TouchableOpacity>
      <TextInput
        onChangeText={(text) => setBillName(text)}
        className="text-dark1 font-semibold text-base font-inter flex-1 h-full text-center"
        value={title}
        placeholder="New Bill"
        placeholderTextColor={COLOR.dark1}
        selectionColor={COLOR.secondary4}
      />

      <View className="w-8 h-8" />
    </View>
  );
}
