import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function CreateNewEvent() {
  const router = useRouter();

  const handlePress = () => {
    router.push("/events/add");
  };

  return (
    <View className="bg-primary1 px-4 py-6 rounded-2xl gap-3 items-center">
      <Text className="font-bold">Want to divvy with friends?</Text>
      <TouchableOpacity
        className="bg-dark1 py-2 px-4 rounded-lg"
        onPress={handlePress}
      >
        <Text className="text-light1 font-bold">Create New Event</Text>
      </TouchableOpacity>
    </View>
  );
}
