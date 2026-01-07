import { useEffect, useState } from "react";

// Format number with thousands separator (dot)
function formatWithDots(numStr: string): string {
  const parts = numStr.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add dots as thousands separator
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return decimalPart ? `${formatted}.${decimalPart}` : formatted;
}

export function useCurrencyInput(value: number) {
  const [text, setText] = useState(value > 0 ? formatWithDots(value.toString()) : "");

  useEffect(() => {
    const parsedCurrent = parseFloat(text.replace(/\./g, "").replace(",", "."));
    const numericText = Number.isFinite(parsedCurrent) ? parsedCurrent : 0;
    if (numericText !== value) {
      setText(value > 0 ? formatWithDots(value.toString()) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (
    inputText: string,
    onValueChange: (num: number) => void
  ) => {
    // Remove display dots (thousands separator) but keep decimal point
    let rawText = inputText.replace(/^(\d{1,3})\.(?=\d{3})/g, "$1"); // Remove leading thousands dots
    
    // Remove all dots first, then normalize
    const withoutDots = rawText.replace(/\./g, "");
    const normalized = withoutDots.replace(/,/g, ".");
    const cleaned = normalized.replace(/[^0-9.]/g, "");
    
    const parts = cleaned.split(".");
    const head = parts.shift() ?? "";
    const tail = parts.join("");
    const rebuilt = tail.length
      ? `${head}.${tail}`
      : head + (normalized.endsWith(".") ? "." : "");

    // Format display with dots as thousands separator
    const displayText = formatWithDots(rebuilt);
    setText(displayText);

    const parsed = parseFloat(rebuilt);
    if (Number.isFinite(parsed)) {
      onValueChange(parsed);
    } else {
      onValueChange(0);
    }
  };

  return { text, handleChange };
}
