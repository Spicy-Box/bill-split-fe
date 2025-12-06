import { COLOR } from "@/utils/color";
import { Pencil } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import type { SplitModeOptionsProps } from "./types";

const renderSplitIcon = (iconType: string) => {
  switch (iconType) {
    case "equally":
      return (
        <View className="w-4 h-4 items-center justify-center">
          <View className="w-full h-0.5 bg-light1 mb-0.5" />
          <View className="w-full h-0.5 bg-light1 mb-0.5" />
          <View className="w-full h-0.5 bg-light1" />
        </View>
      );
    case "by-item":
      return (
        <View className="w-4 h-4 items-center justify-center">
          <View className="w-3 h-3 border-2 border-light1 rounded" />
        </View>
      );
    case "manually":
      return <Pencil size={14} color={COLOR.light1} />;
    default:
      return null;
  }
};

export default function SplitModeOptions({
  selectedMode,
  onModeChange,
  splitOptions,
}: SplitModeOptionsProps) {
  return (
    <View className="flex-row gap-2 mt-4">
      {splitOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          onPress={() => onModeChange(option.id)}
          className={`flex-1 ${
            selectedMode === option.id ? "bg-dark1" : "bg-primary2"
          } py-2 rounded-full flex-row items-center justify-center gap-1`}
        >
          {renderSplitIcon(option.icon)}
          <Text className="text-light1 text-xs font-semibold font-inter">
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
