import { COLOR } from "@/utils/color";
import { Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import type { EventNameAndCurrencyProps } from "./types";

export default function EventNameAndCurrency({
  eventName,
  currency,
  onEventNameChange,
  onCurrencyChange,
}: EventNameAndCurrencyProps) {
  return (
    <>
      {/* Event Name Field */}
      <View>
        <Text className="text-primary2 text-xs font-inter mb-1 ml-1">Event&apos;s name</Text>
        <TextInput
          value={eventName}
          onChangeText={onEventNameChange}
          mode="flat"
          underlineColor={COLOR.primary2}
          activeUnderlineColor={COLOR.dark1}
          textColor={COLOR.dark1}
          cursorColor={COLOR.dark1}
          selectionColor={COLOR.primary1}
          placeholder="Enter event name"
          placeholderTextColor={COLOR.primary2}
          style={{
            backgroundColor: COLOR.light3,
          }}
          contentStyle={{ paddingLeft: 16 }}
          right={
            eventName ? (
              <TextInput.Icon
                icon="close-circle"
                onPress={() => onEventNameChange("")}
                color={COLOR.primary2}
              />
            ) : null
          }
        />
      </View>

      {/* Currency Field */}
      <View>
        <Text className="text-primary2 text-xs font-inter mb-1 ml-1">Currency</Text>
        <TextInput
          value={currency}
          onChangeText={onCurrencyChange}
          mode="flat"
          underlineColor={COLOR.primary2}
          activeUnderlineColor={COLOR.dark1}
          textColor={COLOR.dark1}
          cursorColor={COLOR.dark1}
          selectionColor={COLOR.primary1}
          placeholder="VND, USD, EUR..."
          placeholderTextColor={COLOR.primary2}
          style={{
            backgroundColor: COLOR.light3,
          }}
          contentStyle={{ paddingLeft: 16 }}
          right={
            currency ? (
              <TextInput.Icon
                icon="close-circle"
                onPress={() => onCurrencyChange("")}
                color={COLOR.primary2}
              />
            ) : null
          }
        />
      </View>
    </>
  );
}
