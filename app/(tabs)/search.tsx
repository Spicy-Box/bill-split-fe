import EventList from "@/components/HomePage/EventList";
import WelcomePanel from "@/components/HomePage/WelcomePanel";
import { COLOR } from "@/utils/color";
import { useState } from "react";
import { View } from "react-native";
import { Searchbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-5 gap-5">
        <WelcomePanel />
        <Searchbar
           placeholder="Search by event, creator or participant"
           onChangeText={(text) => setSearchQuery(text)}
           value={searchQuery}
           style={{ backgroundColor: COLOR.secondary1 }}
           inputStyle={{ color: COLOR.dark1, fontSize: 14 }}
           iconColor={COLOR.dark1}
           rippleColor={COLOR.secondary1}
         />
        <EventList searchQuery={searchQuery} />
      </View>
    </SafeAreaView>
  );
}
