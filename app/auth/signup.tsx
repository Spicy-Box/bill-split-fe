import TitleAuth from "@/components/AuthPage/TitleAuth";
import { COLOR } from "@/utils/color";
import { RelativePathString, useRouter } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import { DatePickerInput } from "react-native-paper-dates";
import { useState } from "react";
import api, { apiUrl } from "@/utils/api";
import { format } from "date-fns";

export default function SignUpPage() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [inputDate, setInputDate] = useState<Date | undefined>(undefined);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const handleRegister = async () => {
    const formattedDate = format(inputDate as Date, "yyyy-MM-dd");
    const registerData = {
      first_name: firstName,
      last_name: lastName,
      email: emailInput,
      phone: phone,
      password: passwordInput,
      dob: formattedDate,
    };

    setLoading(true);
    await api.post(`${apiUrl}/users/create-user`, registerData);
    router.replace("/auth/login");
    setLoading(false);
  };

  if (loading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={"large"} color={COLOR.dark1} />
      </View>
    );

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
      <Button mode="contained" buttonColor={COLOR.dark1} onPress={handleRegister}>
        Signup
      </Button>
    </View>
  );
}
