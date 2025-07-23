import React, { useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

interface SixDigitCodeInputProps {
  code: string;
  setCode: (code: string) => void;
}

const SixDigitCodeInput: React.FC<SixDigitCodeInputProps> = ({
  code,
  setCode,
}) => {
  const [codeDigits, setCodeDigits] = useState<string>(
    code?.padEnd(6, " ") || "      "
  );

  const inputsRef = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "").slice(0, 1);

    const newCodeArr = codeDigits.split("");
    newCodeArr[index] = cleanText || " ";
    const newCode = newCodeArr.join("");
    setCodeDigits(newCode);
    setCode(newCode.trim());

    if (cleanText && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      codeDigits[index] === " " &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 6 }).map((_, i) => (
        <React.Fragment key={i}>
          <TextInput
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            value={codeDigits[i] === " " ? "" : codeDigits[i]}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.input}
            placeholder="1"
            placeholderTextColor="#9ca3af"
            textAlign="center"
          />
          {i < 5 && <Text style={styles.dash}>-</Text>}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  input: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    fontSize: 24,
    marginHorizontal: 4,
    backgroundColor: "white",
  },
  dash: {
    fontSize: 24,
    color: "#9ca3af",
    marginHorizontal: 2,
  },
});

export default SixDigitCodeInput;
