import { COLOR } from "@/utils/color";
import { Text, View } from "react-native";
import { Avatar, TextInput } from "react-native-paper";
import type { ManualSplitItemProps, SplitResultListProps } from "./types";
import { useCurrencyInput } from "./useCurrencyInput";

function ManualSplitItem({
  split,
  participant,
  onUpdateManualSplit,
}: ManualSplitItemProps) {
  const { text: amountText, handleChange } = useCurrencyInput(split.amount);

  return (
    <View
      className="bg-white py-1 px-2 flex-row items-center justify-between"
      style={{ borderRadius: 16 }}
    >
      <View className="flex-row items-center gap-3">
        <Avatar.Image
          size={40}
          source={require("../../assets/images/avatar.png")}
        />
        <Text className="text-dark1 font-medium font-inter">
          {participant?.isMe
            ? `${participant.name} (Me)`
            : participant?.name}
        </Text>
      </View>
      <View className="flex flex-row items-center relative">
              
        <View
        style={{
          position: "absolute",
          left: "3%",
          top: 0,
          bottom: 0,        // chiếm full chiều cao => canh giữa bằng flex được
          justifyContent: "center",
          zIndex: 10,
          elevation: 10,
        }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            $
          </Text>
      </View>
      
      <TextInput
        value={amountText}
        onChangeText={(text) =>
          handleChange(text, (value) =>
            onUpdateManualSplit(split.participantId, value)
          )
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
        numberOfLines={2}
        // right={<TextInput.Affix text="$" />}
        style={{
          backgroundColor: COLOR.light1,
          // width: 80,
          fontSize: 14,
          fontWeight: "600",
          fontFamily: "inter",
          textAlign: "right",
          borderRadius: 8,
        }}
        contentStyle={{ paddingHorizontal: 8 }}
      />

      </View>
    </View>
  );
}

export default function SplitResultList({
  mode,
  splitAmounts,
  manualSplits,
  participants,
  hasItems,
  onUpdateManualSplit,
  taxRate,
}: SplitResultListProps) {
  // if (mode === "equally" && hasItems) {
  //   return (
  //     <View className="bg-primary1 rounded-2xl p-4 mt-4 gap-3">
  //       {splitAmounts.map(({ participant, amount }) => (
  //         <View
  //           key={participant.id}
  //           className="flex-row items-center justify-between"
  //         >
  //           <View className="flex-row items-center gap-3">
  //             <Avatar.Image
  //               size={40}
  //               source={require("../../assets/images/avatar.png")}
  //             />
  //             <Text className="text-dark1 font-medium font-inter">
  //               {participant.isMe
  //                 ? `${participant.name} (Me)`
  //                 : participant.name}
  //             </Text>
  //           </View>
  //           <Text className="text-dark1 font-semibold font-inter">
  //             ${amount.toFixed(2)}
  //           </Text>
  //         </View>
  //       ))}
  //     </View>
  //   );
  // }

  if (mode === "manually") {
    return (
      <View className="bg-primary1 rounded-2xl p-4 mt-4 gap-3">
        {manualSplits.map((split) => {
          const participant = participants.find(
            (p) => p.id === split.participantId
          );
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
