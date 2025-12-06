import { COLOR } from "@/utils/color";
import { Folder, MenuIcon, Pencil } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import type { SplitModeOptionsProps } from "./types";

const renderSplitIcon = (iconType: string) => {
  switch (iconType) {
    case "equally":
      return <MenuIcon size={16} color={COLOR.light1} />;
    case "by-item":
      return <Folder size={16} color={COLOR.light1} />;
    case "manually":
      return <Pencil size={16} color={COLOR.light1} />;
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
          <Text className="text-light1 text-sm font-semibold font-inter">{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
