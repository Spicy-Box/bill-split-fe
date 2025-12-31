import { COLOR } from "@/utils/color";
import { Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import type { EventNameAndCurrencyProps } from "./types";

export default function EventNameAndCurrency({
  eventName,
  currency,
  onEventNameChange,
  onCurrencyChange,
  errors,
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
          underlineColor={errors?.eventName ? "#DC2626" : COLOR.primary2}
          activeUnderlineColor={errors?.eventName ? "#DC2626" : COLOR.dark1}
          textColor={COLOR.dark1}
          cursorColor={COLOR.dark1}
          selectionColor={COLOR.primary1}
          placeholder="Enter event name"
          placeholderTextColor={COLOR.primary2}
          style={{
            backgroundColor: errors?.eventName ? "#FEE2E2" : COLOR.light3,
          }}
          contentStyle={{ paddingLeft: 16 }}
          right={
            eventName ? (
              <TextInput.Icon
                icon="close-circle"
                onPress={() => onEventNameChange("")}
                color={errors?.eventName ? "#DC2626" : COLOR.primary2}
              />
            ) : null
          }
        />
        {errors?.eventName && (
          <Text className="text-red-600 text-xs font-inter mt-1 ml-1">{errors.eventName}</Text>
        )}
      </View>

      {/* Currency Field */}
      {/* <View>
        <Text className="text-primary2 text-xs font-inter mb-1 ml-1">Currency</Text>
        <TextInput
          value={currency}
          onChangeText={onCurrencyChange}
          mode="flat"
          underlineColor={errors?.currency ? "#DC2626" : COLOR.primary2}
          activeUnderlineColor={errors?.currency ? "#DC2626" : COLOR.dark1}
          textColor={COLOR.dark1}
          cursorColor={COLOR.dark1}
          selectionColor={COLOR.primary1}
          placeholder="VND, USD, EUR..."
          placeholderTextColor={COLOR.primary2}
          style={{
            backgroundColor: errors?.currency ? "#FEE2E2" : COLOR.light3,
          }}
          contentStyle={{ paddingLeft: 16 }}
          right={
            currency ? (
              <TextInput.Icon
                icon="close-circle"
                onPress={() => onCurrencyChange("")}
                color={errors?.currency ? "#DC2626" : COLOR.primary2}
              />
            ) : null
          }
        />
        {errors?.currency && (
          <Text className="text-red-600 text-xs font-inter mt-1 ml-1">{errors.currency}</Text>
        )}
      </View> */}
    </>
  );
}
