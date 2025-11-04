import TitleAuth from "@/components/AuthPage/TitleAuth";
import { COLOR } from "@/utils/color";
import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button, Checkbox, TextInput } from "react-native-paper";

type TCheckbox = "unchecked" | "checked" | "indeterminate";

export default function LoginPage() {
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [checkbox, setCheckbox] = useState<TCheckbox>("unchecked");

  return (
    <View className="gap-10">
      <TitleAuth
        title="Get Started Now"
        desc="Created an account or login to explore"
      />
      <View className="gap-4">
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
          secureTextEntry={true}
          underlineColor={COLOR.primary2}
          activeUnderlineColor={COLOR.dark1}
          textColor={COLOR.dark1}
          style={{
            backgroundColor: COLOR.light3,
          }}
          value={passwordInput}
          onChangeText={(password) => setPasswordInput(password)}
        />
        <View className="flex-row justify-between items-center">
          <Checkbox.Item
            label="Remember Me"
            position="leading"
            status={checkbox}
            color={COLOR.primary3}
            style={{
              paddingLeft: 0,
            }}
            onPress={() => {
              if (checkbox === "unchecked") setCheckbox("checked");
              else setCheckbox("unchecked");
            }}
          />
          <Text className="font-inter text-lg text-primary3 font-bold">
            Forgot password ?
          </Text>
        </View>
        <Button
          mode="contained"
          buttonColor={COLOR.dark1}
          onPress={() => console.log("hello")}
        >
          Login
        </Button>
      </View>

      <View className="flex-row gap-2 justify-center">
        <Text className="text-lg">Don&apos;t have an account?</Text>
        <Link href={"/auth/signup"} className="text-primary3 text-xl">
          Sign up
        </Link>
      </View>
    </View>
  );
}
