import { useEffect, useState } from "react";

export function useCurrencyInput(value: number) {
  const [text, setText] = useState(value > 0 ? value.toString() : "");

  useEffect(() => {
    const parsedCurrent = parseFloat(text);
    const numericText = Number.isFinite(parsedCurrent) ? parsedCurrent : 0;
    if (numericText !== value) {
      setText(value > 0 ? value.toString() : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (
    inputText: string,
    onValueChange: (num: number) => void
  ) => {
    const normalized = inputText.replace(/,/g, ".");
    const cleaned = normalized.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const head = parts.shift() ?? "";
    const tail = parts.join("");
    const rebuilt = tail.length
      ? `${head}.${tail}`
      : head + (normalized.endsWith(".") ? "." : "");

    setText(rebuilt);

    const parsed = parseFloat(rebuilt);
    if (Number.isFinite(parsed)) {
      onValueChange(parsed);
    } else {
      onValueChange(0);
    }
  };

  return { text, handleChange };
}
