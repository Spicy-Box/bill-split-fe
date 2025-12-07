import TitleAuth from "@/components/AuthPage/TitleAuth";
import { useAuthStore } from "@/stores/useAuthStore";
import api, { apiUrl } from "@/utils/api";
import { COLOR } from "@/utils/color";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";

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
      logout();
      router.navigate("/auth/login");
    } catch (err: any) {
      console.log(err);
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
