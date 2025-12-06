import { Image } from "expo-image";
import { Calendar, Mail, Phone, Save, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLOR } from "@/utils/color";

// Data interfaces
interface ProfileFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
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
  dateOfBirth: "09/08/2004",
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
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);

  const handleInputChange = (name: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Profile saved:", formData);
    router.back();
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    console.log("Changes cancelled");
    router.back();
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
            <Text className="text-2xl font-medium text-dark1 font-inter">
              Profile
            </Text>

            {/* User Card */}
            <View className="bg-primary1 rounded-2xl p-4 flex-row items-center gap-3">
              <View className="w-16 h-16 rounded-full overflow-hidden border border-dark1">
                <Image
                  source={USER_PROFILE.avatarUrl}
                  style={{ width: 53, height: 53 }}
                  contentFit="cover"
                />
              </View>
              <View className="gap-1 flex-1">
                <View className="bg-dark1 px-3 py-1 rounded-sm self-start">
                  <Text className="text-light1 font-medium text-sm font-inter">
                    {USER_PROFILE.name}
                  </Text>
                </View>
                <Text className="text-xs italic font-medium text-dark1 font-inter">
                  {USER_PROFILE.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 2: Form Fields */}
          <View className="gap-4">
            {/* First Name and Last Name Row */}
            <View className="flex-row gap-4">
              {/* First Name */}
              <View className="flex-1 bg-light1 rounded-xl p-4">
                <Text className="text-xs font-medium text-primary3 font-inter">
                  First Name
                </Text>
                <TextInput
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange("firstName", value)}
                  className="text-sm text-dark1 border-b-2 border-primary3 bg-transparent py-2 font-inter"
                  placeholderTextColor="#ADB0B9"
                />
              </View>

              {/* Last Name */}
              <View className="flex-1 bg-light1 rounded-xl p-4">
                <Text className="text-xs font-medium text-primary3 font-inter">
                  Last Name
                </Text>
                <TextInput
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange("lastName", value)}
                  className="text-sm text-dark1 border-b-2 border-primary3 bg-transparent py-2 font-inter"
                  placeholderTextColor="#ADB0B9"
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View className="bg-light1 rounded-xl p-4 flex-row gap-3">
              <View className="justify-center">
                <Calendar size={28} color={COLOR.primary3} />
              </View>
              <View className="flex-1">
                 <Text className="text-xs font-medium text-primary3 font-inter">
                   Date of birth
                 </Text>
                <TextInput
                  value={formData.dateOfBirth}
                  onChangeText={(value) => handleInputChange("dateOfBirth", value)}
                  className="text-sm text-dark1 border-b-2 border-primary3 bg-transparent py-2 font-inter"
                  placeholderTextColor="#ADB0B9"
                  placeholder="DD/MM/YYYY"
                />
              </View>
            </View>

            {/* Phone */}
            <View className="bg-light1 rounded-xl p-4 flex-row gap-3">
              <View className="justify-center">
                <Phone size={28} color={COLOR.primary3} />
              </View>
              <View className="flex-1">
                 <Text className="text-xs font-medium text-primary3 font-inter">
                   Phone
                 </Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  className="text-sm text-dark1 border-b-2 border-primary3 bg-transparent py-2 font-inter"
                  placeholderTextColor="#ADB0B9"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Email */}
            <View className="bg-light1 rounded-xl p-4 flex-row gap-3">
              <View className="justify-center">
                <Mail size={28} color={COLOR.primary3} />
              </View>
              <View className="flex-1">
                 <Text className="text-xs font-medium text-primary3 font-inter">
                   Email
                 </Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  className="text-sm text-dark1 border-b-2 border-primary3 bg-transparent py-2 font-inter"
                  placeholderTextColor="#ADB0B9"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="flex-row gap-3 pt-6">
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
      </ScrollView>
    </SafeAreaView>
  );
}

