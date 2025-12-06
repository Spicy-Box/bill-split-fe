import WelcomePanel from "@/components/HomePage/WelcomePanel";
import { COLOR } from "@/utils/color";
import { useState } from "react";
import { View } from "react-native";
import { IconButton, Searchbar, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import EventList from "@/components/HomePage/EventList";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <SafeAreaView className="p-5 gap-5">
      <WelcomePanel />
      <Searchbar
        placeholder="Search"
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
        style={{ backgroundColor: COLOR.secondary1 }}
        inputStyle={{ color: COLOR.dark1 }}
        iconColor={COLOR.dark1}
        rippleColor={COLOR.secondary1}
      />
      <EventList />
    </SafeAreaView>
  );
}
