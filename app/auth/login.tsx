import TitleAuth from "@/components/AuthPage/TitleAuth";
import { useAuthStore } from "@/stores/useAuthStore";
import { COLOR } from "@/utils/color";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { ActivityIndicator, Button, Checkbox, TextInput } from "react-native-paper";

type TCheckbox = "unchecked" | "checked" | "indeterminate";

export default function LoginPage() {
  const router = useRouter();

  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [checkbox, setCheckbox] = useState<TCheckbox>("unchecked");

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const handleLogin = async () => {
    await login(emailInput, passwordInput);
    router.navigate("/");
  };

  if (isLoading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator animating={true} size={"large"} color={COLOR.dark1} />
      </View>
    );

  return (
    <View className="flex-1 gap-10">
      <TitleAuth title="Get Started Now" desc="Created an account or login to explore" />
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
            labelStyle={{
              fontSize: 14,
            }}
            onPress={() => {
              if (checkbox === "unchecked") setCheckbox("checked");
              else setCheckbox("unchecked");
            }}
          />
          <Link href={"/auth/forgot_password"} className="font-inter text-primary3 font-bold">
            Forgot password ?
          </Link>
        </View>
        <Button mode="contained" buttonColor={COLOR.dark1} onPress={handleLogin}>
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
