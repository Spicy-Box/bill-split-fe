import { useState } from "react";
import { Text, TouchableOpacity, View, LayoutChangeEvent } from "react-native";
import type { TabBarProps } from "./types";

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const [overallWidth, setOverallWidth] = useState(0);
  const [balancesWidth, setBalancesWidth] = useState(0);

  const handleOverallLayout = (event: LayoutChangeEvent) => {
    setOverallWidth(event.nativeEvent.layout.width);
  };

  const handleBalancesLayout = (event: LayoutChangeEvent) => {
    setBalancesWidth(event.nativeEvent.layout.width);
  };

  return (
    <View className="flex-row px-4 h-12 border-b border-primary2 bg-dark1">
      <TouchableOpacity
        onPress={() => onTabChange("overall")}
        className="flex-1 py-3 items-center justify-center"
      >
        <View onLayout={handleOverallLayout}>
          <Text
            className={`text-sm font-medium font-inter ${
              activeTab === "overall" ? "text-light1" : "text-primary2"
            }`}
          >
            Overall
          </Text>
        </View>
        {activeTab === "overall" && (
          <View
            className="absolute bottom-0 h-1 rounded-t"
            style={{ width: overallWidth, backgroundColor: "#ffffff" }}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onTabChange("balances")}
        className="flex-1 py-3 items-center justify-center"
      >
        <View onLayout={handleBalancesLayout}>
          <Text
            className={`text-sm font-medium font-inter ${
              activeTab === "balances" ? "text-light1" : "text-primary2"
            }`}
          >
            Balances
          </Text>
        </View>
        {activeTab === "balances" && (
          <View
            className="absolute bottom-0 h-1 rounded-t"
            style={{ width: balancesWidth, backgroundColor: "#ffffff" }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
