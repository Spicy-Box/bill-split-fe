import { COLOR } from "@/utils/color";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import type { BillTotalsProps } from "./types";
import { formatCurrency } from "@/utils/formatCurrency";

export default function BillTotals({ subtotal, tax_rate, total, setTaxRate }: BillTotalsProps) {
  const [taxRateText, setTaxRateText] = useState(tax_rate.toString());

  // Sync with external tax_rate changes
  useEffect(() => {
    setTaxRateText(tax_rate.toString());
  }, [tax_rate]);

  const handleTaxRate = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    if ((cleaned.match(/\./g) || []).length > 1) return;

    // Update text immediately to allow decimal input
    setTaxRateText(cleaned);

    // Only update numeric value if it's a valid number
    if (cleaned === ".") {
      setTaxRate(0);
    } else if (!cleaned.endsWith(".")) {
      const numValue = Number(cleaned);
      if (!isNaN(numValue)) {
        setTaxRate(numValue);
      }
    }
  };

  return (
    <View className="border-t border-dark1 pt-4 gap-2 mt-4">
      <View className="flex-row justify-between">
         <Text className="text-dark1 font-medium font-inter">Subtotal</Text>
         <Text className="text-dark1 font-medium">VND {formatCurrency(subtotal)}</Text>
       </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-dark1 font-medium font-inter">Tax (%)</Text>
        <TextInput
          value={taxRateText}
          onChangeText={(text) => handleTaxRate(text)}
          placeholder="Tax Rate"
          placeholderTextColor={COLOR.primary2}
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          textColor={COLOR.dark1}
          cursorColor={COLOR.dark1}
          selectionColor={COLOR.dark1}
          style={{
            backgroundColor: "transparent",
            fontSize: 14,
            fontStyle: "italic",
            fontFamily: "inter",
            paddingHorizontal: 0,
            height: 40,
            flex: 1,
            textAlign: "right",
          }}
          keyboardType="decimal-pad"
          contentStyle={{ paddingHorizontal: 0, textAlign: "right" }}
        />
        {/* <Text className="text-dark1 font-medium">{(tax_rate * 100).toFixed(0)}%</Text> */}
      </View>
      <View className="flex-row justify-between">
        <Text className="text-dark1 font-semibold font-inter">Total</Text>
        <Text className="text-dark1 font-semibold">VND {formatCurrency(total)}</Text>
      </View>
    </View>
  );
}
