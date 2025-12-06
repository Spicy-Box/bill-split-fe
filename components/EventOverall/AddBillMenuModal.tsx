import { Camera, Pencil, Upload } from "lucide-react-native";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import type { AddBillMenuModalProps } from "./types";

export const AddBillMenuModal = ({
  visible,
  onClose,
  onOpenCamera,
  onUploadBill,
  onCreateBill,
}: AddBillMenuModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-dark1/30" activeOpacity={1} onPress={onClose}>
        <View className="flex-1" />
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View className="bg-light1 rounded-t-2xl px-6 pb-12 pt-10 gap-8 relative">
            {/* Open Camera Option */}
            <TouchableOpacity onPress={onOpenCamera} className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-primary3 rounded-full items-center justify-center absolute">
                <Camera size={20} color="white" />
              </View>
              <Text className="flex-1 text-center text-dark1 text-md font-semibold">
                Open Camera
              </Text>
            </TouchableOpacity>

            {/* Upload Bill Option */}
            <TouchableOpacity onPress={onUploadBill} className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-primary3 rounded-full items-center justify-center absolute">
                <Upload size={20} color="white" />
              </View>
              <Text className="flex-1 text-center text-dark1 text-md font-semibold">
                Upload Bill
              </Text>
            </TouchableOpacity>

            {/* Create Bill Option */}
            <TouchableOpacity onPress={onCreateBill} className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-primary3 rounded-full items-center justify-center absolute">
                <Pencil size={18} color="white" />
              </View>
              <Text className="flex-1 text-center text-dark1 text-md font-semibold">
                Create Bill
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
