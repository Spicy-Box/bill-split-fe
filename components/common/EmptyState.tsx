import { COLOR } from "@/utils/color";
import { LinearGradient } from "expo-linear-gradient";
import { Inbox } from "lucide-react-native";
import type React from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

type IconComponent = React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: IconComponent;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View className="">
      <LinearGradient
        colors={[COLOR.secondary3, COLOR.secondary3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16 }}
      >
        <View className="items-center justify-center py-10 px-6 gap-3">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: COLOR.secondary2 }}
          >
            <Icon size={42} color={COLOR.primary4} strokeWidth={1.7} />
          </View>

          <Text className="text-dark1 text-lg font-bold font-inter text-center">{title}</Text>

          {description ? (
            <Text className="text-dark1 text-sm font-inter text-center italic opacity-60">{description}</Text>
          ) : null}

          {actionLabel && onActionPress ? (
            <Button
              mode="contained"
              onPress={onActionPress}
              buttonColor={COLOR.primary3}
              textColor={COLOR.light1}
              labelStyle={{ fontWeight: "bold" }}
              style={{ marginTop: 4 }}
            >
              {actionLabel}
            </Button>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}
