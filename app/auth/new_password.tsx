import TitleAuth from "@/components/AuthPage/TitleAuth";
import { useAuthStore } from "@/stores/useAuthStore";
import api, { apiUrl } from "@/utils/api";
import { COLOR } from "@/utils/color";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function SetNewPasswordPage() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");

  const logout = useAuthStore((state) => state.logout);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const handleResetPassword = async () => {
    try {
      setLoading(true);

      await api.post(`${apiUrl}/users/change-password`, {
        new_password: newPassword,
      });

      setLoading(false);
      await logout();
      Toast.show({
        type: "success",
        text1: "Change password successfully",
      });
      router.navigate("/auth/login");
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      Toast.show({
        type: "error",
        text1: "Failed to reset password",
        text2: err?.response?.data?.message || "Please try again",
      });
    }
  };

  if (loading || !hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={"large"} color={COLOR.dark1} />
      </View>
    );
  }

  return (
    <View className="gap-10">
      <TitleAuth title="Forgot password" desc="Please enter your email to reset password" />

      <TextInput
        label="New Password"
        secureTextEntry={true}
        underlineColor={COLOR.primary2}
        textColor={COLOR.dark1}
        activeUnderlineColor={COLOR.dark1}
        style={{
          backgroundColor: COLOR.light3,
        }}
        value={newPassword}
        onChangeText={(password) => setNewPassword(password)}
      />

      <Button mode="contained" buttonColor={COLOR.dark1} onPress={handleResetPassword}>
        Reset Password
      </Button>
    </View>
  );
}
