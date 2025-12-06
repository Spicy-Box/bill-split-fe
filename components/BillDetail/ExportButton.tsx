import { COLOR } from "@/utils/color";
import { Download } from "lucide-react-native";
import { Text, TouchableOpacity } from "react-native";
import type { ExportButtonProps } from "./types";

export default function ExportButton({ onPress }: ExportButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-full bg-dark1 py-3 rounded-full flex-row items-center justify-center gap-2"
    >
      <Download size={20} color={COLOR.light1} />
      <Text className="text-light1 font-semibold font-inter">Export PDF</Text>
    </TouchableOpacity>
  );
}
