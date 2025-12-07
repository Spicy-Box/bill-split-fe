import TitleAuth from "@/components/AuthPage/TitleAuth";
import { useForgotPasswordStore } from "@/stores/useForgotPasswordStore";
import api, { apiUrl } from "@/utils/api";
import { COLOR } from "@/utils/color";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");

  const setEmail = useForgotPasswordStore((state) => state.setEmail);

  const handleResetPassword = async () => {
    try {
      setLoading(true);

      await api.post(`${apiUrl}/users/forgot-password`, {
        email: emailInput,
      });

      setEmail(emailInput);
      setLoading(false);

      router.navigate("/auth/otp");
    } catch (err: any) {
      if (isAxiosError(err)) {
        if (err.response?.status === 429) router.navigate("/auth/otp");
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={COLOR.dark1} size={"large"} />
      </View>
    );
  }

  return (
    <View className="gap-10">
      <TitleAuth title="Forgot password" desc="Please enter your email to reset password" />

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

      <Button mode="contained" buttonColor={COLOR.dark1} onPress={handleResetPassword}>
        Reset Password
      </Button>
    </View>
  );
}
