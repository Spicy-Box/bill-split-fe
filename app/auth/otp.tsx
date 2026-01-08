import TitleAuth from "@/components/AuthPage/TitleAuth";
import { useAuthStore } from "@/stores/useAuthStore";
import { useForgotPasswordStore } from "@/stores/useForgotPasswordStore";
import api, { apiUrl } from "@/utils/api";
import { COLOR } from "@/utils/color";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { ActivityIndicator, Button } from "react-native-paper";

export default function OtpPage() {
  const router = useRouter();

  const [otpText, setOtpText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const email = useForgotPasswordStore((state) => state.email);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);

      console.log(email);
      console.log(otpText);

      const response = await api.post(`${apiUrl}/users/verify-otp`, {
        code: otpText,
        email: email,
      });

      const data = response.data.data;
      console.log(data);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);

      setLoading(false);

      router.navigate("/auth/new_password");
    } catch (err: any) {
      console.log(err);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1">
        <View className="gap-10">
          <TitleAuth
            title="Check your email"
            desc="We sent an otp code to tuananhdeptrai@gmail.com Enter 5 digit code that mentioned in the email"
          />

          <OtpInput
        numberOfDigits={6}
        onTextChange={(text) => setOtpText(text)}
        focusColor={COLOR.primary3}
        theme={{
          pinCodeTextStyle: {
            fontFamily: "inter",
          },
        }}
        autoFocus={true}
      />

      <Button buttonColor={COLOR.dark1} textColor={COLOR.light1} onPress={handleVerifyOtp}>
        Verify Code
      </Button>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
      );
      }
