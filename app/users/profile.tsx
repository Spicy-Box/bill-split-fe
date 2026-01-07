import { COLOR } from "@/utils/color";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LogOut, Save, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { DatePickerModal } from "react-native-paper-dates";
import { SingleChange } from "react-native-paper-dates/lib/typescript/Date/Calendar";
import { format } from "date-fns";
import api, { apiUrl } from "@/utils/api";
import Toast from "react-native-toast-message";
import { isAxiosError } from "axios";

// Data interfaces
interface ProfileFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone: string;
  email: string;
}

interface UserUpdate {
  first_name?: string;
  last_name?: string;
  dob?: string;
  phone?: string;
  email?: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

// Data separated from UI
const INITIAL_FORM_DATA: ProfileFormData = {
  firstName: "Nguyen Tuan",
  lastName: "Anh",
  dateOfBirth: new Date("2004-08-09"),
  phone: "0909710979",
  email: "tuananhdeptrai@gmail.com",
};

const USER_PROFILE: UserProfile = {
  name: "Tuan Anh",
  email: "tuananhtramtinh@gmail.com",
  avatarUrl: require("@/assets/images/avatar-1.png"),
};

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUserFromStore = useAuthStore((state) => state.updateUser);

  const [firstName, setFirstName] = useState<string>(
    user?.first_name ?? INITIAL_FORM_DATA.firstName
  );
  const [lastName, setLastName] = useState<string>(user?.last_name ?? INITIAL_FORM_DATA.lastName);
  const [email, setEmail] = useState<string>(user?.email ?? INITIAL_FORM_DATA.email);
  const [phone, setPhone] = useState<string>(user?.phone ?? INITIAL_FORM_DATA.phone);
  const [date, setDate] = useState<Date | undefined>(
    user?.dob ? new Date(user.dob) : INITIAL_FORM_DATA.dateOfBirth
  );
  const [open, setOpen] = useState(false);

  const onDismissSingle = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle: SingleChange = useCallback(
    (params) => {
      setOpen(false);
      setDate(params.date);
    },
    [setOpen, setDate]
  );

  const handleSave = async () => {
    try {
      const updateUser: UserUpdate = {};

      if (user?.first_name !== firstName) updateUser.first_name = firstName;
      if (user?.last_name !== lastName) updateUser.last_name = lastName;
      if (user?.email !== email) updateUser.email = email;
      if (user?.phone !== phone) updateUser.phone = phone;
      if (user?.dob !== format(date as Date, "yyyy-MM-dd"))
        updateUser.dob = format(date as Date, "yyyy-MM-dd");

      const res = await api.put(`${apiUrl}/users/update-user`, updateUser);

      updateUserFromStore(updateUser);

      Toast.show({
        type: "success",
        text1: "Update profile successfully",
      });
    } catch (err: any) {
      if (isAxiosError(err)) {
        Toast.show({
          type: "error",
          text1: err.message,
        });
      }
      console.log("Lỗi khi lưu: ", err);
    }
  };

  const handleCancel = () => {
    // setFormData(INITIAL_FORM_DATA);
    router.back();
  };

  const handleLogout = async () => {
    await logout();
    Toast.show({
      type: "success",
      text1: "Logout successfully",
    });
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-light3">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Content Container */}
        <View className="p-5 gap-5">
          {/* Section 1: Title and User Card */}
          <View className="gap-4">
            <Text className="text-2xl font-medium text-dark1 font-inter">Profile</Text>

            {/* User Card */}
            <View className="bg-primary1 rounded-2xl p-4 flex-row items-center gap-3">
              <View className="w-16 h-16 rounded-full overflow-hidden border border-dark1">
                <Image
                  source={USER_PROFILE.avatarUrl}
                  style={{ width: "100%", aspectRatio: "1/1" }}
                  contentFit="cover"
                />
              </View>
              <View className="gap-1 flex-1">
                <View className="bg-dark1 px-3 py-1 rounded-sm self-start">
                  <Text className="text-light1 font-medium text-sm font-inter">
                    {user?.last_name + " " + user?.first_name}
                  </Text>
                </View>
                <Text className="text-xs italic font-medium text-dark1 font-inter">
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 2: Form Fields */}
          <View className="gap-4">
            {/* First Name and Last Name Row */}
            <View className="flex-row w-full gap-4">
              {/* First Name */}
              <View className="flex-1">
                <TextInput
                  label="First Name"
                  value={firstName}
                  onChangeText={(text) => setFirstName(text)}
                  textColor={COLOR.dark1}
                  underlineColor={COLOR.primary3}
                  activeUnderlineColor={COLOR.primary3}
                  style={{
                    backgroundColor: COLOR.light1,
                  }}
                />
              </View>

              {/* Last Name */}
              <View className="flex-1">
                <TextInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={(text) => setLastName(text)}
                  textColor={COLOR.dark1}
                  underlineColor={COLOR.primary3}
                  activeUnderlineColor={COLOR.primary3}
                  style={{
                    backgroundColor: COLOR.light1,
                  }}
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View>
              <Pressable onPress={() => setOpen(true)}>
                <TextInput
                  label="Date of birth"
                  value={format(date as Date, "yyyy-MM-dd")}
                  editable={false}
                  onFocus={() => setOpen(true)}
                  textColor={COLOR.dark1}
                  underlineColor={COLOR.primary3}
                  activeUnderlineColor={COLOR.primary3}
                  left={
                    <TextInput.Icon
                      icon="calendar"
                      color={COLOR.primary3}
                      onPress={() => setOpen(true)}
                    />
                  }
                  style={{
                    backgroundColor: COLOR.light1,
                  }}
                />
              </Pressable>

              <DatePickerModal
                locale="en"
                mode="single"
                visible={open}
                onDismiss={onDismissSingle}
                date={date}
                onConfirm={onConfirmSingle}
              />
            </View>

            {/* Phone */}
            <TextInput
              label="Phone"
              value={phone}
              onChangeText={(text) => setPhone(text)}
              keyboardType="phone-pad"
              textColor={COLOR.dark1}
              underlineColor={COLOR.primary3}
              activeUnderlineColor={COLOR.primary3}
              left={<TextInput.Icon icon={"phone"} color={COLOR.primary3} />}
              style={{
                backgroundColor: COLOR.light1,
              }}
            />

            {/* Email */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
              textColor={COLOR.dark1}
              underlineColor={COLOR.primary3}
              activeUnderlineColor={COLOR.primary3}
              left={<TextInput.Icon icon={"mail"} color={COLOR.primary3} />}
              style={{
                backgroundColor: COLOR.light1,
              }}
            />

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              className="py-3 px-4 rounded-full flex-row items-center justify-center gap-2 mt-4"
              activeOpacity={0.7}
              style={{ backgroundColor: COLOR.primary5 }}
            >
              <LogOut size={20} color="#FFFFFF" />
              <Text className="text-light1 font-medium font-inter">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons - Fixed at bottom */}
      <View className="p-5 gap-3 bg-light3">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleSave}
            className="flex-1 bg-primary3 py-3 px-4 rounded-full flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
          >
            <Save size={20} color="#FFFFFF" />
            <Text className="text-light1 font-medium font-inter">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 bg-primary2 py-3 px-4 rounded-full flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
          >
            <X size={20} color="#FFFFFF" />
            <Text className="text-light1 font-medium font-inter">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
