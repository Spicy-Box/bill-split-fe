import { COLOR } from "@/utils/color";
import { Text, View } from "react-native";
import { Avatar, TextInput } from "react-native-paper";
import type { ManualSplitItemProps, SplitResultListProps } from "./types";
import { getParticipantId } from "./types";
import { useCurrencyInput } from "./useCurrencyInput";

function ManualSplitItem({ split, participant, onUpdateManualSplit }: ManualSplitItemProps) {
  const { text: amountText, handleChange } = useCurrencyInput(split.amount);

  return (
    <View
      className="bg-white py-1 px-1 flex-row items-center justify-between"
      style={{ borderRadius: 16 }}
    >
      <View className="flex-row items-center gap-3 max-w-[35%]">
        <Avatar.Image size={40} source={require("../../assets/images/avatar.png")} />
        <Text className="text-dark1 font-medium font-inter">
          {participant?.user_id ? `${participant.name} (Me)` : participant?.name}
        </Text>
      </View>
      <View className="flex flex-row items-baseline max-w-[50%]">

          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",  
              marginRight: -12
            }}
          >
            VND
          </Text>
          <TextInput
            value={amountText}
            onChangeText={(text) =>
              handleChange(text, (value) => onUpdateManualSplit(split.participantId, value))
            }
            mode="flat"
            keyboardType="decimal-pad"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={COLOR.dark1}
            placeholder="0.00"
            placeholderTextColor={COLOR.dark1}
            selectionColor={COLOR.primary1}
            cursorColor={COLOR.dark1}
            multiline
            // right={<TextInput.Affix text="$" />}
            style={{
              backgroundColor: "transparent",          
              flex: 1,
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "inter",
              textAlign: "left",
              borderRadius: 8,
            }}
          />
        

      </View>
    </View>
  );
}

export default function SplitResultList({
  mode,
  manualSplits,
  participants,
  onUpdateManualSplit,
}: SplitResultListProps) {
  if (mode === "manual") {
    return (
      <View className="bg-primary1 rounded-2xl p-4 mt-4 gap-3">
        {manualSplits.map((split) => {
          const participant = participants.find((p) => getParticipantId(p) === split.participantId);
          return (
            <ManualSplitItem
              key={split.id}
              split={split}
              participant={participant}
              onUpdateManualSplit={onUpdateManualSplit}
            />
          );
        })}
      </View>
    );
  }

  return null;
}
