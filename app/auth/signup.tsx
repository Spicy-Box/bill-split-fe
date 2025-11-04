import TitleAuth from "@/components/AuthPage/TitleAuth";
import { COLOR } from "@/utils/color";
import { Link, RelativePathString } from "expo-router";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { DatePickerInput } from "react-native-paper-dates";
import { useState } from "react";

export default function SignUpPage() {
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [inputDate, setInputDate] = useState<Date | undefined>(undefined);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  return (
    <View className="gap-10">
      <TitleAuth
        title="Sign Up"
        desc="Already have an account?"
        href={"/auth/login" as RelativePathString}
        hrefDesc="Sign in"
      />

      <View className="gap-4">
        <View className="flex-row gap-4">
          <TextInput
            label="First Name"
            underlineColor={COLOR.primary2}
            textColor={COLOR.dark1}
            activeUnderlineColor={COLOR.dark1}
            style={{
              flex: 1,
              backgroundColor: COLOR.light3,
            }}
            value={firstName}
            onChangeText={(firstName) => setFirstName(firstName)}
          />
          <TextInput
            label="Last Name"
            underlineColor={COLOR.primary2}
            textColor={COLOR.dark1}
            activeUnderlineColor={COLOR.dark1}
            style={{
              flex: 1,
              backgroundColor: COLOR.light3,
            }}
            value={lastName}
            onChangeText={(lastName) => setLastName(lastName)}
          />
        </View>

        {/* Date Picker */}
        <View className="justify-center items-center my-8">
          <DatePickerInput
            locale="en"
            label="Date of birth"
            value={inputDate}
            onChange={(d) => setInputDate(d)}
            inputMode="start"
            style={{
              backgroundColor: COLOR.light3,
            }}
            underlineColor={COLOR.primary2}
            activeUnderlineColor={COLOR.dark1}
          />
        </View>
        <TextInput
          label="Phone"
          underlineColor={COLOR.primary2}
          textColor={COLOR.dark1}
          activeUnderlineColor={COLOR.dark1}
          style={{
            backgroundColor: COLOR.light3,
          }}
          value={phone}
          onChangeText={(phone) => setPhone(phone)}
        />
        <TextInput
          label="Email"
          underlineColor={COLOR.primary2}
          textColor={COLOR.dark1}
          activeUnderlineColor={COLOR.dark1}
          style={{
            backgroundColor: COLOR.light3,
          }}
          value={emailInput}
          onChangeText={(email) => setEmailInput(email)}
        />
        <TextInput
          label="Password"
          underlineColor={COLOR.primary2}
          textColor={COLOR.dark1}
          activeUnderlineColor={COLOR.dark1}
          style={{
            backgroundColor: COLOR.light3,
          }}
          secureTextEntry={true}
          value={passwordInput}
          onChangeText={(password) => setPasswordInput(password)}
        />
      </View>
      <Button
        mode="contained"
        buttonColor={COLOR.dark1}
        onPress={() => console.log("signup")}
      >
        Signup
      </Button>
    </View>
  );
}
