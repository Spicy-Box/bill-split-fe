import { COLOR } from "@/utils/color";
import { Download } from "lucide-react-native";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import type { ExportButtonProps } from "./types";

export default function ExportButton({ onPress, isLoading }: ExportButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      className="w-full bg-dark1 py-3 rounded-full flex-row items-center justify-center gap-2"
      style={{ opacity: isLoading ? 0.7 : 1 }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLOR.light1} />
      ) : (
        <Download size={20} color={COLOR.light1} />
      )}
      <Text className="text-light1 font-semibold font-inter">
        {isLoading ? 'Exporting...' : 'Export PDF'}
      </Text>
    </TouchableOpacity>
  );
}
