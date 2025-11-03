import { Text } from "@react-navigation/elements";
import { Link } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddEventPage() {
  return (
    <View>
      <Text>Hello</Text>
      <Link href={"/"}>Home</Link>
    </View>
  );
}
