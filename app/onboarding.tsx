import { storeData } from "@/utils/asyncStorage";
import { Button, Text } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";
import Onboarding from "react-native-onboarding-swiper";

export default function OnboardingPage() {
  const router = useRouter();

  const Btn = ({ label, onPress }: { label: string; onPress?: () => void }) =>
    label === "Next" || label === "Done" ? (
      <TouchableOpacity
        onPress={onPress}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 75,
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 999,
          backgroundColor: label === "Next" ? "#111" : "#996BFF",
          marginRight: 16,
          marginBottom: 0,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>{label}</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={onPress}
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 75,
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 999,
          backgroundColor: "#111",
          marginLeft: 16, // 🔹 Đừng để nó chạm mép
          marginBottom: 0, // 🔹 Cách nhẹ với đáy bar
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>{label}</Text>
      </TouchableOpacity>
    );

  const Dot = ({ selected }: { selected: boolean }) => {
    return (
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 6,
          marginHorizontal: 4,
          backgroundColor: selected ? "#996BFF" : "#ADB0B9", // active / inactive color
          opacity: selected ? 1 : 0.5,
          transform: [{ scale: selected ? 1.1 : 1 }],
        }}
      />
    );
  };

  const handleFinish = () => {
    storeData("onboarded", "1");
    router.replace("/");
  };

  return (
    <>
      <Onboarding
        onSkip={handleFinish}
        onDone={handleFinish}
        titleStyles={{
          color: "#000",
          fontWeight: 700,
        }}
        subTitleStyles={{
          width: 300,
          fontSize: 16,
        }}
        SkipButtonComponent={(props) => (
          <Btn label="Skip" onPress={props.onPress} />
        )}
        NextButtonComponent={(props) => (
          <Btn label="Next" onPress={props.onPress} />
        )}
        DoneButtonComponent={(props) => (
          <Btn label="Done" onPress={props.onPress} />
        )}
        DotComponent={Dot}
        pages={[
          {
            backgroundColor: "#FFF4B6",
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/Logo.png")}
              />
            ),
            title: "Divvy",
            subtitle: "Chia chuẩn, vui cùng nhau.",
          },
          {
            backgroundColor: "#FFF4B6",
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/onboard-1.png")}
              />
            ),
            title: "Nhanh, Chuẩn, Không ai thiệt!",
            subtitle:
              "Dù là đi ăn, đi chơi, hay du lịch cùng bạn bè, chỉ cần chụp hoá đơn — mọi chi phí được tự động nhận dạng và chia đều hoặc tuỳ chỉnh linh hoạt.",
          },
          {
            backgroundColor: "#FFF4B6",
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/onboard-2.png")}
              />
            ),
            title: "Không cần nhập tay — App tự đọc và chia!",
            subtitle:
              "Công nghệ OCR thông minh giúp bạn nhận diện hoá đơn, tổng tiền, từng món và người chi trả chỉ trong vài giây.",
          },
          {
            backgroundColor: "#FFF4B6",
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/onboard-3.png")}
              />
            ),
            title: "Ai trả bao nhiêu? Ai còn nợ ai?",
            subtitle:
              "Ứng dụng tự động tổng hợp chi tiết các khoản chi, hiển thị rõ ràng. Dễ dàng xuất file Excel hoặc PDF để lưu lại.",
          },
          {
            backgroundColor: "#FFF4B6",
            image: (
              <Image
                className="h-[250px]"
                resizeMode="contain"
                source={require("../assets/images/onboard-4.png")}
              />
            ),
            title: "Quét hoá đơn bằng AI",
            subtitle:
              "Công nghệ OCR thông minh giúp bạn nhận diện hoá đơn, tổng tiền, từng món và người chi trả chỉ trong vài giây.",
          },
        ]}
      />
    </>
  );
}
