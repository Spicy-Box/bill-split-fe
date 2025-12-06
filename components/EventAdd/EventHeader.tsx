import { COLOR } from "@/utils/color";
import { IconButton } from "react-native-paper";
import { View, Text, TouchableOpacity } from "react-native";
import type { EventHeaderProps } from "./types";

export default function EventHeader({
  selectedEmoji,
  onEmojiPress,
  onClose,
}: EventHeaderProps) {
  return (
    <>
      {/* Close Button */}
      <View className="flex-row justify-end -mt-2">
        <IconButton
          icon="close"
          iconColor={COLOR.dark1}
          size={24}
          onPress={onClose}
        />
      </View>

      {/* Emoji Selection */}
      <TouchableOpacity
        className="bg-primary1 rounded-2xl py-6 items-center gap-4"
        activeOpacity={0.8}
        onPress={onEmojiPress}
      >
        <View className="bg-light1 rounded-full w-28 h-28 items-center justify-center">
          <Text className="text-6xl">{selectedEmoji}</Text>
        </View>
        <Text className="text-dark1 text-base font-inter font-medium">
          Choose Event&apos;s Emoji
        </Text>
      </TouchableOpacity>
    </>
  );
}
